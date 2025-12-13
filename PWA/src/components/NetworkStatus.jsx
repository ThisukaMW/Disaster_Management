// Network Status Indicator Component - Crisis-Optimized
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
    <div className={`network-status-banner ${status.online ? 'online' : 'offline'}`}>
      <div className="network-banner-content">
        <span className="network-icon">
          {status.online ? '🟢' : '🔴'}
        </span>
        <span className="network-text">
          {status.online ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
};

export default NetworkStatus;

