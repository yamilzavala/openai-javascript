import { ChatOpenAI } from "@langchain/openai";
import { LLMChain } from "langchain/chains";
import { ZeroShotAgent } from "langchain/agents";
// import {
//   ChatPromptTemplate,
//   HumanMessagePromptTemplate,
//   SystemMessagePromptTemplate
// } from "@langchain/core/prompts";
import { AgentExecutor } from "langchain/agents";
import SerpAPITool from "../tools/SerpAPI";
import WebBrowserTool from "../tools/WebBrowser";

const ResearchAgent = async (topic) => {
  try {
    // Tools
    const SerpAPI = SerpAPITool();
    const WebBrowser = WebBrowserTool();

    const tools = [SerpAPI, WebBrowser];

    // Prompt
    const prompt = ZeroShotAgent.createPrompt(tools, {
      prefix: `Answer the following questions as best you can. You have access to the following tools:`,
      suffix: `Begin! Answer concisely. It's OK to say you don't know.`,
      inputVariables: ["input", "agent_scratchpad"],
    });

    //Chat Open AI (model/LLM)
    const chat = new ChatOpenAI({temperature: 0.8, modelName: "gpt-3.5-turbo"});

    //LLM chain = template + LLM
    const llmChain = new LLMChain({
      prompt,
      llm: chat,
    });

    //Agent = tools + llm + prompt template
    const agent = new ZeroShotAgent({
      llmChain,
      allowedTools: tools.map((tool) => tool.name),
    });

    const executor = AgentExecutor.fromAgentAndTools({
      agent,
      tools,
      returnIntermediateSteps: false,
      maxIterations: 3,
      verbose: true,
    });

    const result = await executor.run(`Who is ${topic}?`);
    return result;
  } catch (err) {
    console.error(err);
  }
};

export default ResearchAgent;
