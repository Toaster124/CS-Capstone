// src/pages/ProjectDetails.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Typography, Container, Button, Box } from '@mui/material';
import api from '../utils/api';

function ProjectDetails() {
  const { projectId } = useParams();
  const [userRole, setUserRole] = useState('');
  const [project, setProject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Updated endpoint to match back-end
        const response = await api.get(`/api/collaband/project-${projectId}/`);
        const projectData = response.data.project[0]; // Adjusted to match back-end response structure
        setProject({
          id: projectData.project_id,
          projectName: projectData.project_name,
          description: projectData.description,
        });
        setUserRole(projectData.role);
      } catch (err) {
        console.error('Failed to fetch project details', err);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleDelete = async () => {
    try {
      // Deletion is handled via the dashboard endpoint
      await api.delete('/api/collaband/dashboard/', {
        data: { projectID: projectId },
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  if (!project) {
    return <Typography>Loading project details...</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {project.projectName}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {project.description}
      </Typography>
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to={`/projects/${project.id}/music-editor`}
          sx={{ mr: 2 }}
        >
          Open Music Editor
        </Button>
        {/* Conditionally render buttons based on userRole */}
        {(userRole === 'host' || userRole === 'collaborator') && (
          <Button variant="outlined" color="secondary" onClick={handleDelete}>
            Delete Project
          </Button>
        )}
      </Box>
    </Container>
  );
}

export default ProjectDetails;
