"use client";
import PageHeader from '../components/PageHeader' 
import PrompBox from '../components/PromptBox' 
import Title from '../components/Title' 
import TwoColumnLayout from '../components/TwoColumnLayout' 
import ResultWithSources from '../components/ResultWithSources' 
import Loading from "../components/Loading";
import '../globals.css'

import React, { useState } from 'react';

const Memory = () => {
    const [prompt, setPrompt] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: "bot",
            text: "Hi there! what's your name and favourite food?"
        }
    ])
    const [firstMsg, setFirstMsg] = useState(true);

    async function handleSubmitPrompt() {
        console.log('Sending...', prompt)
        //call Open AI model api call
        try {    
            //add user message
            setMessages((prevMsgs) => [...prevMsgs, {text: prompt, type:'user', sourceDocuments: null}])
            setLoading(true)
            const resp = await fetch('api/memory', {
                method: 'POST',
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({input: prompt, firstMsg})
            })

            if(!resp.ok) {
                throw new Error(`HTTP Error! Status: ${resp.status}`)
            }           

            setPrompt("");
            //so we don't reinitialize the chain
            setFirstMsg(false);

            const data = await resp.json()
            //add bot message
            setMessages((prevMsgs) => [
                ...prevMsgs, 
                { text: data.output.response, type:'bot', sourceDocuments: null }
            ])
            //clear errors
            setError('')
        } catch (error) {
            setError(error)
        } finally {
            setLoading(false)
        }
    }

    function handlePromptChange(e) {
        setPrompt(e.target.value)
    }

    return (
        <>
          {loading && (
            <Loading/>
          )}

          <Title headingText={"Memory"} emoji={"🧠"} />

          <TwoColumnLayout            
            leftChildren={<>
                <PageHeader 
                    heading="I remember everything"
                    boldText="Let's see if it can remember your name and favourite food. This tool will let you ask anything contained in a PDF document. "
                    description="This tool uses Buffer Memory and Conversation Chain.  Head over to Module X to get started!"
                />
            </>}

            rightChildren={<>
                <ResultWithSources 
                    messages={messages} 
                    pngFile="brain" 
                    maxMsgs
                />
                <PrompBox
                     prompt={prompt}
                     handleSubmit={handleSubmitPrompt}
                     handlePromptChange={handlePromptChange}
                     error={error}
                />
            </>}
          />
        </>
    );
};

export default Memory;