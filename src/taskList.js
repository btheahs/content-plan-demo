import React, { useState } from 'react';
import { Typography, Box, Paper, Grid, Avatar, Chip, IconButton, Button } from '@mui/material';
import { Edit, Delete, FilterList, ViewKanban, CalendarToday } from '@mui/icons-material';
import TaskDetailsModal from './taskModal';

const TaskList = ({ tasks }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const parseTask = (taskString) => {
    const [name, time_estimate, assignee, priority, status, revenue] = taskString.split(',').map(part => part.trim());
    return { name, time_estimate, assignee, priority, status, revenue };
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#FF4D4F';
      case 'medium': return '#FAAD14';
      case 'low': return '#52C41A';
      default: return '#1890FF';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'done': return '#52C41A';
      case 'in progress': return '#1890FF';
      case 'to do': return '#8C8C8C';
      case 'in review': return '#722ED1';
      default: return '#8C8C8C';
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  const parsedTasks = tasks.map(taskString => parseTask(taskString));

  if (parsedTasks.length === 0) {
    return <Typography>No tasks found</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Tasks</Typography>
        <Box>
          <Button
            variant="contained"
            sx={{ mr: 2, bgcolor: '#f0f0f0', color: 'black', '&:hover': { bgcolor: '#e0e0e0' } }}
          >
            <ViewKanban sx={{ mr: 1 }} /> Kanban
          </Button>
          <Button
            variant="contained"
            sx={{ mr: 2, bgcolor: '#f0f0f0', color: 'black', '&:hover': { bgcolor: '#e0e0e0' } }}
          >
            <CalendarToday sx={{ mr: 1 }} /> Calendar
          </Button>
          <Button
            variant="contained"
            startIcon={<FilterList />}
            sx={{ mr: 2, bgcolor: 'white', color: 'black', '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
          >
            + Add Task
          </Button>
        </Box>
      </Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Active Tasks</Typography>
      <Grid container spacing={2}>
        {parsedTasks.map((task, index) => (
          <Grid item xs={12} key={index}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 2,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#f0f9ff' },
                border: '1px solid #e5e7eb'
              }}
              onClick={() => handleTaskClick(task)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{task.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flex: 2 }}>
                <Typography variant="body2" color="text.secondary">Estimate: {task.time_estimate}</Typography>
                <Typography variant="body2" color="text.secondary">Revenue: {task.revenue}</Typography>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                  {task.assignee?.charAt(0) || 'U'}
                </Avatar>
                <Chip
                  label={task.priority}
                  size="small"
                  sx={{ 
                    bgcolor: 'transparent',
                    color: getPriorityColor(task.priority),
                    border: `1px solid ${getPriorityColor(task.priority)}`,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
                <Chip
                  label={task.status}
                  size="small"
                  sx={{ 
                    bgcolor: getStatusColor(task.status),
                    color: 'white',
                    '& .MuiChip-label': { px: 5 }
                  }} 
                />
                <IconButton size="small">
                  <Edit fontSize="small" />
                  <Delete fontSize="small"/>
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <TaskDetailsModal 
        open={modalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
      />
    </Box>
  );
};

export default TaskList;
