// src/components/VirtualKeyboard.js
import React from 'react';
import * as Tone from 'tone';

function VirtualKeyboard({ onPlayNote }) {
  const synth = new Tone.Synth().toDestination();

  const handleNoteClick = (note) => {
    // Play note locally
    synth.triggerAttackRelease(note, '8n');
    // Notify parent component
    if (onPlayNote) {
      onPlayNote(note, 0.8);
    }
  };

  return (
    <div>
      <button onClick={() => handleNoteClick('C4')}>C</button>
      <button onClick={() => handleNoteClick('D4')}>D</button>
      <button onClick={() => handleNoteClick('E4')}>E</button>
      <button onClick={() => handleNoteClick('F4')}>F</button>
      <button onClick={() => handleNoteClick('G4')}>G</button>
      <button onClick={() => handleNoteClick('A4')}>A</button>
      <button onClick={() => handleNoteClick('B4')}>B</button>
      <button onClick={() => handleNoteClick('C5')}>C5</button>
    </div>
  );
}

export default VirtualKeyboard;
