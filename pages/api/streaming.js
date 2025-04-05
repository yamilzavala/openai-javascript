import { OpenAI } from "@langchain/openai";
import SSE from "express-sse";

const sse = new SSE();

export default function handler(req, res) {
  if (req.method === "POST") {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: "No input" });
    }

    const chat = new OpenAI({
      modelName: "gpt-3.5-turbo",
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token) {
            sse.send(token, "newToken");
          },
        },
      ],
    });

    const prompt = `Create me a short rap about my name and city. Make it funny and punny. Name: ${input}`;
    console.log({ prompt });

    // ⚠️ No usar await aquí para no bloquear el streaming
    chat.call(prompt).then(() => {
      sse.send(null, "end");
    }).catch((err) => {
      console.error("Error in streaming call:", err);
      sse.send("[Error generating response]", "newToken");
      sse.send(null, "end");
    });

    // Importante: responder al frontend inmediatamente
    return res.status(200).json({ result: "Streaming started" });

  } else if (req.method === "GET") {
    sse.init(req, res); // inicia canal SSE
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
