import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const ESP32_IP = "https://robot-controller.duckdns.org";
  const [status, setStatus] = useState("Connected. Waiting for command.");

  const sendCommand = async (direction) => {
    setStatus(`Sending command: ${direction}...`);

    try {
      const response = await fetch(`${ESP32_IP}/${direction}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.ok) {
        setStatus(`Success: Robot ${direction}`);
      } else {
        setStatus(`Error: Command ${direction} failed`);
      }
    } catch (error) {
      console.error("Network Error:", error);
      setStatus("Error: Cannot connect to ESP32.");
    }
  };

  // Listen for keyboard events
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault(); // Prevents page from scrolling
          sendCommand('forward');
          break;
        case 'ArrowDown':
          event.preventDefault();
          sendCommand('backward');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          sendCommand('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          sendCommand('right');
          break;
        case ' ': // Spacebar
          event.preventDefault();
          sendCommand('stop');
          break;
        case 'Enter':
          event.preventDefault();
          sendCommand('turn-on'); // Sends a "turn-on" command
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
  }, []); // Empty dependency array ensures this only sets up once

  return (
    <div className="App">
      <header className="App-header">
        <h1>ESP32 Robot Controller</h1>
        <p className="status-text">{status}</p>

        <div className="d-pad">
          {/* Top Row */}
          <div className="row">
            <button className="control-btn forward" onClick={() => sendCommand('forward')}>
              Forward (↑)
            </button>
          </div>

          {/* Middle Row */}
          <div className="row">
            <button className="control-btn left" onClick={() => sendCommand('left')}>
              Left (←)
            </button>
            <button className="control-btn stop" onClick={() => sendCommand('stop')}>
              STOP (Space)
            </button>
            <button className="control-btn right" onClick={() => sendCommand('right')}>
              Right (→)
            </button>
          </div>

          {/* Bottom Row */}
          <div className="row">
            <button className="control-btn backward" onClick={() => sendCommand('backward')}>
              Backward (↓)
            </button>
          </div>

          {/* Power Button */}
          <div className="row" style={{ marginTop: '20px' }}>
             <button className="control-btn" style={{ backgroundColor: '#2196F3' }} onClick={() => sendCommand('turn-on')}>
              Turn On (Enter)
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;