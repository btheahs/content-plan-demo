import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import axios from 'axios';

const ChatbotComponent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      

      const response = await axios.post('https://btheahs--content-plan-app-fastapi-app-dev.modal.run/campaign', userMessage);

      if (response.data && response.data.campaign_text) {
        const botMessage = { text: response.data.campaign_text, sender: 'bot' };
        console.log("is here")
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { text: 'Sorry, there was an error processing your request.', sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6 m-4 flex-grow overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <MessageSquare className="mr-2" />
          Chatbot
        </h2>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.sender === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
              } max-w-xs`}
            >
              {message.text}
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-4 m-4">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatbotComponent;