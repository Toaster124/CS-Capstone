// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <div>
      <h1>Welcome to CollaBand</h1>
      <p>Collaborate on music projects in real-time.</p>
      {!isAuthenticated && (
        <nav>
          <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
        </nav>
      )}
    </div>
  );
}

export default Home;
