// src/pages/ProjectDetails.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Container,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import api from '../utils/api';

//socket library
import io from 'socket.io-client';

function ProjectDetails() {
  const { projectId } = useParams();
  const [userRole, setUserRole] = useState('');
  const [project, setProject] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const navigate = useNavigate();
 

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/api/collaband/project-${projectId}/`);
        const projectData = response.data.project;
        setProject({
          id: projectData.project_id,
          projectName: projectData.project_name,
          description: projectData.description,
        });
        setUserRole(response.data.userRole);
      } catch (err) {
        console.error('Failed to fetch project details', err);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/collaband/project-${projectId}/`);
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
          href={`/projects/${project.id}/music-editor`}
          sx={{ mr: 2 }}
        >
          Open Music Editor
        </Button>
        {/* Conditionally render buttons based on userRole */}
        {userRole === 'host' && (
          <>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setOpenDeleteDialog(true)}
            >
              Delete Project
            </Button>

            {/* Confirm Deletion Dialog */}
            <Dialog
              open={openDeleteDialog}
              onClose={() => setOpenDeleteDialog(false)}
            >
              <DialogTitle>Delete Project</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this project? This action
                  cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setOpenDeleteDialog(false)}
                  color="primary"
                >
                  Cancel
                </Button>
                <Button onClick={handleDelete} color="secondary">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Box>
    </Container>
  );
}

export default ProjectDetails;
