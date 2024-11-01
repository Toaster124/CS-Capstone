import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/actions/authActions';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

function Header() {
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <AppBar
            position="static"
            sx={{
                backgroundColor: 'white', // Header background color to match Figma design
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Bottom drop shadow
                borderBottom: '1px solid #E0E0E0', // Optional light border for additional distinction
            }}
        >
            <Toolbar>
                <Box
                    component="img"
                    src="/Picture1.png" // Placeholder for your logo image
                    alt="CollaBand Logo"
                    sx={{ height: 40, width: 40, mr: 1 }}
                />
                <Typography
                    variant="h6"
                    component={RouterLink}
                    to="/"
                    sx={{ flexGrow: 1, textDecoration: 'none', color: '#426B1F' }} // Change color to #426B1F
                >
                    CollaBand
                </Typography>
                {isAuthenticated ? (
                    <>
                        <Button color="primary" component={RouterLink} to="/dashboard" variant="contained" sx={{ mx: 1 }}>
                            Dashboard
                        </Button>
                        <Button color="primary" component={RouterLink} to="/profile" variant="contained" sx={{ mx: 1 }}>
                            Profile
                        </Button>
                        <Button color="primary" onClick={handleLogout} variant="contained" sx={{ mx: 1 }}>
                            Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <Button color="primary" component={RouterLink} to="/login" variant="contained" sx={{ mx: 1 }}>
                            Login
                        </Button>
                        <Button color="primary" component={RouterLink} to="/register" variant="contained" sx={{ mx: 1 }}>
                            Register
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Header;
