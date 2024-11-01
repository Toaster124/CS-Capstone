// src/components/VirtualKeyboard.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './VirtualKeyboard.css';

const keys = [
  // White keys
  { note: 'C4', type: 'white' },
  { note: 'D4', type: 'white' },
  { note: 'E4', type: 'white' },
  { note: 'F4', type: 'white' },
  { note: 'G4', type: 'white' },
  { note: 'A4', type: 'white' },
  { note: 'B4', type: 'white' },
  { note: 'C5', type: 'white' },
  // Black keys
  { note: 'C#4', type: 'black', position: 1 },
  { note: 'D#4', type: 'black', position: 2 },
  { note: 'F#4', type: 'black', position: 4 },
  { note: 'G#4', type: 'black', position: 5 },
  { note: 'A#4', type: 'black', position: 6 },
];

function VirtualKeyboard({ onPlayNote }) {
  const [activeKeys, setActiveKeys] = useState({});

  const handleMouseDown = (note) => {
    onPlayNote(note, 127); // Max velocity
    setActiveKeys((prev) => ({ ...prev, [note]: true }));
  };

  const handleMouseUp = (note) => {
    setActiveKeys((prev) => ({ ...prev, [note]: false }));
  };

  const whiteKeys = keys.filter((key) => key.type === 'white');
  const blackKeys = keys.filter((key) => key.type === 'black');

  return (
    <div className="keyboard">
      {whiteKeys.map((key, index) => (
        <div
          key={key.note}
          className={`key white ${activeKeys[key.note] ? 'active' : ''}`}
          onMouseDown={() => handleMouseDown(key.note)}
          onMouseUp={() => handleMouseUp(key.note)}
          onMouseLeave={() => handleMouseUp(key.note)}
          style={{ left: `${index * 40}px` }}
        />
      ))}
      {blackKeys.map((key) => (
        <div
          key={key.note}
          className={`key black ${activeKeys[key.note] ? 'active' : ''}`}
          onMouseDown={() => handleMouseDown(key.note)}
          onMouseUp={() => handleMouseUp(key.note)}
          onMouseLeave={() => handleMouseUp(key.note)}
          style={{ left: `${key.position * 40}px` }}
        />
      ))}
    </div>
  );
}

VirtualKeyboard.propTypes = {
  onPlayNote: PropTypes.func.isRequired,
};

export default VirtualKeyboard;
