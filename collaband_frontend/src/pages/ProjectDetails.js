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
  TextField,
  
} from '@mui/material';
import api from '../utils/api';

import './ProjectDetails.css';

//socket library
import io from 'socket.io-client';

function ProjectDetails() {
  const { projectId } = useParams();
  const [userRole, setUserRole] = useState('');
  const [project, setProject] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const navigate = useNavigate();
  const [usernameToAdd, setUsernameToAdd] = useState('');
  const [roleToAdd, setRoleToAdd] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(null);

 

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

  const handleAddUser = async () => {
    if (!usernameToAdd.trim()) {
      setError('Username is required');
      return;
    }
    try {
      await api.put(`/api/collaband/project-${projectId}/`,{
        user_project_role: {
          role: roleToAdd,
          username: usernameToAdd
        }
      });
      setMessage({ text: 'User added successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 2000); // Clear message after 2 seconds
      
    } catch (err) {
      console.error('Failed to add user to project', err);
      if(err.response){
        const { status, data } = err.response;

        if (status === 403) {
          setMessage({ text: data.error || 'You are not authorized to modify this project.', type: 'error' });
        } else if (status === 400) {
          setMessage({ text: data.error || 'Bad request. Please try again.', type: 'error' });
        } else if (status === 404) {
          setMessage({ text: data.error || 'User does not exist.', type: 'error' });
        } else {
          setMessage({ text: 'An unexpected error occurred.', type: 'error' });
        }
      } else {
      setMessage({ text: 'Failed to add user to project.', type: 'error' });
    }

      //setMessage({ text: 'Failed to add user to project.', type: 'error' });
      setTimeout(() => setMessage(null), 2000); // Clear message after 2 seconds
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
              color="primary"
              onClick={() => setOpenAddUserDialog(true)}
              sx={{ mr: 2 }}
            >
              Invite Friends
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setOpenDeleteDialog(true)}
            >
              Delete Project
            </Button>
            
            {/* Invite Users Dialog */}
            <Dialog
              open={openAddUserDialog}
              onClose={() => setOpenAddUserDialog(false)}
            >
              <DialogTitle>Invite A User</DialogTitle>
              <DialogContent>
                
                
                <div>
                  <label htmlFor="dropdown" style={{ marginRight: "8px" }}>
                      Select the new user's role:
                  </label>
                  <select
                      id="dropdown"
                      value={roleToAdd}
                      onChange={e => setRoleToAdd(e.target.value)}
                      style={{
                          padding: "8px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          fontSize: "16px",
                      }}
                  >
                      <option value="" disabled>
                          -- Select an option --
                      </option>
                      <option value="collaborator">collaborator</option>
                      <option value="viewer">viewer</option>
                  </select>
                </div>

                
                <TextField
                  label="Username"
                  fullWidth
                  margin="normal"
                  required
                  value={usernameToAdd}
                  onChange={e => setUsernameToAdd(e.target.value)}
                />

                {message && (
                  <div className={`message ${message.type}`}>
                    {message.text}
                    
                  </div>
                )}    

              </DialogContent>
              <DialogActions> 
                <Button
                  onClick={() => setOpenAddUserDialog(false)}
                  color="primary"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddUser} color="secondary">
                  Add
                </Button>
                
              </DialogActions>
            </Dialog>

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
