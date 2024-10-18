// src/pages/MusicEditor.js
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { initWebSocket } from '../utils/websocket';

function MusicEditor() {
  const { projectId } = useParams();

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = initWebSocket(projectId);

    // Clean up on component unmount
    return () => {
      ws.close();
    };
  }, [projectId]);

  return (
    <div>
      <h2>Music Editor</h2>
      {/* Include components for the music editor interface */}
    </div>
  );
}

export default MusicEditor;
