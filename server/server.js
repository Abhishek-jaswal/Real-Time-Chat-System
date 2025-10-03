const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Simple in-memory user store
const users = {}; // { username: password }
let onlineUsers = {}; // { username: ws }

const server = app.listen(PORT, () => console.log(`HTTP Server running on ${PORT}`));

// WebSocket server
const wss = new WebSocket.Server({ server });

// Broadcast helper
function broadcast(data, excludeWs = null) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== excludeWs) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on("connection", (ws) => {
  let currentUser = null;

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      switch (data.type) {
        case "signup":
          if (users[data.username]) {
            ws.send(JSON.stringify({ type: "signup_error", message: "Username taken" }));
          } else {
            users[data.username] = data.password;
            ws.send(JSON.stringify({ type: "signup_success" }));
          }
          break;

        case "login":
          if (users[data.username] === data.password) {
            currentUser = data.username;
            onlineUsers[currentUser] = ws;
            ws.send(JSON.stringify({ type: "login_success", username: currentUser }));
            broadcast({ type: "user_online", username: currentUser }, ws);
          } else {
            ws.send(JSON.stringify({ type: "login_error", message: "Invalid credentials" }));
          }
          break;

        case "message":
          // Broadcast message to all
          broadcast({
            type: "message",
            sender: currentUser,
            message: data.message,
            timestamp: new Date(),
          });
          break;

        case "typing":
          broadcast({ type: "typing", username: currentUser }, ws);
          break;

        default:
          console.log("Unknown type:", data.type);
      }
    } catch (err) {
      console.error(err);
    }
  });

  ws.on("close", () => {
    if (currentUser) {
      delete onlineUsers[currentUser];
      broadcast({ type: "user_offline", username: currentUser });
    }
  });
});
