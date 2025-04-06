import { Pinecone } from "@pinecone-database/pinecone";
import { VectorDBQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "@langchain/openai";
import { OpenAI } from "@langchain/openai";
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";

// Example: https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/pdf
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    console.log("Query PDF");

    // Grab the user prompt
    const { input } = req.body;

    if (!input) {
      throw new Error("No input");
    }

    console.log("input received:", input);

    /* Use as part of a chain (currently no metadata filters) */

    // Initialize Pinecone
    const client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    })
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX)

    // Search!
    // Crea el vector store (reconecta con los datos guardados)
    const vectoreStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex }
    )

    // Esto crea un modelo LLM que LangChain usará para redactar la respuesta final.
    const llm = new OpenAI({
      modelName: "gpt-3.5-turbo"
    });
    
    /*
    crea una "chain" que:
      🔁 Usa el input del usuario
      🔍 Hace una búsqueda semántica (top k=1 más relevante)
      📚 Recupera el chunk correspondiente
      🧠 Le pasa ese chunk al modelo para que lo use como contexto
      💬 Devuelve una respuesta natural
      📎 También incluye el texto fuente (útil para trazabilidad)    
    */
    const chain = VectorDBQAChain.fromLLM(
      llm, 
      vectoreStore, 
      {
        k:5,
        returnSourceDocuments: true
      }
    )

    const response = await chain.call({query: input})

    return res.status(200).json({ result: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
