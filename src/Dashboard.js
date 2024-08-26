import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';

function Dashboard() {
  const [formData, setFormData] = useState({
    tags: '',
    time_frame: '',
    description: '',
    //owner: '',
    //assignees: [],
    //priority: 'High',
    //deadline: '',
    //tasks: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('https://btheahs--content-plan-app-fastapi-app-dev.modal.run/campaign', formData);
      console.log("success", response)
      const { id, campaign_text } = response.data;
      // Navigate to the details page, passing the campaign text
      navigate(`/plan/${id}`, { state: { campaign_text: response.data.campaign_text } });
;
    } catch (error) {
      console.error('Error creating content plan:', error);
      setError('Failed to create content plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>Create Content Plan</Typography>
      <TextField
        fullWidth
        margin="normal"
        name="tags"
        label="tags"
        value={formData.tags}
        onChange={handleChange}
        required
      />

      <TextField
        fullWidth
        margin="normal"
        name="time_frame"
        label="time_frame"
        value={formData.time_frame}
        onChange={handleChange}
        required
      />
      <TextField
        fullWidth
        margin="normal"
        name="description"
        label="description"
        value={formData.description}
        onChange={handleChange}
        required
      />
      
      {error && <Typography color="error">{error}</Typography>}
      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        sx={{ mt: 2 }}
        disabled={loading}
        onChange={handleChange}
      >
        {loading ? <CircularProgress size={24} /> : 'Create Plan'}
      </Button>
    </Box>
  );
}

export default Dashboard;