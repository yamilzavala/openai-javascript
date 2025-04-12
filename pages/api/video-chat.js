// /pages/api/transcript.js
import { YoutubeTranscript } from "youtube-transcript";
import { ChatOpenAI } from "@langchain/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "@langchain/openai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

function decodeHtml(html) {
  return html
    .replace(/&amp;#39;/g, "'")  // special case that appears a lot
    .replace(/&#39;/g, "'")     // simple quote
    .replace(/&quot;/g, '"')    // doble quote
    .replace(/&amp;/g, "&");    // ampersand
}

// Global variables
let chain;
let chatHistory = [];
let uiChatHistory = [];  

// DO THIS SECOND
const initializeChain = async (initialPrompt, transcript) => {
  try {
    const model = new ChatOpenAI({
      temperature: 0.8,
      modelName: "gpt-3.5-turbo"
    })

    /*
    HNSWLib is a local, in-memory vector database, useful for:
    Storing text embeddings (OpenAIEmbeddings)
    Performing fast similarity searches
    In this case, it converts the video transcript into vectors so the model can search for video fragments related to a question.

    Passing the transcript directly is possible but doesn't scale.
    Problems with direct transcript usage:
    The LLM has a token limit
    It cannot read an entire long video
    Intelligent search is not possible
    By using HNSWLib, you can:
    Split the transcript into chunks
    Embed each chunk
    Search only the most relevant ones for the question
    */
    const vectorStore = await HNSWLib.fromDocuments(
      [{pageContent: transcript}],
      new OpenAIEmbeddings()
    )

    /*
    Chain is an instance of a "processing chain" in LangChain.
    It is an object that defines how information flows between the user, the documents, and the LLM model.

    ConversationalRetrievalQAChain is a special type of Chain in LangChain that:
    >Performs semantic search over embedded documents
    >Maintains a conversation history
    >Allows the LLM to provide contextualized responses
    */
     chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever(),
      {verbose: true}
    )

    // Save the initial message
     chatHistory.push(new HumanMessage(initialPrompt));
     uiChatHistory.push({ role: "user", content: initialPrompt });

    /*
    chain.call:
    "question" (your prompt) is converted into a vector
    vectorStore performs similarity matching with chunks of the transcript
    The k most similar chunks are returned (default k=4)
    These chunks are passed as context to the LLM
    The LLM generates a response using that data
    */ 
    const response = await chain.call({
      question: initialPrompt,
      chat_history: chatHistory
    })

    // Save the response
    chatHistory.push(new AIMessage(response.text));
    uiChatHistory.push({ role: "assistant", content: response.text });

    return response;
  } catch (error) {
    console.error(error);
  }
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    // DO THIS FIRST
    const {prompt, firstMsg} = req.body;

    // Then if it's the first message, we want to initialize the chain, since it doesn't exist yet
    if (firstMsg) {
      try {
        // const initialPrompt = `Give a summary of the transcript: ${prompt}`;
        const initialPrompt = `Summarize what the video is about, based only on the transcript.`;

        // 👉 For LangChain
        chatHistory.push(new HumanMessage(initialPrompt));
        // 👉 For frontend
        uiChatHistory.push({
          role: "user",
          content: initialPrompt,
        });

        //youtube transcript api
        const transcriptResponse = await YoutubeTranscript.fetchTranscript(prompt);

        if(!transcriptResponse) {
          return res.status(400).json({error: 'Failed to get transcript'})
        }

        let transcript = '';
        transcriptResponse.forEach(line => {
          transcript += decodeHtml(line.text);
        })

        //initializing the chain
        const response = await initializeChain(initialPrompt, transcript)

        // And then we'll jsut get the response back and the chatHistory
        return res.status(200).json({ output: response, uiChatHistory });
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching transcript" });
      }
    } else {
      
      try {
        // If it's not the first message, we can chat with the bot
        // We save the initial message
        chatHistory.push(new HumanMessage(prompt));
        uiChatHistory.push({ role: "user", content: prompt });
    
        const response = await chain.call({
          question: prompt,
          chat_history: chatHistory
        })
    
        // Save the response
        chatHistory.push(new AIMessage(response.text));
        uiChatHistory.push({ role: "assistant", content: response.text });

        return res.status(200).json({ output: response, uiChatHistory });
      } catch (error) {
        // Generic error handling
        console.error(error);
        res
          .status(500)
          .json({ error: "An error occurred during the conversation." });
      }
    }
  }
}
