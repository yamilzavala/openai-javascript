/**
 * This endpoint is used to load the resumes into the chain, then upload them to the Pinecone database.
 * Tutorial: https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/directory
 * Summarization: https://js.langchain.com/docs/modules/chains/other_chains/summarization
 * Dependencies: npm install pdf-parse
 */

import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
// import { PineconeClient } from "@pinecone-database/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from "@langchain/openai";
import { VectorDBQAChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

export default async function handler(req, res) {
  try {
    //get prompt
    const {prompt} = req.body;

    //Inicializar cliente Pinecone
    const client = new Pinecone();

    //Seleccionar el índice a usar - Este pineconeIndex es un objeto que representa tu vector store y que se usará para guardar o consultar vectores.
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX)

    /*
    🧠 Usa OpenAIEmbeddings para convertir el texto en un vector numérico
    📦 Envía esos vectores al índice de Pinecone (pineconeIndex)
    */
    const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({
          modelName: "text-embedding-3-small"
        }),
        {pineconeIndex}
    )

    // model
    const model = new OpenAI({
      temperature: 1,
      modelName: "gpt-3.5-turbo"
    })

    //VectorDBQAChain use for ask to vector database
    //Create Vector DBQA CHain - this allows us to return the top results for the given query
    const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
      k: 4,
      returnSourceDocuments: true,
    })

    // Prompt Template
    const promptTemplate = new PromptTemplate({
      template: `Assume you are a Human Resources Director. According to the resumes, answer this question: {question}`,
      inputVariables: ['question']
    })

    //format the prompt with the prompt that the user gave us
    const formattedPrompt = await promptTemplate.format({
      question: prompt
    })

    const response = await chain.call({
      query: formattedPrompt
    })

    return res.status(200).json({
      output: response.text,
      sourceDocuments: response.sourceDocuments,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error" });
  }
}
