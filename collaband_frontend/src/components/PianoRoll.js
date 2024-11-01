// src/components/PianoRoll.js

import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './PianoRoll.css';

function PianoRoll({ notes, onAddNote, onDeleteNote }) {
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
        // Add more notes as needed
      };

      const y = noteMapping[note.pitch];
      const x = note.start * 20; // Assuming note.start is in beats

      ctx.fillStyle = 'blue';
      ctx.fillRect(x, y, note.duration * 20, 20); // Assuming note.duration is in beats
    });

    // Add click event listener to canvas
    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Determine clicked note
      const clickedNote = notes.find((note) => {
        const noteMapping = {
          'C5': 0,
          'B4': 20,
          'A#4': 40,
          'A4': 60,
          'G#4': 80,
          'G4': 100,
          'F#4': 120,
          // Add more notes as needed
        };

        const noteY = noteMapping[note.pitch];
        const noteX = note.start * 20;
        const noteWidth = note.duration * 20;

        return x >= noteX && x <= noteX + noteWidth && y >= noteY && y <= noteY + 20;
      });

      if (clickedNote) {
        onDeleteNote(clickedNote);
      }
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [notes, onDeleteNote]);

  return <canvas ref={canvasRef} width={800} height={200}></canvas>;
}

PianoRoll.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      pitch: PropTypes.string.isRequired,
      start: PropTypes.number.isRequired,
      duration: PropTypes.number.isRequired,
    })
  ).isRequired,
  onAddNote: PropTypes.func,
  onDeleteNote: PropTypes.func.isRequired,
};

export default PianoRoll;