// src/components/PianoRoll.js

import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './PianoRoll.css';

function PianoRoll({ notes, onAddNote }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#ccc';
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw notes
    notes.forEach((note) => {
      // Convert note to position
      // For simplicity, map C5 to y=0 and lower pitches increase y
      const noteMapping = {
        'C5': 0,
        'B4': 20,
        'A#4': 40,
        'A4': 60,
        'G#4': 80,
        'G4': 100,
        'F#4': 120,
        'F4': 140,
        'E4': 160,
        'D#4': 180,
        'D4': 200,
        'C#4': 220,
        'C4': 240,
      };

      const y = noteMapping[note] || 0;
      const x = 0; // You can map time to x position

      ctx.fillStyle = '#ff0000';
      ctx.fillRect(x, y, 20, 20);
    });
  }, [notes]);

  return (
    <div className="piano-roll">
      <canvas ref={canvasRef} width={800} height={300} />
    </div>
  );
}

PianoRoll.propTypes = {
  notes: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAddNote: PropTypes.func,
};

export default PianoRoll;
