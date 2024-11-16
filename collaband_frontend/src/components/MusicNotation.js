// src/components/MusicNotation.js

import React, { useEffect, useRef } from 'react';
import Vex from 'vexflow';

function MusicNotation({ notes, userColors, timeSignature = '4/4' }) {
  const containerRef = useRef();

  useEffect(() => {
    const VF = Vex.Flow;
    const div = containerRef.current;
    div.innerHTML = ''; // Clear previous content

    const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

    const staveWidth = 300;
    const staveHeight = 150;
    const staveSpacing = 20;
    const context = renderer.getContext();
    context.setFont('Arial', 10);

    // Parse time signature
    const [beatsPerMeasure, beatValue] = timeSignature.split('/').map(Number);

    // Create an array to hold measures
    const measures = [];

    let currentMeasureNotes = [];
    let accumulatedBeats = 0;

    notes.forEach((note) => {
      // Extract pitch and duration from note object or use defaults
      const pitch = note.pitch || note; // Handle both object and string formats
      const duration = note.duration ? convertDuration(note.duration) : 'q';
      const userColor = userColors[note.userId] || 'black';

      const vexNote = new VF.StaveNote({
        clef: 'treble',
        keys: [convertNoteForVexFlow(pitch)],
        duration: duration,
      });

      // Set the color of the note
      vexNote.setStyle({ fillStyle: userColor, strokeStyle: userColor });

      currentMeasureNotes.push(vexNote);

      // Convert duration to beats
      const durationBeats = getDurationBeats(duration);

      accumulatedBeats += durationBeats;

      if (accumulatedBeats >= beatsPerMeasure) {
        // Add the current measure to measures array
        measures.push(currentMeasureNotes);
        // Reset for next measure
        currentMeasureNotes = [];
        accumulatedBeats = 0;
      }
    });

    // Add any remaining notes to the last measure
    if (currentMeasureNotes.length > 0) {
      measures.push(currentMeasureNotes);
    }

    // **Adjust renderer size after measures are calculated**
    const numberOfMeasures = measures.length;
    const totalWidth = staveWidth * numberOfMeasures + staveSpacing * (numberOfMeasures - 1);
    renderer.resize(totalWidth + 20, 200); // Add some padding

    // Now, render each measure
    let x = 10;
    measures.forEach((measureNotes, index) => {
      const stave = new VF.Stave(x, 40, staveWidth);
      if (index === 0) {
        stave.addClef('treble').addTimeSignature(timeSignature);
        stave.setBegBarType(VF.Barline.type.SINGLE);
      }
      if (index === measures.length - 1) {
        stave.setEndBarType(VF.Barline.type.END);
      } else {
        stave.setEndBarType(VF.Barline.type.SINGLE);
      }
      stave.setContext(context).draw();

      const voice = new VF.Voice({ num_beats: beatsPerMeasure, beat_value: beatValue });
      voice.setStrict(false); // Allow incomplete measures
      voice.addTickables(measureNotes);

      // Format and justify the notes to the stave width
      new VF.Formatter().joinVoices([voice]).format([voice], staveWidth - 20);

      // Render voice
      voice.draw(context, stave);

      x += staveWidth + staveSpacing; // Move x for the next measure
    });
  }, [notes, userColors, timeSignature]);

  // Helper functions
  function convertNoteForVexFlow(pitch) {
    // VexFlow expects notes in the format 'c/4'
    if (typeof pitch !== 'string') {
      console.warn('Invalid pitch:', pitch);
      return 'c/4'; // Default to middle C if parsing fails
    }

    const match = pitch.match(/^([A-G]#?)(\d)$/);
    if (match) {
      const [, noteName, octave] = match;
      return `${noteName.toLowerCase()}/${octave}`;
    }
    return 'c/4'; // Default to middle C if parsing fails
  }

  function convertDuration(duration) {
    // Map Tone.js durations to VexFlow durations
    const durationMap = {
      '1n': 'w',    // Whole note
      '2n': 'h',    // Half note
      '4n': 'q',    // Quarter note
      '8n': '8',    // Eighth note
      '16n': '16',  // Sixteenth note
    };
    return durationMap[duration] || 'q'; // Default to quarter note
  }

  function getDurationBeats(duration) {
    const beatsMap = {
      'w': 4,
      'h': 2,
      'q': 1,
      '8': 0.5,
      '16': 0.25,
    };
    return beatsMap[duration] || 1;
  }

  return <div ref={containerRef}></div>;
}

export default MusicNotation;

