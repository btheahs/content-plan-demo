import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, Calendar, Upload, Paperclip, Link } from 'lucide-react';

const ContentPlanForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    tags: '',
    key_metrics: '',
    description: '',
    project_name: '',
    start_date: '',
    deadline_date: '',
    priority: 'Medium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('https://btheahs--content-plan-app-fastapi-app-dev.modal.run/campaign', formData);
      console.log("success", response);
      const { id, campaign_text } = response.data;
      console.log("response issss", response.data.campaign_text)
      navigate(`/plan/${id}`, { state: { campaign_text: response.data.campaign_text } });
    } catch (error) {
      console.error('Error creating content plan:', error);
      setError('Failed to create content plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Add Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                placeholder="Project Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starts</label>
              <div className="relative">
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md pr-10"
                  required
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dead Line</label>
              <div className="relative">
                <input
                  type="date"
                  name="deadline_date"
                  value={formData.deadline_date}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md pr-10"
                  required
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                placeholder="Enter tags separated by commas"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Metrics</label>
              <input
                type="text"
                name="key_metrics"
                value={formData.key_metrics}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                placeholder="e.g. Sell through percentage, margin, conversion "
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full p-2 border rounded-md"
                placeholder="Add some description of the project. Tell us how many task you'd like to create, repeat rate, assignee, due time..."
                required
              ></textarea>
            </div>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <div className="mt-6 flex justify-between items-center">
            <div className="flex space-x-2">
              <button type="button" className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                <Paperclip size={20} />
              </button>
              <button type="button" className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                <Link size={20} />
              </button>
            </div>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
        <div className="p-6 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Upload files</h3>
              <p className="text-sm text-gray-500">Upload your previous task files so our AI can quickly assist you in generating new tasks.</p>
            </div>
            <div className="border-2 border-dashed border-blue-300 rounded-md p-4">
              <Upload className="text-blue-500" size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPlanForm;