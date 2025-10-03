import React, { useState, useEffect, useRef } from "react";
import {
  Box, Button, TextField, Typography,
  List, ListItem, ListItemText, Badge
} from "@mui/material";

const WS_URL = "ws://localhost:4000";
const API_URL = "http://localhost:4000";

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isSignup ? "/signup" : "/login";
      const res = await fetch(API_URL + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) onLogin(username);
      else setError(data.error);
    } catch {
      setError("Server error");
    }
  };

  return (
    <Box sx={{ width: 300, margin: "auto", mt: 10 }}>
      <Typography variant="h5">{isSignup ? "Sign Up" : "Login"}</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Username" fullWidth margin="normal"
          value={username} onChange={e => setUsername(e.target.value)}
        />
        <TextField
          label="Password" fullWidth margin="normal" type="password"
          value={password} onChange={e => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          {isSignup ? "Sign Up" : "Login"}
        </Button>
      </form>
      <Button onClick={() => setIsSignup(!isSignup)} sx={{ mt: 2 }}>
        {isSignup ? "Have account? Login" : "No account? Sign Up"}
      </Button>
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
}

function ChatApp({ username }) {
  const [ws, setWs] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesRef = useRef(null);

  useEffect(() => {
    const socket = new window.WebSocket(WS_URL);
    setWs(socket);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "login_ws", username }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "init") {
        setUsers(data.users);
        setMessages(data.messages);
        setOnlineUsers(data.users.filter(u => u.online).map(u => u.username));
        updateUnread(data.messages, username);
      }
      if (data.type === "user_online") {
        setOnlineUsers(users => [...users, data.username]);
      }
      if (data.type === "user_offline") {
        setOnlineUsers(users => users.filter(u => u !== data.username));
        setTypingUsers(users => users.filter(u => u !== data.username));
      }
      if (data.type === "chat_message") {
        setMessages(msgs => [...msgs, data]);
        updateUnread([...messages, data], username);
      }
      if (data.type === "typing") {
        setTypingUsers(arr => arr.includes(data.username) ? arr : [...arr, data.username]);
      }
      if (data.type === "stop_typing") {
        setTypingUsers(arr => arr.filter(u => u !== data.username));
      }
      if (data.type === "read_message") {
        setMessages(msgs => msgs.map(m =>
          m.timestamp === data.timestamp
            ? { ...m, readBy: [...m.readBy, data.username] }
            : m
        ));
        updateUnread(messages, username);
      }
    };

    socket.onclose = () => setWs(null);

    return () => socket.close();
    // eslint-disable-next-line
  }, [username]);

  // Unread count calculation
  function updateUnread(msgs, user) {
    const count = msgs.filter(m => !m.readBy.includes(user)).length;
    setUnreadCounts({ ...unreadCounts, [user]: count });
  }

  // Send message
  const handleSend = (e) => {
    e.preventDefault();
    if (ws && input.trim()) {
      ws.send(JSON.stringify({ type: "chat_message", message: input }));
      setInput("");
      ws.send(JSON.stringify({ type: "stop_typing" }));
    }
  };

  // Typing indicator
  const handleInput = (e) => {
    setInput(e.target.value);
    if (ws) {
      if (e.target.value)
        ws.send(JSON.stringify({ type: "typing" }));
      else
        ws.send(JSON.stringify({ type: "stop_typing" }));
    }
  };

  // Mark all as read when viewing
  useEffect(() => {
    if (ws && messages.length) {
      messages.forEach(m => {
        if (!m.readBy.includes(username)) {
          ws.send(JSON.stringify({ type: "read_message", timestamp: m.timestamp }));
        }
      });
    }
    // eslint-disable-next-line
  }, [messages]);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Users List */}
      <Box sx={{ width: 200, bgcolor: "#f5f5f5", p: 2 }}>
        <Typography variant="h6">Users</Typography>
        <List>
          {users.map(u => (
            <ListItem key={u.username}>
              <Badge
                color={onlineUsers.includes(u.username) ? "success" : "error"}
                variant="dot"
                sx={{ mr: 1 }}
              />
              <ListItemText
                primary={u.username}
                secondary={onlineUsers.includes(u.username) ? "Online" : "Offline"}
              />
              {unreadCounts[u.username] > 0 && (
                <Badge badgeContent={unreadCounts[u.username]} color="primary" />
              )}
            </ListItem>
          ))}
        </List>
      </Box>
      {/* Chat Window */}
      <Box sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column" }}>
        <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }} ref={messagesRef}>
          {messages.map((m, idx) => (
            <Box
              key={m.timestamp}
              sx={{
                mb: 1, p: 1,
                bgcolor: m.sender === username ? "#e3f2fd" : "#fff",
                fontWeight: !m.readBy.includes(username) ? "bold" : "normal",
                borderRadius: 1,
                boxShadow: 1
              }}
            >
              <Typography variant="body2">
                <strong>{m.sender}</strong> <span style={{ color: '#888', fontSize: 12 }}>{new Date(m.timestamp).toLocaleTimeString()}</span>
              </Typography>
              <Typography>{m.message}</Typography>
            </Box>
          ))}
        </Box>
        {/* Typing Indicator */}
        <Box>
          {typingUsers.filter(u => u !== username).map(u => (
            <Typography key={u} sx={{ fontStyle: "italic", color: "#888" }}>
              {u} is typing...
            </Typography>
          ))}
        </Box>
        {/* Message Input */}
        <form onSubmit={handleSend}>
          <Box sx={{ display: "flex", mt: 2 }}>
            <TextField
              fullWidth
              value={input}
              onChange={handleInput}
              placeholder="Type your message"
              onBlur={() => ws && ws.send(JSON.stringify({ type: "stop_typing" }))}
            />
            <Button type="submit" variant="contained" sx={{ ml: 2 }}>
              Send
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
}

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  return (
    <Box>
      {!loggedInUser ? (
        <LoginForm onLogin={setLoggedInUser} />
      ) : (
        <ChatApp username={loggedInUser} />
      )}
    </Box>
  );
}

export default App;