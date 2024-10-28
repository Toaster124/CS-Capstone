// src/pages/Dashboard.js

import React, { useEffect, useState } from 'react';
import {
  Typography,
  Container,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../utils/api';

function Dashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Updated endpoint to match back-end
        const response = await api.get('/api/collaband/dashboard/');
        const projectsData = response.data.projects;
        // Adjust the structure based on back-end response
        const formattedProjects = projectsData.map(item => ({
          id: item.project_id,
          projectName: item.project_name,
          description: item.description,
          role: item.role,
        }));
        setProjects(formattedProjects);
      } catch (err) {
        console.error('Failed to fetch projects', err);
      }
    };
    fetchProjects();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Your Projects
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={RouterLink}
        to="/projects/new"
      >
        Create New Project
      </Button>
      <List>
        {projects.map(project => (
          <ListItem
            key={project.id}
            button
            component={RouterLink}
            to={`/projects/${project.id}`}
          >
            <ListItemText
              primary={project.projectName}
              secondary={`${project.description} (Role: ${project.role})`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default Dashboard;
