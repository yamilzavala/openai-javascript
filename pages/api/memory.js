import { OpenAI } from "langchain/llms/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";

let memory;
let model;
let chain;

export default async function handler(req, res) {
    if(req.method === 'POST') {
        const {input, firstMsg} = req.body;
    
        if(!input) {
            throw new Error("Input required!")
        }

        //start open ai connection
        if(firstMsg) {
            console.log('Initializing chain...')
            model = new OpenAI({
                modelName: "gpt-3.5-turbo"
            })
            memory = new BufferMemory() 
            chain = new ConversationChain({llm: model, memory})
        }
           
        const result = await chain.call({input})
        //end open ai connection    
        return res.status(200).json({output: result})   
    } else {
        res.status(405).json({message: "Only POST method is allowed"})
    }
} 

const open = OpenAI