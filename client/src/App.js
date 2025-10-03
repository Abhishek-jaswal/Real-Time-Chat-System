import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Chat from "./components/Chat";

function App() {
  const [ws, setWs] = useState(null);
  const [username, setUsername] = useState("");
  const [unread, setUnread] = useState([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000");
    setWs(socket);
    return () => socket.close();
  }, []);

  if (!ws) return <p>Connecting...</p>;

  return username
    ? <Chat ws={ws} username={username} unreadInitial={unread} />
    : <Login ws={ws} onLogin={(u, unreadMsgs) => { setUsername(u); setUnread(unreadMsgs); }} />;
}

export default App;
