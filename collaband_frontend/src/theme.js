// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#426B1F', // Main green color for primary elements
        },
        secondary: {
            main: '#4CAF50', // Light green secondary (if needed for accents)
        },
        background: {
            default: '#FAFAFA', // Light background color for main app background
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8, // Rounded corners to match a modern design
                    textTransform: 'none', // Disable uppercase transform
                    fontWeight: 600,
                },
                containedPrimary: {
                    backgroundColor: '#426B1F',
                    color: '#FFFFFF',
                    '&:hover': {
                        backgroundColor: '#365a14',
                    },
                },
                outlinedPrimary: {
                    borderColor: '#426B1F',
                    color: '#426B1F',
                    '&:hover': {
                        borderColor: '#365a14',
                        color: '#365a14',
                    },
                },
            },
        },
    },
});

export default theme;
