import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Chat from "./components/Chat";

function App() {
  const [ws, setWs] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000");
    setWs(socket);
    return () => socket.close();
  }, []);

  if (!ws) return <p>Connecting...</p>;
  return username ? <Chat ws={ws} username={username} /> : <Login ws={ws} onLogin={setUsername} />;
}

export default App;
