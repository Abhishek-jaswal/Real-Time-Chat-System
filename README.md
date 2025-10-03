# Mini Real-Time Chat System

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Real-Time-Chat-System
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

### 4. Start Backend

```bash
cd ../server
node server.js
```
- Runs on `http://localhost:5000`

### 5. Start Frontend

```bash
cd ../client
npm start
```
- Runs on `http://localhost:3000`

## Features

- **SignUp/Login:** Simple username/password, in-memory.
- **Live Chat:** WebSocket for real-time messaging.
- **Online/Offline Status:** Shows current online users.
- **Read/Unread:** Distinct unread messages.
- **Typing Indicator:** See who is typing live.


