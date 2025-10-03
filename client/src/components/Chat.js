import React, { useState, useEffect } from "react";

export default function Chat({ ws, username }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState("");

  useEffect(() => {
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "message":
          setMessages((prev) => [...prev, data]);
          break;
        case "user_online":
          setOnlineUsers((prev) => [...prev, data.username]);
          break;
        case "user_offline":
          setOnlineUsers((prev) => prev.filter((u) => u !== data.username));
          break;
        case "typing":
          setTyping(data.username);
          setTimeout(() => setTyping(""), 1000);
          break;
        default:
          break;
      }
    };
  }, [ws]);

  const sendMessage = () => {
    if (message.trim() === "") return;
    ws.send(JSON.stringify({ type: "message", message }));
    setMessage("");
  };

  const handleTyping = () => {
    ws.send(JSON.stringify({ type: "typing" }));
  };

  return (
    <div>
      <h2>Welcome, {username}</h2>
      <div>
        <h3>Online Users</h3>
        <ul>
          {onlineUsers.map((user) => (
            <li key={user}>{user}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Chat</h3>
        <div style={{ border: "1px solid gray", height: "200px", overflow: "auto" }}>
          {messages.map((msg, i) => (
            <div key={i}>
              <b>{msg.sender}</b>: {msg.message} <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
            </div>
          ))}
        </div>
        {typing && <p>{typing} is typing...</p>}
        <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleTyping} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
