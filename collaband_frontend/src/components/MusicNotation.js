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
    const lineSpacing = 50; // Vertical space between lines
    const measuresPerLine = 4; // Wrap after 4 measures
    const context = renderer.getContext();
    context.setFont('Arial', 10);

    // Parse time signature
    const [beatsPerMeasure, beatValue] = timeSignature.split('/').map(Number);

    // Create an array to hold measures
    const measures = [];

    let currentMeasureNotes = [];
    let accumulatedBeats = 0;

    notes.forEach((note) => {
      const pitch = note.pitch || note;
      const duration = note.duration ? convertDuration(note.duration) : 'q';
      const userColor = userColors[note.userId] || 'black';

      const isRest = pitch === 'rest';
      const noteOptions = {
        clef: 'treble',
        keys: [isRest ? 'b/4' : convertNoteForVexFlow(pitch)],
        duration: duration + (isRest ? 'r' : ''),
      };

      const vexNote = new VF.StaveNote(noteOptions);
      vexNote.setStyle({ fillStyle: userColor, strokeStyle: userColor });

      currentMeasureNotes.push(vexNote);

      const durationBeats = getDurationBeats(duration);
      accumulatedBeats += durationBeats;

      if (accumulatedBeats >= beatsPerMeasure) {
        measures.push(currentMeasureNotes);
        currentMeasureNotes = [];
        accumulatedBeats = 0;
      }
    });

    if (currentMeasureNotes.length > 0) {
      measures.push(currentMeasureNotes);
    }

    // Adjust renderer size
    const numberOfMeasures = measures.length;
    const numberOfLines = Math.ceil(numberOfMeasures / measuresPerLine);
    const totalWidth =
      staveWidth * measuresPerLine + staveSpacing * (measuresPerLine - 1);
    const totalHeight = (staveHeight + lineSpacing) * numberOfLines;
    renderer.resize(totalWidth + 20, totalHeight + 20);

    // Render each measure
    measures.forEach((measureNotes, index) => {
      const lineIndex = Math.floor(index / measuresPerLine);
      const measureIndexInLine = index % measuresPerLine;

      const x = 10 + measureIndexInLine * (staveWidth + staveSpacing);
      const y = 40 + lineIndex * (staveHeight + lineSpacing);

      const stave = new VF.Stave(x, y, staveWidth);
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

      const voice = new VF.Voice({
        num_beats: beatsPerMeasure,
        beat_value: beatValue,
      });
      voice.setStrict(false);
      voice.addTickables(measureNotes);

      new VF.Formatter().joinVoices([voice]).format([voice], staveWidth - 20);

      voice.draw(context, stave);
    });
  }, [notes, userColors, timeSignature]);

  // Helper functions
  function convertNoteForVexFlow(pitch) {
    if (typeof pitch !== 'string') {
      console.warn('Invalid pitch:', pitch);
      return 'c/4';
    }

    const match = pitch.match(/^([A-G]#?)(\d)$/);
    if (match) {
      const [, noteName, octave] = match;
      return `${noteName.toLowerCase()}/${octave}`;
    }
    return 'c/4';
  }

  function convertDuration(duration) {
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
    // Remove 'r' from duration if present (e.g., 'qr' becomes 'q')
    const cleanDuration = duration.replace('r', '');
    const beatsMap = {
      'w': 4,
      'h': 2,
      'q': 1,
      '8': 0.5,
      '16': 0.25,
    };
    return beatsMap[cleanDuration] || 1;
  }

  return <div ref={containerRef}></div>;
}

export default MusicNotation;
