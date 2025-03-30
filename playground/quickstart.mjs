import { OpenAI } from "langchain/llms/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { SerpAPI } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { PlanAndExecuteAgentExecutor } from "langchain/experimental/plan_and_execute";
import { exec } from "child_process";

/*
Note: for execute this file
from Bash terminal:
    export OPENAI_API_KEY=yourApiKey
    export SERPAPI_API_KEY=yourApiKey

from Power shell
    set OPENAI_API_KEY=yourApiKey
    set SERPAPI_API_KEY=yourApiKey
*/

// export OPENAI_API_KEY=<>
// export SERPAPI_API_KEY=<>
// Replace with your API keys!

// to run, go to terminal and enter: cd playground
// then enter: node quickstart.mjs
// console.log("Welcome to the LangChain Quickstart Module!");

//prompt config - template + prompt config - prompt format

/*

// const formattedPromptTemplate = await promp.format({
//     topic: "artificial intelligience",
//     socialplatform: "twitter",
//     language: "spanish"
// })
// console.log({formattedPromptTemplate})


#1. LLM Chain => Simple prompt
Define model + prompt config ()
   Template (role + topic/quetion) + prompt config (format) + model config + executor (prompt, model) + inputs + executor call
*/

// const template = 'You are a director of social media with 30 years of experience. Please give some ideas for content I should write about regarding {topic}. The content is for {socialplatform}. Translate to {language}.';

// const prompt = new PromptTemplate({
//     template: template,
//     inputVariables: [
//         "topic",
//         "socialplatform",
//         "language",
//     ]
// })

// const model = new OpenAI({
//     temperature: 0.9,
//     modelName: "gpt-3.5-turbo", // Updated to a supported model
// });

// const chain = new LLMChain({prompt: prompt, llm: model})
// const resChain = await chain.call({
//     topic: "artificial intelligience",
//     socialplatform: "twitter",
//     language: "english"
// })
//console.log({resChain})



/*
#2.AGENT (think by itself - declarative type)
Agent = tasks + tools + template => by itself figurate what to do
Define agentModel config + tools config + executor(tools, agentModel) + inputs + executor call
*/
// const agentModel = new OpenAI({
//     temperature: 0,
//     modelName: "gpt-3.5-turbo",
// })

// const tools = [
//     new SerpAPI(process.env.SERPAPI_API_KEY, {
//         location: 'Dallas,Texas,United States',
//         hl: "en",
//         gl: "us"
//     }),
//     new Calculator()
// ]

// const executor = await initializeAgentExecutorWithOptions(tools, agentModel, {
//     agentType: "zero-shot-react-description",
//     verbose: true,
//     maxIterations: 5
// });

// const input = "What is langchain?";
// const result = await executor.call({input})
//console.log({result})


/*
#3. Plan and action AGENT
Define model + agent config + tools config + inputs + executor call
*/
// const chatModel = new ChatOpenAI({
//     temperature: 0,
//     verbose: true,
//     modelName: "gpt-3.5-turbo"
// })

// const executorChat = PlanAndExecuteAgentExecutor.fromLLMAndTools({
//     llm: chatModel,
//     tools
// })

// const chatResult = await executorChat.call({
//     input: "Who is the current president of the United States? What is their current age raised to the second power?"
// })
// console.log({chatResult})


/*
#4. MEMORY
Define model + agent config + inputs + executor call
*/
const llm = new OpenAI({
    modelName: "gpt-3.5-turbo"
});
const memory = new BufferMemory();
const conversationChain = new ConversationChain({llm, memory})

const memoryResult1 = await conversationChain.call({
    input: "Hey, my name is yamil"
})
console.log({memoryResult1})

const memoryResult2 = await conversationChain.call({
    input: "What's my name?"
})
console.log({memoryResult2})



