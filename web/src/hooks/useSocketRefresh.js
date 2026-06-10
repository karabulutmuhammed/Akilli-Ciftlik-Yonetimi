import { useEffect } from "react";
import { io } from "socket.io-client";

export default function useSocketRefresh(onRefresh) {
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:4000");
    socket.on("data:changed", () => onRefresh?.());
    return () => socket.disconnect();
  }, [onRefresh]);
}
