import React, { useState } from "react";

export default function Login({ ws, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    ws.send(JSON.stringify({ type: "login", username, password }));
  };

  const handleSignup = () => {
    ws.send(JSON.stringify({ type: "signup", username, password }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "login_success") {
      onLogin(data.username);
    } else if (data.type === "login_error" || data.type === "signup_error") {
      setError(data.message);
    } else if (data.type === "signup_success") {
      setError("Signup successful! Please login.");
    }
  };

  return (
    <div>
      <h2>Login / Signup</h2>
      <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignup}>Signup</button>
      {error && <p>{error}</p>}
    </div>
  );
}
