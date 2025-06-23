import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

function Header() {
  const { connectionStatus } = useWebSocket();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'Connected':
        return 'bg-green-500';
      case 'Reconnecting':
        return 'bg-yellow-500';
      case 'Disconnected':
      case 'Error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">
            🧬 Endorphin AI
          </h1>
          <span className="header-subtitle">Test Runner</span>
        </div>
        
        <div className="header-right">
          <div className="connection-status">
            <div className={`status-indicator ${getStatusColor()}`}></div>
            <span className="status-text">{connectionStatus}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
