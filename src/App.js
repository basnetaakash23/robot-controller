import React, { useCallback, useEffect, useRef, useState } from 'react';

import './App.css';

function App() {
  const WEBSOCKET_URL = "ws://192.168.1.27:81";
  const socketRef = useRef(null);
  const [connectionState, setConnectionState] = useState("connecting");
  const [status, setStatus] = useState("Connecting to robot...");

  const commandIntervalRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket(WEBSOCKET_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnectionState("connected");
      setStatus("Connected. Waiting for command.");
    };

    socket.onclose = () => {
      setConnectionState("disconnected");
      setStatus("Disconnected from robot.");
    };

    socket.onerror = () => {
      setConnectionState("disconnected");
      setStatus("Error: Cannot connect to robot.");
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

    const startMoving = useCallback((event, direction) => {
    event.currentTarget.setPointerCapture(event.pointerId);

    sendCommand(direction); // Send immediately; no initial delay

    commandIntervalRef.current = window.setInterval(() => {
      sendCommand(direction);
    }, 100); // 10 messages per second
  },[]);

  const stopMoving = () => {
    if (commandIntervalRef.current !== null) {
      window.clearInterval(commandIntervalRef.current);
      commandIntervalRef.current = null;
    }

    sendCommand('stop');
  };

  const sendCommand = (direction) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setStatus("Robot is not connected.");
      return;
    }

    socket.send(direction);
    setStatus(`Success: Robot ${direction}`);
  };

  // Listen for keyboard events
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault(); // Prevents page from scrolling
          startMoving(event, 'forward');
          break;
        case 'ArrowDown':
          event.preventDefault();
           startMoving(event, 'backward');
          break;
        case 'ArrowLeft':
          event.preventDefault();
           startMoving(event, 'left');
          break;
        case 'ArrowRight':
          event.preventDefault();
           startMoving(event, 'right');
          break;
        case ' ': // Spacebar
          event.preventDefault();
          stopMoving();
          break;
        case 'Enter':
          event.preventDefault();
          sendCommand('round');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [startMoving, stopMoving]); // Empty dependency array ensures this only sets up once

  return (
    <div className="App">
      <header className="App-header">
        <h1>ESP32 Robot Controller</h1>
        <p className={`status-text ${connectionState}`}>{status}</p>

        <div className="d-pad">
          {/* Top Row */}
          <div className="row">
            <button className="control-btn forward" 
              onPointerDown={(event) => startMoving(event, 'forward')}
              onPointerUp={stopMoving}
              onPointerLeave={stopMoving}
              onPointerCancel={stopMoving}
              >
              Forward (↑)
            </button>
          </div>

          {/* Middle Row */}
          <div className="row">
            <button className="control-btn left" 
              onPointerDown={(event) => startMoving(event, 'left')}
              onPointerUp={stopMoving}
              onPointerLeave={stopMoving}
              onPointerCancel={stopMoving}>
              Left (←)
            </button>
            <button className="control-btn stop" 
              onPointerDown={(event) => startMoving(event, 'stop')}
              onPointerUp={stopMoving}
              onPointerLeave={stopMoving}
              onPointerCancel={stopMoving}>
              STOP (Space)
            </button>
            <button className="control-btn right" 
              onPointerDown={(event) => startMoving(event, 'right')}
              onPointerUp={stopMoving}
              onPointerLeave={stopMoving}
              onPointerCancel={stopMoving}>
              Right (→)
            </button>
          </div>

          {/* Bottom Row */}
          <div className="row">
            <button className="control-btn backward"
              onPointerDown={(event) => startMoving(event, 'backward')}
              onPointerUp={stopMoving}
              onPointerLeave={stopMoving}
              onPointerCancel={stopMoving}>
              Backward (↓)
            </button>
          </div>

          {/* Spin Button */}
          <div className="row" style={{ marginTop: '20px' }}>
            <button className="control-btn power" onClick={() => sendCommand('round')}>
              Round (Enter)
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;