import React from 'react';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const navigate = useNavigate();

  const handleAddProject = () => {
    navigate('/projects/new');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/*}
      <img 
        src="/api/placeholder/400/300" 
        alt="No projects illustration" 
        className="mb-8 w-64"
      />*/}
      <h2 className="text-2xl font-semibold mb-2">No projects yet! </h2>
      <p className="text-gray-600 mb-6">Let's add one</p>
      <button 
        onClick={handleAddProject}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md flex items-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Project
      </button>
    </div>
  );
};

export default Projects;
