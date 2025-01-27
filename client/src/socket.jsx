import { createContext, useContext, useMemo } from 'react';
import io from 'socket.io-client'
import { server } from "./constants/config"


// Creating a Context to provide socket instance throughout the app
const SocketContext = createContext();

// Custom hook to get the socket instance from the context
const getSocket = () => useContext(SocketContext);

// SocketProvider component that establishes the socket connection
const SocketProvider = ({ children }) => {
    // Using useMemo to create and memoize the socket connection instance
    const socket = useMemo(
        () => io(server, { withCredentials: true }), // Creating a socket instance and passing the server URL with credentials
        []);

    return (
        // Providing the socket instance to the component tree via context
        <SocketContext.Provider value={socket}>
            {children} 
        </SocketContext.Provider>
    );
}

export { SocketProvider, getSocket }



