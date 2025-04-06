import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";
import { Document } from "@langchain/core/documents";
import { Pinecone } from "@pinecone-database/pinecone";

// Example: https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/pdf
export default async function handler(req, res) {
  if (req.method === "GET") {
    console.log("Inside the PDF handler");
    // Enter your code here
    /** STEP ONE: LOAD DOCUMENT */
    const bookPath = "C:/Users/yamil.zavala/Documents/Anothers/Openai-javascript-langchain/openai-javascript-course/data/document_loaders/naval-ravikant-book.pdf";
    const loader = new PDFLoader(bookPath, {
      parsedItemSeparator: "",
    });
    
    const docs = await loader.load();

    if(docs.length === 0) {
      console.log('No docs found')
      return;
    }

    // Chunk size
    const splitter = new CharacterTextSplitter({
      separator: ' ',
      chunkSize: 250,
      chunkOverlap: 10
    })

    // Split document with chunk config
    const splitDocs = await splitter.splitDocuments(docs);

    // Reduce the size of the metadata
    const reduceDocs = splitDocs.map(doc => {
      const reduceMetadata = {...doc.metadata}
      delete reduceMetadata.pdf;
      return new Document({
        pageContent: doc.pageContent,
        metadata: reduceMetadata
      })
    })

    /** STEP TWO: UPLOAD TO DATABASE */
    //Inicializar cliente Pinecone
    const client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });

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
        modelName: "text-embedding-3-small" // ✅ modelo actual
      }),
      {
        pineconeIndex,
      }
    );

    console.log('Successfully uploaded to Database')
    
    // return res.status(200).json({ result: docs });
    return res.status(200).json({ result: 'OK' });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
