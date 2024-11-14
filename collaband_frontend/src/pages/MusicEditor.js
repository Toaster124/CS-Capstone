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
import Soundfont from 'soundfont-player';
//import { initWebSocket } from '../utils/websocket';
import PianoRoll from '../components/PianoRoll';
import * as Tone from 'tone';
import api from '../utils/api';
import { io } from 'socket.io-client';

function MusicEditor() {
  const [notes, setNotes] = useState([]);
  const { projectId } = useParams();
  const wsRef = useRef(null);
  const [instrument, setInstrument] = useState(null);
  const [instrumentName, setInstrumentName] = useState('piano');
  const [viewMode, setViewMode] = useState('staff'); // 'staff' or 'pianoRoll'
  const [socket, setSocket] = useState(null);

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
      //setNotes((prevNotes) => [...prevNotes, note]);
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
        senderID: 1,
        projectID: projectId,
        data: {
          type: 'notePlayed',
          note: note, 
          velocity: velocity 
        }
      };
      
      if (socket && socket.connected) {
        socket.emit("message", message);

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
      


  //Establish a connection to the websocket
  useEffect(() => {
    const newSocket = io("http://127.0.0.1:8000", {
        transports: ["websocket"],
        withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
        console.log("Connected to WebSocket server");
        newSocket.emit("join_room", {
          senderID: 1,
          projectID: projectId,
        });
    });

    newSocket.on("new_join", (roomData) => {
        console.log("Received new message:", roomData);
    });

    newSocket.on("new_message", (musicData) => {
      console.log("Received new message:", musicData);
      const socketNote = String(musicData.data.note);
      const socketVelocity = musicData.data.velocity; 
      setNotes((prevNotes) => [...prevNotes, socketNote]);
      playNoteLocally(socketNote, socketVelocity);
    });

    newSocket.on("new_backspace", (roomData) => {
      console.log("Received new backspace:", roomData);
      setNotes((prevNotes) => prevNotes.slice(0, -1));
  });

    return () => {
        newSocket.disconnect();
        console.log("Disconnected from WebSocket server");
    };
  }, []);

  /*
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
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1, paddingRight: '20px' }}>
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

        {/* Virtual Keyboard and Backspace Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
          <div style={{ display: 'inline-flex', gap: '20px' }}>
            {instrument ? (
              <VirtualKeyboard onPlayNote={playNote} />
            ) : (
              <div>Loading instrument...</div>
            )}

            {/* Backspace Button */}
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                if (socket && socket.connected) {
                  socket.emit("backspace", { projectID: projectId });
                }
              }}
              style={{ padding: '0px 20px', height: '70px' }}
            >
              Backspace
            </Button>
          </div>
        </div>
      </div>

      {/* Note Log Sidebar */}
  <div style={{ width: '250px', padding: '10px', borderLeft: '1px solid #ddd', height: 'calc(100vh - 150px)', overflowY: 'auto' }}>
    <Typography variant="h6">Note Log</Typography>
    <ul style={{ listStyleType: 'none', padding: 0 }}>
      {notes.map((note, index) => (
        <li
          key={index}
          style={{
            padding: '5px 0',
            borderBottom: index !== notes.length - 1 ? '1px solid #ccc' : 'none',
          }}
        >
          {note}
        </li>
      ))}
    </ul>
  </div>
    </div>
  );
}

export default MusicEditor;
