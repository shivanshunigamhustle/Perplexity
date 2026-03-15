import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
    withCredentials: true,
    autoConnect: false
});

export const initializeSocketConnection = () => {

    socket.connect();

    socket.on("connect", () => {
        console.log("Connected to Socket.IO server:", socket.id);
    });

};