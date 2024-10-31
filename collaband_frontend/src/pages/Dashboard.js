// src/pages/Dashboard.js

import React, { useEffect, useState } from 'react';
import {
  Typography,
  Container,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import api from '../utils/api';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/collaband/dashboard/');
      const projectsData = response.data.projects || [];
      const formattedProjects = projectsData.map(item => ({
        id: item.project.project_id,
        projectName: item.project.project_name,
        description: item.project.description,
        role: item.userRole,
      }));
      setProjects(formattedProjects);
    } catch (err) {
      console.error('Failed to fetch projects', err);
      setError('Failed to fetch projects. Please try again.');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpen = () => {
    setNewProjectName('');
    setNewProjectDescription('');
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }
    try {
      await api.post('/api/collaband/dashboard/', {
        projectName: newProjectName,
        description: newProjectDescription,
      });
      setOpen(false);
      // Refresh the project list
      await fetchProjects();
    } catch (err) {
      console.error('Failed to create project', err);
      setError('Failed to create project. Please try again.');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Your Projects
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Create New Project
      </Button>
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      <List>
        {projects.map(project => (
          <ListItem
            key={project.id}
            button
            component="a"
            href={`/projects/${project.id}`}
          >
            <ListItemText
              primary={project.projectName}
              secondary={`${project.description} (Role: ${project.role})`}
            />
          </ListItem>
        ))}
      </List>

      {/* Dialog for creating a new project */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            label="Project Name"
            fullWidth
            margin="normal"
            required
            value={newProjectName}
            onChange={e => setNewProjectName(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={newProjectDescription}
            onChange={e => setNewProjectDescription(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateProject} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Dashboard;
