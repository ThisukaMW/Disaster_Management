// Network Status Indicator Component
import { useState, useEffect } from 'react';
import { subscribeToNetworkStatus } from '../services/networkService';
import './NetworkStatus.css';

const NetworkStatus = () => {
  const [status, setStatus] = useState({ online: navigator.onLine });

  useEffect(() => {
    const unsubscribe = subscribeToNetworkStatus(setStatus);
    return unsubscribe;
  }, []);

  return (
    <div className={`network-status ${status.online ? 'online' : 'offline'}`}>
      <div className="network-indicator">
        <span className="network-dot"></span>
        <span className="network-text">
          {status.online ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
};

export default NetworkStatus;

