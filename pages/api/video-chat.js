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

    //HNSWLib
    const vectorStore = await HNSWLib.fromDocuments(
      [{pageContent: transcript}],
      new OpenAIEmbeddings()
    )

    // const directory = 'C:/Users/yamil.zavala/Documents/Anothers/Openai-javascript-langchain/openai-javascript-course'
    // await vectorStore.save(directory)

    // const loadVectorStore = await HNSWLib.load(
    //   directory,
    //   new OpenAIEmbeddings()
    // );

    chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever(),
      {verbose: true}
    )

     // Guardamos el mensaje inicial
     chatHistory.push(new HumanMessage(initialPrompt));
     uiChatHistory.push({ role: "user", content: initialPrompt });

    const response = await chain.call({
      question: initialPrompt,
      chat_history: chatHistory
    })

    // Guardamos la respuesta
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

      // do this third!
    } else {
      
      try {
        // If it's not the first message, we can chat with the bot
        // Guardamos el mensaje inicial
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
