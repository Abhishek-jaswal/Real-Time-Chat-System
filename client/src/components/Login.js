import React, { useState, useEffect } from "react";

export default function Login({ ws, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ws) return;
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "signup_success") setError("Signup success! Login now.");
      if (data.type === "signup_error") setError(data.message);
      if (data.type === "login_error") setError(data.message);
      if (data.type === "login_success") onLogin(data.username, data.unread || []);
    };
  }, [ws, onLogin]);

  const signup = () => ws.send(JSON.stringify({ type: "signup", username, password }));
  const login = () => ws.send(JSON.stringify({ type: "login", username, password }));

  return (
    <div className="container">
      <h2>Login / Signup</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <br />
      <button onClick={login}>Login</button>
      <button onClick={signup}>Signup</button>
      {error && <p>{error}</p>}
    </div>
  );
}
