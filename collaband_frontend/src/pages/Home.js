import React from 'react';
import { Typography, Container, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Home() {
    const isAuthenticated = !!localStorage.getItem('token');

    return (
        <Container>
            <Box textAlign="center" mt={5}>
                {/* Logo and Title Section */}
                <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                    {/* Logo Image */}
                    <Box
                        component="img"
                        src="/Picture1.png" // Ensure this file is in your public folder
                        alt="CollaBand Logo"
                        sx={{ height: 50, width: 50, mr: 2 }}
                    />
                    <Typography
                        variant="h2"
                        gutterBottom
                        sx={{ fontWeight: 'bold', color: '#426B1F' }} // Change color to match button color
                    >
                        CollaBand
                    </Typography>
                </Box>

                {/* Subtitle */}
                <Typography variant="h5" gutterBottom>
                    The Ultimate Music Collaboration Hub
                </Typography>

                {/* Action Buttons for Non-Authenticated Users */}
                {!isAuthenticated && (
                    <Box mt={3}>
                        <Button
                            variant="contained"
                            color="primary"
                            component={RouterLink}
                            to="/register"
                            sx={{ mr: 2 }}
                        >
                            Create an Account
                        </Button>
                        <Button
                            variant="contained" // Change to contained to make it green
                            color="primary"
                            component={RouterLink}
                            to="/login"
                        >
                            Login
                        </Button>
                    </Box>
                )}

                {/* Description Section */}
                <Box mt={5} textAlign="center">
                    <Typography variant="h4" gutterBottom>
                        Welcome to CollaBand
                    </Typography>
                    <Typography paragraph>
                        Your Ultimate Music Collaboration Hub! Work with musicians from around the world in real-time,
                        sharing ideas, editing tracks, and creating music together seamlessly. Access a suite of
                        professional-grade tools for recording, mixing, and mastering your tracks. Connect with a
                        vibrant community of artists, manage your projects effortlessly with intuitive project
                        management features, and securely store your music projects in the cloud for access anytime,
                        anywhere.
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        The Tool for Musical Creation, Innovation, and Collaboration
                    </Typography>
                    <Typography paragraph>
                        Boost your creativity by collaborating with diverse artists, streamline your workflow with
                        integrated tools and real-time collaboration, and enhance your music quality with
                        professional-grade tools and community feedback. Expand your reach by networking with artists
                        globally today.
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
}

export default Home;
