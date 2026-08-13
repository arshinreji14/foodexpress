import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export function useOrderSocket(orderId, initialStatus) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (!orderId) return;

    const socket = io(SOCKET_URL);

    socket.emit("joinOrder", orderId);

    socket.on("orderStatusUpdate", (payload) => {
      if (String(payload.orderId) === String(orderId)) {
        setStatus(payload.status);
      }
    });

    return () => {
      socket.emit("leaveOrder", orderId);
      socket.disconnect();
    };
  }, [orderId]);

  return status;
}
