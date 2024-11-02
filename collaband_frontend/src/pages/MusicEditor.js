// src/pages/MusicEditor.js

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import { initWebSocket } from '../utils/websocket';
import { Typography, ButtonGroup, Button } from '@mui/material';
import VirtualKeyboard from '../components/VirtualKeyboard';
import MusicNotation from '../components/MusicNotation';
import PianoRoll from '../components/PianoRoll';
import * as Tone from 'tone';
import api from '../utils/api';

function MusicEditor() {
  const [notes, setNotes] = useState([]);
  const { projectId } = useParams();
  const wsRef = useRef(null);
  const [instrument, setInstrument] = useState(null);
  const [instrumentName, setInstrumentName] = useState('piano');
  const [viewMode, setViewMode] = useState('staff'); // 'staff' or 'pianoRoll'

  /**
   * Memoize instrumentOptions to prevent unnecessary re-creations on each render.
   */
  // src/pages/MusicEditor.js

const instrumentOptions = useMemo(() => ({
  piano: new Tone.Sampler({
    urls: {
      C4: 'C4.mp3',
      'D#4': 'Ds4.mp3',
      'F#4': 'Fs4.mp3',
      A4: 'A4.mp3',
    },
    baseUrl: 'https://tonejs.github.io/audio/salamander/',
  }).toDestination(),
  violin: new Tone.Synth({
    oscillator: {
      type: 'sawtooth',
    },
    envelope: {
      attack: 0.5,
      decay: 0.1,
      sustain: 0.7,
      release: 1,
    },
  }).toDestination(),
  trumpet: new Tone.Synth({
    oscillator: {
      type: 'square',
    },
    envelope: {
      attack: 0.05,
      decay: 0.2,
      sustain: 0.5,
      release: 1,
    },
  }).toDestination(),
 /* guitar: new Tone.Sampler({
    urls: {
      E2: 'E2.mp3',
      A2: 'A2.mp3',
      D3: 'D3.mp3',
      G3: 'G3.mp3',
      B3: 'B3.mp3',
      E4: 'E4.mp3',
    },
    baseUrl: 'https://tonejs.github.io/examples/audio/casio/', // Replace with your actual sample URL
  }).toDestination(),*/
}), []);


  /**
   * Define playNoteLocally before it's used in useEffect and other hooks.
   */
  const playNoteLocally = useCallback(
    (note, velocity) => {
      console.log(`Playing note: ${note}, Velocity: ${velocity}`);
      if (instrument) {
        // Ensure AudioContext is started
        if (Tone.context.state !== 'running') {
          Tone.start();
        }
        // Trigger the attack and release of the note
        instrument.triggerAttackRelease(
          note,
          '8n',
          Tone.now(),
          velocity / 127
        );
      }
      // Update notation
      setNotes((prevNotes) => [...prevNotes, note]);
    },
    [instrument]
  );

  /**
   * Handle playing a note locally and sending it to the server
   */
  const playNote = useCallback(
    (note, velocity) => {
      // Send note to server
      const message = {
        type: 'notePlayed',
        data: { note, velocity },
      };
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      }

      // Play note locally
      playNoteLocally(note, velocity);
    },
    [playNoteLocally]
  );
  

  /**
   * Load the selected instrument whenever instrumentName or instrumentOptions change.
   */
  useEffect(() => {
    const loadInstrument = async () => {
      try {
        // Dispose previous instrument if exists
        if (instrument) {
          instrument.dispose();
        }

        // Create and set the new instrument
        const selectedInstrument = instrumentOptions[instrumentName];
        setInstrument(selectedInstrument);
      } catch (error) {
        console.error(`Failed to load instrument ${instrumentName}:`, error);
      }
    };

    loadInstrument();

    // Clean up function
    return () => {
      if (instrument) {
        instrument.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instrumentName, instrumentOptions]);



  /**
   * Initialize WebSocket connection
   */
  useEffect(() => {
    const ws = initWebSocket(projectId);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'notePlayed') {
        playNoteLocally(message.data.note, message.data.velocity);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [projectId, playNoteLocally]);

  /**
   * Handle instrument selection change
   */
  const handleInstrumentChange = useCallback((event) => {
    setInstrumentName(event.target.value);
    // Optionally, reset notes when instrument changes
    // setNotes([]);
  }, []);

  /**
   * Load existing notes when the component mounts
   */
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await api.get(
          `/api/collaband/project-${projectId}/notes/`
        );
        setNotes(response.data.notes);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      }
    };

    fetchNotes();
  }, [projectId]);

  /**
   * Save notes whenever they change (optional)
   */
  useEffect(() => {
    const saveNotes = async () => {
      try {
        await api.post(`/api/collaband/project-${projectId}/notes/`, { notes });
      } catch (error) {
        console.error('Failed to save notes:', error);
      }
    };

    if (notes.length > 0) {
      saveNotes();
    }
  }, [notes, projectId]);

  /**
   * Clean up on component unmount
   */
  useEffect(() => {
    return () => {
      if (instrument) {
        instrument.dispose();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [instrument]);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Music Editor
      </Typography>

      {/* View Mode Toggle */}
      <ButtonGroup variant="contained" style={{ marginTop: '20px' }}>
        <Button
          onClick={() => setViewMode('staff')}
          disabled={viewMode === 'staff'}
        >
          Staff Notation
        </Button>
        <Button
          onClick={() => setViewMode('pianoRoll')}
          disabled={viewMode === 'pianoRoll'}
        >
          Piano Roll
        </Button>
      </ButtonGroup>

      {/* Instrument Selector */}
      <div style={{ margin: '20px 0' }}>
        <label htmlFor="instrument-select">Select Instrument: </label>
        <select
          id="instrument-select"
          value={instrumentName}
          onChange={handleInstrumentChange}
        >
          <option value="piano">Piano</option>
          <option value="violin">Violin</option>
          <option value="trumpet">Trumpet</option>
          {/* <option value="guitar">Guitar</option> */}
          {/* Add more options as needed */}
        </select>
      </div>

      {/* Main Content */}
      {viewMode === 'staff' ? (
        <MusicNotation notes={notes} />
      ) : (
        <PianoRoll
          notes={notes}
          onAddNote={(note) => setNotes((prevNotes) => [...prevNotes, note])}
        />
      )}

      {/* Virtual Keyboard */}
      {instrument ? (
        <VirtualKeyboard onPlayNote={playNote} />
      ) : (
        <div>Loading instrument...</div>
      )}

      {/* Save Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={async () => {
          try {
            await api.post(`/api/collaband/project-${projectId}/notes/`, {
              notes,
            });
            alert('Notes saved successfully.');
          } catch (error) {
            console.error('Failed to save notes:', error);
            alert('Failed to save notes.');
          }
        }}
        style={{ marginTop: '20px' }}
      >
        Save Notes
      </Button>
    </div>
  );
}

export default MusicEditor;
