// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { Button, TextField, Container, Typography, Box } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/actions/authActions';

function Login() {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const error = useSelector(state => state.auth.error);
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = e => {
        e.preventDefault();
        dispatch(login(emailOrUsername, password));
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    return (
        <Container maxWidth="sm">
            <Box mt={5} display="flex" alignItems="center">
                <Box
                    component="img"
                    src="/Picture1.png" // Update with the correct path to your image
                    alt="CollaBand Logo"
                    sx={{ height: 60, width: 60, mr: 1 }} // Set size to 60px
                />
                <Typography
                    variant="h2"
                    sx={{ color: '#426B1F', fontWeight: 'bold' }} // Make the text bold
                    gutterBottom
                >
                    Login
                </Typography>
            </Box>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Email or Username"
                    fullWidth
                    margin="normal"
                    required
                    value={emailOrUsername}
                    onChange={e => setEmailOrUsername(e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: '#426B1F', // Default outline color
                            },
                            '&:hover fieldset': {
                                borderColor: '#426B1F', // Outline color on hover
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#426B1F', // Outline color when focused
                            },
                        },
                    }}
                />
                <TextField
                    label="Password"
                    fullWidth
                    margin="normal"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: '#426B1F', // Default outline color
                            },
                            '&:hover fieldset': {
                                borderColor: '#426B1F', // Outline color on hover
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#426B1F', // Outline color when focused
                            },
                        },
                    }}
                />
                {error && (
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                )}
                <Box mt={2}>
                    <Button
                        variant="contained"
                        type="submit"
                        sx={{
                            backgroundColor: '#426B1F',
                            color: 'white',
                            '&:hover': { backgroundColor: '#355B16' },
                        }}
                    >
                        Login
                    </Button>
                </Box>
            </form>
            <Box mt={2}>
                <Typography variant="body2">
                    Don&apos;t have an account?{' '}
                    <RouterLink to="/register">Register here</RouterLink>.
                </Typography>
            </Box>
        </Container>
    );
}

export default Login;
