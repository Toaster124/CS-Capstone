// src/pages/CreateProject.js
const handleCreateProject = async () => {
    try {
      const response = await api.post('/collaband/dashboard/', {
        projectName: 'My New Project',
        description: 'Project description',
      });
      navigate(`/projects/${response.data.id}`);
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };
  