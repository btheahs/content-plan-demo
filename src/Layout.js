import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Avatar } from '@mui/material';
import { Dashboard, FolderSpecial, People, AccountBalance, Assessment, InsertDriveFile, Settings, Search, Notifications } from '@mui/icons-material';
import { Link, Outlet } from 'react-router-dom';

const drawerWidth = 240;

const sidebarItems = [
  { name: 'Dashboard', icon: <Dashboard />, path: '/' },
  { name: 'Projects', icon: <FolderSpecial />, path: '/projects' },
  { name: 'Teams', icon: <People />, path: '/teams' },
  { name: 'Budgets', icon: <AccountBalance />, path: '/budgets' },
  { name: 'Reports', icon: <Assessment />, path: '/reports' },
  { name: 'Files', icon: <InsertDriveFile />, path: '/files' },
];

const Layout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'white',
            borderRight: 'none',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>Y</Avatar>
          <Typography variant="h6">yoja</Typography>
        </Box>
        <List>
          {sidebarItems.map((item) => (
            <ListItem button key={item.name} component={Link} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 'auto', p: 2 }}>
          <ListItem button>
            <ListItemIcon><Settings /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Search sx={{ mr: 2 }} />
          <Notifications sx={{ mr: 2 }} />
          <Avatar>U</Avatar>
        </Box>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;