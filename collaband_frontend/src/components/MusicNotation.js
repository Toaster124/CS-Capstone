// src/components/MusicNotation.js

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Flow } from 'vexflow';
import { Typography } from '@mui/material';
import './MusicNotation.css';

function MusicNotation({ notes }) {
  const divRef = useRef(null);

  useEffect(() => {
    const VF = Flow;
    const div = divRef.current;
    div.innerHTML = ''; // Clear previous rendering

    // Create the renderer
    const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(700, 200);
    const context = renderer.getContext();
    context.setFont('Arial', 10, '').setBackgroundFillStyle('#eed');

    // Create a stave
    const stave = new VF.Stave(10, 40, 680);
    stave.addClef('treble').addTimeSignature('4/4');
    stave.setContext(context).draw();

    if (notes.length === 0) {
      // If no notes, display a rest
      const rest = new VF.StaveNote({
        clef: 'treble',
        keys: ['b/4'],
        duration: 'wr',
      });

      const voice = new VF.Voice({ num_beats: 4, beat_value: 4 }).setMode(
        VF.Voice.Mode.SOFT
      );
      voice.addTickables([rest]);

      new VF.Formatter().joinVoices([voice]).format([voice], 650);
      voice.draw(context, stave);
      return;
    }

    // Function to convert Tone.js note format to VexFlow format
    const convertNoteForVexFlow = (note) => {
      // Regex to extract note, accidental, and octave
      const notePattern = /^([A-G])(#?)(\d)$/;
      const match = note.match(notePattern);
      if (!match) {
        console.error(`Invalid note format: ${note}`);
        return null;
      }
      const [, noteLetter, accidental, octave] = match;
      return {
        key: `${noteLetter.toLowerCase()}${accidental}/${octave}`, // e.g., 'c#/4'
        accidental: accidental, // e.g., '#' or ''
      };
    };

    // Convert note strings to VexFlow StaveNotes
    const staveNotes = notes
      .map((note) => {
        const vexNoteData = convertNoteForVexFlow(note);
        if (!vexNoteData) {
          return null; // Skip invalid notes
        }

        const { key, accidental } = vexNoteData;

        const staveNote = new VF.StaveNote({
          clef: 'treble',
          keys: [key],
          duration: 'q',
        });

        if (accidental) {
          staveNote.addModifier(new VF.Accidental(accidental), 0);
        }

        return staveNote;
      })
      .filter((note) => note !== null); // Remove any null entries

    // Create a voice in 4/4
    const voice = new VF.Voice({ num_beats: 4, beat_value: 4 }).setMode(
      VF.Voice.Mode.SOFT
    );
    voice.addTickables(staveNotes);

    // Format and justify the notes to fit the stave width
    new VF.Formatter().joinVoices([voice]).format([voice], 650);

    // Render voice
    voice.draw(context, stave);
  }, [notes]);

  return (
    <div>
      <Typography variant="h6">Music Notation</Typography>
      <div ref={divRef} className="music-notation"></div>
    </div>
  );
}

MusicNotation.propTypes = {
  notes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default MusicNotation;
