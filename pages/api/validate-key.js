import { ChatOpenAI } from "@langchain/openai";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const userApiKey = req.headers["authorization"]?.replace("Bearer ", "");

    if (!userApiKey) {
      return res.status(401).json({ error: "Missing OpenAI API Key" });
    }

    try {
      const model = new ChatOpenAI({
        modelName: "gpt-3.5-turbo",
        openAIApiKey: userApiKey,
      });

      // Test the API key with a simple call
      await model.call("Hello");
      return res.status(200).json({ valid: true });
    } catch (err) {
      return res.status(401).json({ error: "Invalid API Key" });
    }
  } else {
    res.status(405).json({ message: "Only POST method is allowed" });
  }
}
