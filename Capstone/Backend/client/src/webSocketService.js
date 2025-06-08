import { createContext } from 'react';
import { io } from 'socket.io-client';

// Create WebSocket Context
export const WebSocketContext = createContext(null);

// Connect to WebSocket server
export const socket = io("http://localhost:5000", {
    transports: ['websocket'],
    withCredentials: true,
});

// Function to set up WebSocket listeners
export function setupWebSocket(setDatabaseUpdates) {
    // Listen for real-time database updates (ALL changes)
    socket.on("databaseUpdate", (change) => {
        console.log("Database Update Received:", change);
        setDatabaseUpdates((prevUpdates) => [...prevUpdates, change]); 
    });
}