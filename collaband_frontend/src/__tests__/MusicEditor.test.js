// src/__tests__/MusicEditor.test.js
import React from 'react';
import { render } from '@testing-library/react';
import MusicEditor from '../pages/MusicEditor';
import { BrowserRouter as Router } from 'react-router-dom';

test('MusicEditor renders without crashing', () => {
  render(
    <Router>
      <MusicEditor />
    </Router>,
  );
});
