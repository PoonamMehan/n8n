'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setSocket, disconnectSocket } from '../app/ReduxStore/features/socket/socketSlice';
import { toast } from 'sonner';

export const SocketInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const connectSocket = async () => {
      try {
        console.log("I am fetching token for ws connection.")
        const response = await fetch('/api/v1/auth/generateTokenForWsConnection', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const tokenData = await response.json();
          const token = tokenData.token;
          console.log("Token received from the server: ", token);
          if (!token) {
            console.log("No token received from the server, hence the ws connection cannot be established.");
            toast.error("Unable to connect to the WS server.");
            return;
          }
          const socket = new WebSocket(`ws://localhost:8080?token=${token}`);

          socket.onopen = () => {
            console.log('Connected to WebSocket');
            dispatch(setSocket(socket));
            toast.success("Connected to WebSocket.");
          };

          socket.onclose = (event) => {
            console.log('WebSocket disconnected, code: ', event.code, ", reason: ", event.reason);
            dispatch(disconnectSocket());
          };

        } else {
          console.log('Unable to connect to the WS server');
        }
      } catch (err: any) {
        console.error("Error connecting to WebSocket:", err.message);
      }
    };

    connectSocket();

    return () => {
      dispatch(disconnectSocket());
    };
  }, [dispatch]);

  return null;
};
