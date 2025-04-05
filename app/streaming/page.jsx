"use client";
import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import PromptBox from "../components/PromptBox";
import ResultStreaming from "../components/ResultStreaming";
import Title from "../components/Title";
import TwoColumnLayout from "app/components/TwoColumnLayout";

const Streaming = () => {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);
  const [data, setData] = useState("");
  const [source, setSource] = useState(null);
  //   add code

  const processToken = (token) => {
    return token.replace(/\\n/g, "\n").replace(/\"/g, "");
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  //User write something and do submit
  const handleSubmit = async () => {
    try {
      //the message is send to backend
      await fetch('/api/streaming', {
        method: 'POST',
        headers: {
          'Content-Type':'application/json'
        },
        body: JSON.stringify({input: prompt})
      })

      //close existing sources
      if(source) {
        source.close()
      }

      //It is making a GET request, and that triggers: sse.init(req, res)
      //an EventSource connection is established to receive the tokens that form the response.
      //create new eventsource
      const newSource = new EventSource('/api/streaming')
      setSource(newSource);

      //Each received token is processed and displayed on the screen
      newSource.addEventListener('newToken', (e) => {
        const token = processToken(e.data)
        setData((prevData) => prevData + token)
      })

      //Finally, the server sends an end event and the connection is closed.
      newSource.addEventListener('end', () => {
        newSource.close()
      })
    } catch (err) {
      console.error(err);
      setError(error);
    }
  };

  // When the component unmounts (for example, if the user navigates to another page), the EventSource connection is closed to prevent memory leaks or hanging connections.
  // Clean up the EventSource on component unmount
  useEffect(() => {
    return () => {
      if(source) {
        source.close()
      }
    }
  }, [source])
  
  return (
    <>
      <Title emoji="💭" headingText="Streaming" />
      <TwoColumnLayout
        leftChildren={
          <>
            <PageHeader
              heading="Spit a Rap."
              boldText="Nobody likes waiting for APIs to load. Use streaming to improve the user experience of chat bots."
              description="This tutorial uses streaming.  Head over to Module X to get started!"
            />
          </>
        }
        rightChildren={
          <>
            <ResultStreaming data={data} />
            <PromptBox
              prompt={prompt}
              handlePromptChange={handlePromptChange}
              handleSubmit={handleSubmit}
              placeHolderText={"Enter your name and city"}
              error={error}
              pngFile="pdf"
            />
          </>
        }
      />
    </>
  );
};

export default Streaming;
