import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Box, Paper, Typography } from '@mui/material';

const KanbanView = ({ tasks }) => {
  const columns = ['To Do', 'In Progress', 'Done'];

  const parseTask = (taskString) => {
    const [name, time_estimate, assignee, priority, revenue] = taskString.split(',').map(part => part.trim());
    return { id: name, name, time_estimate, assignee, priority, revenue: parseFloat(revenue.replace('$', '')) };
  };

  const parsedTasks = tasks.map(parseTask);

  const [boardTasks, setBoardTasks] = React.useState({
    'To Do': parsedTasks,
    'In Progress': [],
    'Done': []
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = boardTasks[source.droppableId];
      const destColumn = boardTasks[destination.droppableId];
      const [removed] = sourceColumn.splice(source.index, 1);
      destColumn.splice(destination.index, 0, removed);
      setBoardTasks({
        ...boardTasks,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn
      });
    } else {
      const column = boardTasks[source.droppableId];
      const [removed] = column.splice(source.index, 1);
      column.splice(destination.index, 0, removed);
      setBoardTasks({
        ...boardTasks,
        [source.droppableId]: column
      });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box display="flex" justifyContent="space-between">
        {columns.map(columnId => (
          <Box key={columnId} width="30%" bgcolor="#f5f5f5" p={2} borderRadius={2}>
            <Typography variant="h6" gutterBottom>{columnId}</Typography>
            <Droppable droppableId={columnId}>
              {(provided) => (
                <Box ref={provided.innerRef} {...provided.droppableProps} minHeight="200px">
                  {boardTasks[columnId].map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          elevation={3}
                          sx={{ p: 2, mb: 2, bgcolor: 'white' }}
                        >
                          <Typography variant="subtitle1">{task.name}</Typography>
                          <Typography variant="body2">Estimate: {task.time_estimate}</Typography>
                          <Typography variant="body2">Assignee: {task.assignee}</Typography>
                          <Typography variant="body2">Priority: {task.priority}</Typography>
                          <Typography variant="body2">Revenue: ${task.revenue}</Typography>
                        </Paper>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Box>
        ))}
      </Box>
    </DragDropContext>
  );
};

export default KanbanView;