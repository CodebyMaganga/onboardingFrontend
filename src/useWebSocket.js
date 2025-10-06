import { useEffect, useRef, useState } from "react";
import { useFormStore } from "./store/context";

export default function useWebSocket(url) {
  const [messages, setMessages] = useState([]);
  const { dispatch } = useFormStore();
  const socketRef = useRef(null); 

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
        dispatch({ type: "SET_NOTIFICATIONS", payload: data });
      } catch (error) {
        console.error("Failed to parse message", error);
      }
    };

    ws.onclose = (e) => {
      console.log("WebSocket closed", e.reason);
      
      setTimeout(() => useWebSocket(url), 5000);
    };

    ws.onerror = (err) => console.error("⚠️ WebSocket error", err);

    return () => {
      ws.close();
      
    };
  }, [url, dispatch]);

  return { socket: socketRef.current, messages };
}
