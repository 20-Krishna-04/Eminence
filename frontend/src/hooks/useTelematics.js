import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';

const API_BASE_URL = api.defaults.baseURL;

export const useTelematics = (activeTab, token) => {
  const [telemetry, setTelemetry] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState({ provider: 'unknown', simulated: false, connected: false });

  useEffect(() => {
    if (activeTab !== 'telematics') return;
    
    // Some logic in original code uses replace('/api', '')
    const telemetrySocket = io(API_BASE_URL.replace('/api', ''), {
      auth: { token },
      withCredentials: true,
    });
    
    telemetrySocket.emit('join_admin_telemetry');

    telemetrySocket.on('telemetry_status', setStatus);
    telemetrySocket.on('telemetry_history', setHistory);
    
    telemetrySocket.on('telemetry_update', (data) => {
      setTelemetry(data);
      setHistory((previous) => [...previous, data].slice(-30));
    });

    telemetrySocket.on('connect_error', (err) => {
      console.error('Telematics socket connection error:', err.message);
    });

    return () => {
      telemetrySocket.emit('leave_admin_telemetry');
      telemetrySocket.disconnect();
    };
  }, [activeTab, token]);

  return { telemetry, history, status };
};
