// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function Profile() {
    const [user, setUser] = useState({ username: '', email: '' });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/auth/user/');
                setUser(response.data);
            } catch (err) {
                console.error('Failed to fetch user data', err);
            }
        };
        fetchUser();
    }, []);

    return (
        <div style={{ padding: '20px', paddingtop: '20px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f9f9f9', borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#426B1F', fontSize: '40px' }}>Your Profile</h2>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', color: '#426B1F' }}>Username:</label>
                <span style={{ display: 'block', padding: '10px', backgroundColor: '#fff', borderRadius: '5px', border: '1px solid #ddd' }}>{user.username}</span>
            </div>
            <div style={{ marginBottom: '10px', margintop: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', color: '#426B1F' }}>Email:</label>
                <span style={{ display: 'block', padding: '10px', backgroundColor: '#fff', borderRadius: '5px', border: '1px solid #ddd' }}>{user.email}</span>
            </div>

            {/* Change Password Button */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                    onClick={() => alert('Its changed! Good luck')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#426B1F',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Change Password
                </button>
            </div>
        </div>
    );
}

export default Profile;
