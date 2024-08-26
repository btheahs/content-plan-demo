import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import ContentPlanForm from './ContentPlanForm';
import ContentPlanDetails from './ContentPlanDetails';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard.js'
import Projects from './projects.js'
import ChatbotComponent from './chatBot.js';


function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar />
        <main className="App-main">
          <Routes>
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<ContentPlanForm/>} />
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/plan/:id" element={<ContentPlanDetails />} />
            <Route path="/chatbot" element={<ChatbotComponent />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;