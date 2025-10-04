import React, { useState, useEffect, useRef } from "react";

export default function Chat({ ws, username, unreadInitial }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const chatEndRef = useRef();

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
          setTimeout(() => setTyping(""), 2000);
          break;
        default:
          break;
      }
    };
  }, [ws, username]);
  
const sendMessage = () => {
  if (message.trim() === "") return;
  ws.send(JSON.stringify({ type: "message", message }));
  setMessage(""); // Don't add it locally
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
      <div className="header bg-gray-800">
        <h2>Welcome, {username}</h2>
      </div>
      

      <div className="chat-body">
        <div className="online-users">
          <h3>Online</h3>
          <ul>{onlineUsers.map(u => <li key={u}>{u}</li>)}</ul>
        </div>

        <div className="chat-box" onClick={markAsRead}>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`message ${m.sender === username ? "self" : "other"} ${m.unread ? "unread" : ""}`}
            >
              <b>{m.sender}</b>: {m.message}
              <div className="timestamp">{new Date(m.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
          {typing && <div className="typing">{typing}</div>}
        </div>
      </div>

      <div className="input-box">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-gray-800">Send</button>
      </div>  
    </div>
  );
}