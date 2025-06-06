import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', {
  auth: {
    token: localStorage.getItem('token'),
  },
  withCredentials: true,
  transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
});

socket.on('connect', () => {
  console.log('Connected to Socket.IO server');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message);
});

export default socket;