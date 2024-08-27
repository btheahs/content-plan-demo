import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  TextField,
  Avatar,
  Chip,
  Button,
  Select,
  MenuItem,
} from '@mui/material';
import { Close, AttachFile, Link as LinkIcon } from '@mui/icons-material';

const TaskDetailsModal = ({ open, onClose, task }) => {
  const [status, setStatus] = useState(task?.status || 'In Progress');

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  if (!task) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      PaperProps={{
        style: {
          borderRadius: '12px',
          width: '700px',
        },
      }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {task.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Select
            value={status}
            onChange={handleStatusChange}
            sx={{
              height: '32px',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '&.MuiOutlinedInput-root': {
                backgroundColor: status === 'In Progress' ? '#E6F7FF' : '#F0F0F0',
                borderRadius: '16px',
              },
              '& .MuiSelect-select': {
                paddingTop: '4px',
                paddingBottom: '4px',
              },
            }}
          >
            <MenuItem value="To Do">To Do</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Done">Done</MenuItem>
          </Select>
          <Typography variant="body2">Estimated Revenue: {task.revenue || 'N/A'}</Typography>
        </Box>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder={`Suggested Headlines:
 "Versatile Style: One Bag, Two Looks"
 "Transform Your Look with a Hover"

Body Suggestions:
Discover our innovative bag design that offers two distinct styles in one. Hover over the image to see how it transitions from a classic handheld look to a chic shoulder-strap option. Perfect for the fashion-forward individual who values versatility and style.`}
          sx={{ mb: 2 }}
        />
        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Task Attachments (3)
          </Typography>
          <Box display="flex" gap={2}>
            <Box
              component="img"
              src="/api/placeholder/100/75"
              alt="site screens"
              sx={{ width: 100, height: 75, objectFit: 'cover', borderRadius: '4px' }}
            />
            <Box
              component="img"
              src="/api/placeholder/100/75"
              alt="wireframes"
              sx={{ width: 100, height: 75, objectFit: 'cover', borderRadius: '4px' }}
            />
          </Box>
          <Button 
            startIcon={<LinkIcon />} 
            sx={{ mt: 1, color: '#1890ff', textTransform: 'none' }}
          >
            Zip bag photos
          </Button>
        </Box>
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Recent Activity
          </Typography>
          <Box display="flex" alignItems="center" mb={1}>
            <Avatar src="/api/placeholder/40" sx={{ width: 40, height: 40, mr: 2 }} />
            <Box>
              <Typography variant="subtitle2">Oscar Holloway</Typography>
              <Typography variant="body2" color="text.secondary">Illustrator</Typography>
            </Box>
          </Box>
          <Typography variant="body2" mb={2}>
            Updated the status of Weekly Content task to In Progress
          </Typography>
          <Box display="flex" alignItems="center">
            <Avatar src="/api/placeholder/40" sx={{ width: 40, height: 40, mr: 2 }} />
            <Box>
              <Typography variant="subtitle2">Marly K</Typography>
              <Typography variant="body2" color="text.secondary">Marketing Director</Typography>
            </Box>
          </Box>
          <Typography variant="body2">
            Updated the status of Weekly Content task to To Do
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsModal;