import React, { useState } from "react";
import Login from "./components/Login";
import Chat from "./components/Chat";


export default function App() {
  const [user, setUser] = useState(null);
  const [ws, setWs] = useState(null);

  return (
    <div>
      {!user ? (
        <Login setUser={setUser} setWs={setWs} />
      ) : (
        <Chat user={user} ws={ws} />
      )}
    </div>
  );
}
