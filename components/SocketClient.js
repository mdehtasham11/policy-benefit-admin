import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import SoundService from '../services/SoundService';

const SocketClient = ({ onEvent, children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const serverUrl = 'http://192.168.1.6:9010';

  useEffect(() => {
    // Connect to the server
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', serverUrl);
      setConnected(true);
    });

    newSocket.on('disconnect', reason => {
      console.log('❌ Disconnected from server:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', error => {
      console.log('🚫 Connection error:', error.message);
      setConnected(false);
    });

    newSocket.on('reconnect', attemptNumber => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
      setConnected(true);
    });

    newSocket.on('site:event', data => {
      console.log('📨 Received event:', data);
      SoundService.playNotification(data.type);
      if (onEvent) {
        onEvent(data);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [onEvent]);

  // Helper function to check connection status
  const checkConnection = () => {
    if (!socket) return false;
    return socket.connected;
  };

  return children({
    socket,
    connected,
    // socketId: socket?.id,
    socketUrl: serverUrl,
    checkConnection,
    soundService: SoundService,
  });
};

export default SocketClient;
