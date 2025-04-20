import React, { useState, useEffect } from "react";

const ApiKeyInput = ({ onSave }) => {
  const [apiKey, setApiKey] = useState("");
  const [isClient, setIsClient] = useState(false); // Add state to track client-side rendering
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsClient(true); // Set to true once the component is mounted on the client
    const storedKey = localStorage.getItem("openai_api_key");
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const validateApiKey = async (key) => {
    try {
      const resp = await fetch("/api/validate-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
      });

      if (!resp.ok) {
        throw new Error("Invalid API Key");
      }

      setError(null);
      onSave(key); // Pass the valid key to the parent component
    } catch (err) {
      setError("Invalid API Key. Please provide a valid key.");
    }
  };

  const handleSave = () => {
    validateApiKey(apiKey);
    localStorage.setItem("openai_api_key", apiKey);
  };

  if (!isClient) {
    return null; // Prevent rendering on the server
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 h-screen w-screen flex justify-center items-center">
      <div className="p-6 border rounded-lg shadow-md bg-white w-1/3 h-1/3 flex flex-col justify-center items-center">
        <h3 className="text-lg font-semibold mb-4 text-center">Enter your OpenAI API Key</h3>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API Key"
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={handleSave}
          className="w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          Save API Key
        </button>
      </div>
    </div>
  );
};

export default ApiKeyInput;
