import React, { useState, useEffect, useRef } from "react";

export default function Chat({ ws, username, unreadInitial }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const chatEndRef = useRef();

  // Add unread messages first
  useEffect(() => {
    if (unreadInitial) setMessages(unreadInitial.map(m => ({ ...m, unread: true })));
  }, [unreadInitial]);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "message":
          setMessages(prev => [...prev, { ...data, unread: data.sender !== username }]);
          break;
        case "user_online":
          setOnlineUsers(prev => [...prev, data.username]);
          break;
        case "user_offline":
          setOnlineUsers(prev => prev.filter(u => u !== data.username));
          break;
        case "typing":
          if (data.username !== username) setTyping(`${data.username} is typing...`);
          setTimeout(() => setTyping(""), 1000);
          break;
        default:
          break;
      }
    };
  }, [ws, username]);

  const sendMessage = () => {
    if (message.trim() === "") return;
    ws.send(JSON.stringify({ type: "message", message }));
    setMessages(prev => [...prev, { sender: username, message, timestamp: new Date(), unread: false }]);
    setMessage("");
  };

  const handleTyping = () => ws.send(JSON.stringify({ type: "typing" }));

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const markAsRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, unread: false })));
    ws.send(JSON.stringify({ type: "read_messages" }));
  };

  return (
    <div className="container">
      <h2>Welcome, {username}</h2>
      <div className="online-users">
        <h3>Online Users:</h3>
        <ul>{onlineUsers.map(u => <li key={u}>{u}</li>)}</ul>
      </div>

      <div className="chat-box" onClick={markAsRead}>
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.unread ? "unread" : ""}`}>
            <b>{m.sender}</b>: {m.message} <small>{new Date(m.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      {typing && <div className="typing">{typing}</div>}

      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={handleTyping}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
