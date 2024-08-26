import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  CircularProgress,
  Chip,
  IconButton,
  Avatar
} from '@mui/material';
import { Edit, CalendarToday, People } from '@mui/icons-material';
import TaskList from './taskList';

function ContentPlanDetails() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { id } = useParams();
  const campaignText = location.state?.campaign_text;

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://btheahs--content-plan-app-fastapi-app-dev.modal.run/content-plan');
        setPlan(campaignText);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching content plan:', error);
        setError('Failed to load content plan. Please try again.');
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!plan) return <Typography>No plan found</Typography>;

  // Split the campaign text by semicolons
  console.log("do we have campaignText???", campaignText.split(";"))
  const tasks = campaignText.split(';').map(task => task.trim());
  
  return (
    <Box>
      <Box sx={{ flex: 1 }}>
        <TaskList tasks={tasks} contentPlan={campaignText} />
      </Box>
    </Box>
  );
}

export default ContentPlanDetails;
