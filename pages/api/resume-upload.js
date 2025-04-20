// /pages/api/resume_upload.js
// Import dependencies

/**
 * This endpoint is used to load the resumes into the chain, then upload them to the Pinecone database.
 * Tutorial: https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/directory
 * Summarization: https://js.langchain.com/docs/modules/chains/other_chains/summarization
 * Dependencies: npm install pdf-parse
 */

import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";
// import { PineconeClient } from "@pinecone-database/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { loadSummarizationChain } from "langchain/chains";
import { OpenAI } from "@langchain/openai";
import { metadata } from "app/layout";

export default async function handler(req, res) {
  // Grab the prompt from the url (?prompt=[value])
  //   console.log(process.env.PINECONE_API_KEY);
  //   console.log(process.env.PINECONE_ENVIRONMENT);
  //   console.log(process.env.PINECONE_INDEX);
  // Always use a try catch block to do asynchronous requests and catch any errors
  try {
    // load directory
    const loader = new DirectoryLoader('C:/Users/yamil.zavala/Documents/Anothers/Openai-javascript-langchain/openai-javascript-course/data/resumes', {
      ".pdf": (path) => new PDFLoader(path, "/pdf")
    })

    const docs = await loader.load()

    if(docs.length === 0) {
      console.log('No docs found')
      return;
    }

    //Split the documents with their metadata - Chunk size
    const splitter = new CharacterTextSplitter({
      separator: ' ',
      chunkSize: 200,
      chunkOverlap: 20
    })

    // Split document with chunk config
    const splitDocs = await splitter.splitDocuments(docs)

    // Reduce the size of the metadata and make it more searchable
    const reduceDocs = splitDocs.map(doc => {
      const fileName = doc.metadata.source.split('/').pop();
      const [_, firstname, lastname] = fileName.split('_')
      
      return {
        ...doc,
        metadata: {
          first_name: firstname,
          last_name: lastname.slice(0,-4),
          docType: 'resume'
        }
      }
    })

    //summarize all documents
    let summaries = [];
    
    const model = new OpenAI({
      temperature: 0,
      modelName: "gpt-3.5-turbo"
    })

    const summarizeAllChain = loadSummarizationChain(model, {
      type: 'map_reduce'
    })
    
    //raw documents
    const summarizeRes = await summarizeAllChain.call({
      input_documents: docs
    })
    summaries.push({summary: summarizeRes.text})

    //Summarize each candidate
    for(let doc of docs) {
      const summarizeOneChain = loadSummarizationChain(model, {
        type: 'map_reduce'
      })
      const summarizeOneRes =  await summarizeOneChain.call({
        input_documents: [doc]
      })

      console.log('summarizeOneRes ==> ', summarizeOneRes)
      summaries.push({summary: summarizeOneRes.text})
    }
    
    //Upload the reduceDocs
    /** STEP TWO: UPLOAD TO DATABASE */
    //Inicializar cliente Pinecone
    const client = new Pinecone();

    //Seleccionar el índice a usar - Este pineconeIndex es un objeto que representa tu vector store y que se usará para guardar o consultar vectores.
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX)
    

    /*
    🔁 Recorre los documentos (reduceDocs) uno por uno
    🧠 Usa OpenAIEmbeddings para convertir el texto de cada chunk en un vector numérico
    📦 Envía esos vectores al índice de Pinecone (pineconeIndex)
    Cada vector se guarda junto con su metadata para poder buscarlo más tarde
    */
    await PineconeStore.fromDocuments(
      reduceDocs,
      new OpenAIEmbeddings({
        modelName: "text-embedding-3-small"
      }),
      {pineconeIndex}
    )

    console.log('Successfully uploaded to Database')
    const summaryStr = JSON.stringify(summaries, null, 2)
    return res.status(200).json({output: summaryStr})
  } catch (err) {
    // If we have an error

    console.error(err);
    return res.status(500).json({ error: err });
  }
}
