// src/pages/MusicEditor.js

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import { Typography, ButtonGroup, Button, Slider, Box } from '@mui/material';
import VirtualKeyboard from '../components/VirtualKeyboard';
import MusicNotation from '../components/MusicNotation';
import PianoRoll from '../components/PianoRoll';
import * as Tone from 'tone';
import api from '../utils/api';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique client IDs

function MusicEditor() {
  const [notes, setNotes] = useState([]);
  const { projectId } = useParams();
  const wsRef = useRef(null);
  const [instrument, setInstrument] = useState(null);
  const [instrumentName, setInstrumentName] = useState('piano');
  const [viewMode, setViewMode] = useState('staff'); // 'staff' or 'pianoRoll'
  const [socket, setSocket] = useState(null);
  const [bpm, setBpm] = useState(120); // Default BPM
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInstrumentReady, setIsInstrumentReady] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('4n'); // Default quarter note
  const [timeSignature, setTimeSignature] = useState('4/4'); // Default time signature
  const [cursorPosition, setCursorPosition] = useState(0); // Cursor position in notes array
  const [changeLog, setChangeLog] = useState([]); // Persistent change log

  // User info
  const [user, setUser] = useState({ username: '', email: '' });

  // Generate a unique client ID
  const clientId = useMemo(() => uuidv4(), []);

  // State for user colors
  const [userColors, setUserColors] = useState({});

  function getUserColor(userId) {
    if (!userColors[userId]) {
      const newColor = generateRandomColor();
      setUserColors((prevColors) => ({ ...prevColors, [userId]: newColor }));
    }
    return userColors[userId];
  }

  function generateRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  /**
   * Memoize instrumentOptions to prevent unnecessary re-creations on each render.
   */
  const instrumentOptions = useMemo(
    () => ({
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
    }),
    []
  );

  // Initialize Tone.Transport
  useEffect(() => {
    // Set the initial BPM
    Tone.Transport.bpm.value = bpm;

    return () => {
      Tone.Transport.stop();
      Tone.Transport.cancel(); // Clear any scheduled events
    };
  }, []);

  // Handle BPM changes
  const handleBpmChange = (event, newValue) => {
    setBpm(newValue);
    Tone.Transport.bpm.value = newValue;
  };

  // Schedule notes for playback
  const scheduleNotes = useCallback(() => {
    Tone.Transport.cancel();
  
    if (notes.length === 0) return;
  
    let cumulativeTime = 0;
  
    const events = notes.map((note) => {
      const durationInSeconds = Tone.Time(note.duration).toSeconds();
  
      const scheduledEvent = {
        time: cumulativeTime,
        duration: note.duration || '8n',
      };
  
      cumulativeTime += durationInSeconds;
  
      if (note.pitch && note.pitch !== 'rest' && note.pitch !== '-Infinity') {
        scheduledEvent.pitch = note.pitch;
      } else {
        scheduledEvent.isRest = true;
      }
  
      return scheduledEvent;
    });
  
    const part = new Tone.Part(
      (time, event) => {
        if (event.isRest) {
          // Do nothing for rests; the cumulativeTime already accounts for the silence
        } else if (instrument && isInstrumentReady && event.pitch) {
          instrument.triggerAttackRelease(event.pitch, event.duration, time);
        }
      },
      events
    ).start(0);
  }, [notes, instrument, isInstrumentReady]);
  

  // Playback controls
  const handlePlay = () => {
    if (!isPlaying) {
      scheduleNotes();
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (isPlaying) {
      Tone.Transport.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    setIsPlaying(false);
  };

  /**
   * Define playNoteLocally before it's used in useEffect and other hooks.
   */
  const playNoteLocally = useCallback(
    (note, velocity) => {
      console.log(`Playing note: ${note}, Velocity: ${velocity}`);
      if (instrument && isInstrumentReady) {
        // Ensure AudioContext is started
        if (Tone.context.state !== 'running') {
          Tone.start();
        }
        // Trigger the attack and release of the note
        instrument.triggerAttackRelease(
          note,
          selectedDuration,
          Tone.now(),
          velocity / 127
        );
      } else {
        console.warn('Instrument is not ready to play.');
      }
    },
    [instrument, isInstrumentReady, selectedDuration]
  );

  /**
   * Handle playing a note locally and sending it to the server
   */
  const playNote = useCallback(
    (note, velocity) => {
      console.log("playNote activated")
      // Send note to server
      const message = {
        senderID: user.username, // Use unique clientId
        projectID: projectId,
        data: {
          type: 'notePlayed',
          note: note,
          velocity: velocity,
          duration: selectedDuration,
          cursorPosition: cursorPosition,
        },
      };

      if (socket && socket.connected) {
        socket.emit('message', message);
        console.log("message emitted.")
      }

      // Play note locally (but don't add to notes array)
      playNoteLocally(note, velocity);

      // Add the note to the notes array locally
      /*
      setNotes((prevNotes) => {
        const newNotes = [...prevNotes];
        newNotes.splice(cursorPosition, 0, {
          pitch: note,
          duration: selectedDuration,
          userId: user.username,
        });
        return newNotes;
      });
      */

      // Move cursor to next position
      setCursorPosition((prevPosition) => prevPosition + 1);

      // Record the action in the change log
      /*
      setChangeLog((prevLog) => [
        ...prevLog,
        {
          action: 'noteAdded',
          note: note,
          duration: selectedDuration,
          userId: clientId,
          timestamp: Date.now(),
        },
      ]);
      */
    },
    [
      playNoteLocally,
      socket,
      projectId,
      clientId,
      selectedDuration,
      cursorPosition,
    ]
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

        // Reset instrument ready state
        setIsInstrumentReady(false);

        // Create the new instrument
        const selectedInstrument = instrumentOptions[instrumentName];

        // Set the instrument immediately
        setInstrument(selectedInstrument);

        // If using a Sampler, ensure samples are loaded
        if (instrumentName === 'piano') {
          await Tone.loaded(); // Wait for all samples to load
        }

        // Mark instrument as ready
        setIsInstrumentReady(true);
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
  }, [instrumentName, instrumentOptions]);

  var iteration = 1;
  //Get user information
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/user/');
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user data', err);
      }
    };
    fetchUser();
  }, []);


  // Establish a connection to the websocket
  useEffect(() => {
    if (iteration > 1) return; //prevents from running if it already exists
    iteration+=1;
    
    const newSocket = io('http://192.168.1.175:8000', {
      transports: ['websocket'],
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server. Iteration: ', iteration);
      newSocket.emit('join_room', {
        senderID: user.username,
        projectID: projectId,
      });
    });

    newSocket.on('new_join', (roomData) => {
      console.log('Received new join:', roomData);
    });

    newSocket.on('new_message', (musicData) => {
      console.log('Received new message:', musicData);
    
      const senderID = musicData.senderID;
      const data = musicData.data;
      const type = data.type;
      const position = data.cursorPosition || notes.length;
    
      if (type === 'notePlayed') {
        const socketNote = data.note;
        const socketVelocity = data.velocity;
        const duration = data.duration || '8n';
    
        // Add the note to the notes array
        setNotes((prevNotes) => {
          const newNotes = [...prevNotes];
          newNotes.splice(position, 0, {
            pitch: socketNote,
            duration: duration,
            userId: senderID,
          });
          return newNotes;
        });
    
        // Update the change log
        setChangeLog((prevLog) => [
          ...prevLog,
          {
            action: 'noteAdded',
            note: socketNote,
            duration: duration,
            userId: senderID,
            timestamp: Date.now(),
          },
        ]);
    
        // Play the note locally if it's not from the current user
        if (senderID !== user.username) {
          playNoteLocally(socketNote, socketVelocity);
        }
    
      } else if (type === 'restAdded') {
        const duration = data.duration || '8n';
    
        // Add the rest to the notes array
        setNotes((prevNotes) => {
          const newNotes = [...prevNotes];
          newNotes.splice(position, 0, {
            pitch: 'rest',
            duration: duration,
            userId: senderID,
          });
          return newNotes;
        });
    
        // Update the change log
        setChangeLog((prevLog) => [
          ...prevLog,
          {
            action: 'restAdded',
            duration: duration,
            userId: senderID,
            timestamp: Date.now(),
          },
        ]);
    
        // No need to play a sound for rests
      } else if (type === 'noteDeleted') {
        // Handle note deletion
        setNotes((prevNotes) => {
          if (position > 0) {
            const newNotes = [...prevNotes];
            newNotes.splice(position - 1, 1);
            return newNotes;
          }
          return prevNotes;
        });
    
        // Update the change log
        setChangeLog((prevLog) => [
          ...prevLog,
          {
            action: 'noteDeleted',
            userId: senderID,
            timestamp: Date.now(),
          },
        ]);
      }
    });
    

    newSocket.on('new_backspace', (data) => {
      console.log('Received new backspace:', data);

      const senderID = data.senderID;
      const position = data.cursorPosition;

      // Remove the note at the specified position
      setNotes((prevNotes) => {
        if (position > 0) {
          const newNotes = [...prevNotes];
          newNotes.splice(position - 1, 1);
          return newNotes;
        }
        return prevNotes;
      });

      // Record the action in the change log
      setChangeLog((prevLog) => [
        ...prevLog,
        {
          action: 'noteDeleted',
          userId: senderID,
          timestamp: Date.now(),
        },
      ]);
    });

    /*
    return () => {
      newSocket.disconnect();
      console.log('Disconnected from WebSocket server');
    };
    */
  }, []);

  //projectId, clientId, playNoteLocally, notes.length

  /*
   * Handle instrument selection change
   */
  const handleInstrumentChange = useCallback((event) => {
    setInstrumentName(event.target.value);
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
        const loadedNotes = response.data.notes;

        // Convert old note format to new format if necessary
        const formattedNotes = loadedNotes.map((note) => {
          if (typeof note === 'string') {
            // Old format: string
            return {
              pitch: note,
              duration: '8n', // Default duration
              userId: 'unknown', // Default userId
            };
          } else {
            // New format: object
            // Assign color to user
            //getUserColor(note.userId || 'unknown');
            return note;
          }
        });

        setNotes(formattedNotes);
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
       {/* <ButtonGroup variant="contained" style={{ marginTop: '20px' }}>
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
        </ButtonGroup> */}

        {/* BPM Slider */}
        <Box sx={{ width: 300, marginTop: '20px' }}>
          <Typography gutterBottom>BPM: {bpm}</Typography>
          <Slider
            value={bpm}
            onChange={handleBpmChange}
            min={60}
            max={200}
            step={1}
            aria-labelledby="bpm-slider"
          />
        </Box>

        {/* Time Signature Selector */}
        <div style={{ margin: '20px 0' }}>
          <label>Select Time Signature: </label>
          <select
            value={timeSignature}
            onChange={(e) => setTimeSignature(e.target.value)}
          >
            <option value="2/4">2/4</option>
            <option value="3/4">3/4</option>
            <option value="4/4">4/4</option>
            <option value="6/8">6/8</option>
            {/* Add more options as needed */}
          </select>
        </div>

        {/* Note Duration Selector */}
        <div style={{ margin: '20px 0' }}>
          <label>Select Note Duration: </label>
          <select
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value)}
          >
            <option value="1n">Whole Note</option>
            <option value="2n">Half Note</option>
            <option value="4n">Quarter Note</option>
            <option value="8n">Eighth Note</option>
            <option value="16n">Sixteenth Note</option>
            {/* Add more options as needed */}
          </select>
        </div>

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
            {/* Add more options as needed */}
          </select>
        </div>

        {/* Cursor Controls */}
        <div style={{ paddingLeft: '20px', paddingRight: '20px', marginBottom: '20px' }}> 
        <ButtonGroup variant="contained" style={{ marginTop: '20px' }}>
          <Button
            onClick={() => setCursorPosition((prev) => Math.max(prev - 1, 0))}
            disabled={cursorPosition === 0}
          >
            Move Left
          </Button>
          <Button
            onClick={() =>
              setCursorPosition((prev) => Math.min(prev + 1, notes.length))
            }
            disabled={cursorPosition === notes.length}
          >
            Move Right
          </Button>
        </ButtonGroup>

        {/* Playback Controls */}
        <ButtonGroup variant="contained" style={{ marginTop: '20px', marginLeft: '45px' }}>
          <Button onClick={handlePlay} disabled={isPlaying}>
            Play
          </Button>
          <Button onClick={handlePause} disabled={!isPlaying}>
            Pause
          </Button>
          <Button onClick={handleStop}>Stop</Button>
        </ButtonGroup>
        </div>

        {/* Virtual Keyboard and Backspace Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '20px',
          }}
        ></div>

        {/* Main Content */}
        {viewMode === 'staff' ? (
          <MusicNotation
            notes={notes}
            userColors={userColors}
            timeSignature={timeSignature}
            cursorPosition={cursorPosition}
          />
        ) : (
          <PianoRoll
            notes={notes}
            onAddNote={(note) => setNotes((prevNotes) => [...prevNotes, note])}
          />
        )}

        {/* Virtual Keyboard and Backspace Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '20px',
          }}
        >
          <div style={{ display: 'inline-flex', gap: '20px' }}>
            {instrument && isInstrumentReady ? (
              <VirtualKeyboard onPlayNote={playNote} />
            ) : (
              <div>Loading instrument...</div>
            )}

            {/* Backspace Button */}
            <div style={{ paddingLeft: '0px', paddingRight: '20px'}}></div>
            <Button 
              variant="contained" style={{ marginTop: '20px' }}
              onClick={() => {
                if (socket && socket.connected && cursorPosition>0) {
                  socket.emit('backspace', {
                    projectID: projectId,
                    senderID: user.username,
                    cursorPosition: cursorPosition,
                  });
                }

                // Move cursor back
                setCursorPosition((prevPosition) =>
                  Math.max(prevPosition - 1, 0)
                );

                // Record the action in the change log

              }}
              style={{ padding: '0px 20px', height: '45px'  }}
            >
              Backspace
            </Button>

            <Button
              variant="contained" style={{ marginTop: '20px' }}
                onClick={() => {
                    setCursorPosition((prevPosition) => prevPosition + 1);

                    // Record the action in the change log
                    setChangeLog((prevLog) => [
                        ...prevLog,
                        {
                            action: 'restAdded',
                            duration: selectedDuration,
                            userId: user.username,
                            timestamp: Date.now(),
                        },
                    ]);

                    // Send to server
                    if (socket && socket.connected) {
                        const message = {
                            senderID: user.username,
                            projectID: projectId,
                            data: {
                                type: 'restAdded',
                                duration: selectedDuration,
                                cursorPosition: cursorPosition,
                            },
                        };
                        socket.emit('message', message);
                    }
                }}
                style={{ padding: '0 20px', height: '45px'}}
            >
                Add Rest
            </Button>
          </div>
        </div>
      </div>

      {/* Change Log Sidebar */}
      <div
        style={{
          width: '250px',
          padding: '10px',
          borderLeft: '1px solid #ddd',
          height: 'calc(100vh - 150px)',
          overflowY: 'auto',
        }}
      >
        <Typography variant="h6">Change Log</Typography>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {changeLog.map((entry, index) => (
            <li
              key={index}
              style={{
                padding: '5px 0',
                borderBottom:
                  index !== changeLog.length - 1 ? '1px solid #ccc' : 'none',
                color: userColors[entry.userId] || 'black',
              }}
            >
              {entry.action === 'noteAdded' ? (
                <>
                  Note {entry.note} added by {entry.userId}
                </>
              ) : entry.action === 'noteDeleted' ? (
                <>Note deleted by {entry.userId}</>
              ) : entry.action === 'restAdded' ? (
                <>Rest added by {entry.userId}</>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MusicEditor;
