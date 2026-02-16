import { useState, useEffect, useRef } from 'react';

/**
 * DebugConsole - Kleine eingebettete Konsole für Debug-Output.
 */
function DebugConsole() {
  let [logs, setLogs] = useState([]);
  let [isOpen, setIsOpen] = useState(true);
  let scrollRef = useRef(null);

  useEffect(function() {
    let originalLog = console.log;

    console.log = function() {
      let args = Array.prototype.slice.call(arguments);
      let message = args.map(function(arg) {
        if (typeof arg === 'object' && arg !== null) {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return '[Object]';
          }
        }
        return String(arg);
      }).join(' ');

      setLogs(function(prev) {
        let newLogs = prev.slice(-50);
        newLogs.push({ time: new Date().toLocaleTimeString(), message: message });
        return newLogs;
      });

      originalLog.apply(console, arguments);
    };

    return function() {
      console.log = originalLog;
    };
  }, []);

  useEffect(function() {
    if (scrollRef.current !== null) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  function handleClear() {
    setLogs([]);
  }

  function handleToggle() {
    setIsOpen(!isOpen);
  }

  let containerStyle = {
    position: 'fixed',
    bottom: '10px',
    left: '10px',
    width: '400px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '11px',
    zIndex: 9999,
    border: '1px solid #444'
  };

  let headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 10px',
    backgroundColor: '#333',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    color: '#4ECDC4',
    cursor: 'pointer'
  };

  let contentStyle = {
    maxHeight: isOpen ? '200px' : '0px',
    overflow: 'auto',
    transition: 'max-height 0.2s',
    padding: isOpen ? '8px' : '0px'
  };

  let logStyle = {
    color: '#ccc',
    marginBottom: '4px',
    borderBottom: '1px solid #333',
    paddingBottom: '4px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all'
  };

  let timeStyle = {
    color: '#888',
    marginRight: '8px'
  };

  let buttonStyle = {
    background: '#555',
    border: 'none',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '10px',
    marginLeft: '8px'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle} onClick={handleToggle}>
        <span>Debug Console ({logs.length})</span>
        <div>
          <button style={buttonStyle} onClick={function(e) { e.stopPropagation(); handleClear(); }}>Clear</button>
          <span style={{ marginLeft: '8px' }}>{isOpen ? '▼' : '▲'}</span>
        </div>
      </div>
      <div style={contentStyle} ref={scrollRef}>
        {logs.map(function(log, index) {
          return (
            <div key={index} style={logStyle}>
              <span style={timeStyle}>{log.time}</span>
              {log.message}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DebugConsole;
