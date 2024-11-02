// src/pages/MusicEditor.js

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
<<<<<<< Updated upstream
import { initWebSocket } from '../utils/websocket';
import { Typography } from '@mui/material';
import VirtualKeyboard from '../components/VirtualKeyboard';
import MusicNotation from '../components/MusicNotation';
import Soundfont from 'soundfont-player';
=======
//import { initWebSocket } from '../utils/websocket';
import { Typography, ButtonGroup, Button } from '@mui/material';
import VirtualKeyboard from '../components/VirtualKeyboard';
import MusicNotation from '../components/MusicNotation';
import PianoRoll from '../components/PianoRoll';
import * as Tone from 'tone';
import api from '../utils/api';
import { io } from 'socket.io-client';

>>>>>>> Stashed changes

function MusicEditor() {
  const [notes, setNotes] = useState([]);
  const { projectId } = useParams();
  const wsRef = useRef(null);
  const [instrument, setInstrument] = useState(null);
<<<<<<< Updated upstream
  const [instrumentName, setInstrumentName] = useState('acoustic_grand_piano');
  const [audioContext] = useState(new (window.AudioContext || window.webkitAudioContext)());

  // Load the selected instrument with error handling
=======
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
  guitar: new Tone.Sampler({
    urls: {
      E2: 'E2.mp3',
      A2: 'A2.mp3',
      D3: 'D3.mp3',
      G3: 'G3.mp3',
      B3: 'B3.mp3',
      E4: 'E4.mp3',
    },
    baseUrl: 'https://your-sample-url/guitar/', // Replace with your actual sample URL
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
      // Update notation - taken out because client updates notation on reception of socket event
      //setNotes((prevNotes) => [...prevNotes, note]);
    },
    [instrument]
  );

  /**
   * Handle playing a note locally and sending it to the server
   */
  const playNote = useCallback(
    (note, velocity) => {
      // Construct the message object to send to the server
      const message = {
        senderID: 1, // Replace with the actual sender ID as needed
        projectID: projectId, // Use the project ID from the URL parameters
        data: {
          type: 'notePlayed', // Optional: specify the type of data
          note: note, // The note being played
          velocity: velocity, // The velocity of the note
          // Add any additional data as needed for the front-end to interpret
        },
      };
  
      // Send the message as a JSON string
      if (socket && socket.connected) {
        socket.emit("message", message); // Serialize to JSON string
      }
  
      // Play note locally
      playNoteLocally(note, velocity);
    },
    [playNoteLocally, projectId, socket]
  );
  
  
  

  /**
   * Load the selected instrument whenever instrumentName or instrumentOptions change.
   */
>>>>>>> Stashed changes
  useEffect(() => {
    Soundfont.instrument(audioContext, instrumentName)
      .then(inst => {
        setInstrument(inst);
      })
      .catch(error => {
        console.error('Failed to load instrument:', error);
      });
  }, [audioContext, instrumentName]);

<<<<<<< Updated upstream
  // Initialize WebSocket
=======
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
    const newSocket = io("http://192.168.1.67:8000", {
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
        // Handle incoming data here
    });

    newSocket.on("new_message", (musicData) => {
      console.log("Received new message:", musicData);
      //setNotes(musicData.data)
      //setNotes((prevNotes) => [musicData['data']['notes']]);
      
      const socketNote = String(musicData.data.note);
      const socketVelocity = musicData.data.velocity; 
  
  // Optionally, you can also use senderID or projectID if needed
  
  // Update the notes state with the new note
      setNotes((prevNotes) => [...prevNotes, socketNote]);

  // Optionally, play the note locally
      playNoteLocally(socketNote, socketVelocity);
    });

    return () => {
        newSocket.disconnect();
        console.log("Disconnected from WebSocket server");
    };
  }, []);

  /*
>>>>>>> Stashed changes
  useEffect(() => {
    const ws = initWebSocket(projectId);
    wsRef.current = ws;

    ws.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.type === 'notePlayed') {
        playNoteLocally(message.data.note, message.data.velocity);
      }
    };

    return () => {
      ws.close();
    };
<<<<<<< Updated upstream
=======
  }, [projectId, playNoteLocally]);
  */

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
>>>>>>> Stashed changes
  }, [projectId]);

  // Handle playing a note locally and sending it to the server
  const playNote = (note, velocity) => {
    // Send note to server
    const message = {
      type: 'notePlayed',
      data: { note, velocity },
    };
    wsRef.current.send(JSON.stringify(message));

    // Play note locally
    playNoteLocally(note, velocity);
  };

  // Handle playing a note received from the server
  const playNoteLocally = (note, velocity) => {
    if (instrument) {
      // Check if the AudioContext is suspended and resume it
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      instrument.play(note, audioContext.currentTime, { gain: velocity });
    }
    // Update notation
    addNoteToNotation(note);
  };

  // Update the notation with the new note
  const addNoteToNotation = note => {
    const noteMapping = {
      C4: 'c/4',
      D4: 'd/4',
      E4: 'e/4',
      F4: 'f/4',
      G4: 'g/4',
      A4: 'a/4',
      B4: 'b/4',
      C5: 'c/5',
    };
    setNotes(prevNotes => [...prevNotes, noteMapping[note]]);
  };

  // Handle instrument selection change
  const handleInstrumentChange = event => {
    setInstrumentName(event.target.value);
  };

  return (
    <div>
      <Typography variant="h4">Music Editor</Typography>

      {/* Instrument Selector */}
      <div>
        <select value={instrumentName} onChange={handleInstrumentChange}>
          <option value="acoustic_grand_piano">Piano</option>
          <option value="violin">Violin</option>
          <option value="trumpet">Trumpet</option>
          <option value="electric_guitar_jazz">Electric Guitar</option>
          {/* Add more options as needed */}
        </select>
      </div>

      <MusicNotation notes={notes} />

      {instrument ? (
        <VirtualKeyboard
          instrument={instrument}
          audioContext={audioContext}
          onPlayNote={playNote}
        />
      ) : (
        <div>Loading instrument...</div>
      )}
    </div>
  );
}

export default MusicEditor;
