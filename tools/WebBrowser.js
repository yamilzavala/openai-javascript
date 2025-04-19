import { WebBrowser } from "langchain/tools/webbrowser";
import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";

const WebBrowserTool = () => {
  // not creative
  const model = new ChatOpenAI({temperature: 0, modelName: "gpt-3.5-turbo"})
  const embeddings = new OpenAIEmbeddings({})
  const browser = new WebBrowser({model, embeddings})
  browser.returnDirect = true;
  return browser;
};

export default WebBrowserTool;
