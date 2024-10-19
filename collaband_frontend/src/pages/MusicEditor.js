// src/pages/MusicEditor.js
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { initWebSocket } from '../utils/websocket';
import VirtualKeyboard from '../components/VirtualKeyboard';
import * as Tone from 'tone';

function MusicEditor() {
  const { projectId } = useParams();
  const wsRef = useRef(null);
  const synthRef = useRef(new Tone.Synth().toDestination());

  useEffect(() => {
    const handleMessage = (message) => {
      if (message.type === 'notePlayed') {
        playNoteLocally(message.data.note, message.data.velocity);
      }
    };

    wsRef.current = initWebSocket(projectId, handleMessage);

    return () => {
      wsRef.current.close();
    };
  }, [projectId]);

  const playNoteLocally = (note, velocity) => {
    synthRef.current.triggerAttackRelease(note, '8n', undefined, velocity);
  };

  const playNote = (note, velocity) => {
    // Play note locally
    playNoteLocally(note, velocity);
    // Send note to server
    const message = {
      type: 'notePlayed',
      data: { note, velocity },
    };
    wsRef.current.send(JSON.stringify(message));
  };

  return (
    <div>
      <h2>Music Editor</h2>
      <VirtualKeyboard onPlayNote={playNote} />
      {/* Include other music editing components */}
    </div>
  );
}

export default MusicEditor;
