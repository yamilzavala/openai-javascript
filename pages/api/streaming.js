import { OpenAI } from "langchain/llms/openai";
import SSE from "express-sse";

const sse = new SSE();

export default function handler(req, res) {
  if (req.method === "POST") {
    const { input } = req.body;

    if (!input) {
      throw new Error("No input");
    }
    // Initialize model
    const chat = new OpenAI({
      modelName: "gpt-3.5-turbo",
      //Makes the model send tokens as they are generated
      streaming: true,   
      //Define functions that execute during the process              
      callbacks: [                      
        {
            //Executes every time a new token arrives and sends it to the frontend
          handleLLMNewToken(token) {  
            //Sends the token as an SSE event called newToken  
            sse.send(token, 'newToken' )
          }
        }
      ]
    })

    // create the prompt
    const prompt = `Create me a short rap about my name and city. Make it funny and punny. Name: ${input}`
    console.log({prompt})

    // call frontend to backend
    chat.call(prompt).then(() => {
      sse.send(null, 'end')
    })

    return res.status(200).json({ result: "Streaming complete" });
  } else if (req.method === "GET") {
    sse.init(req, res);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
