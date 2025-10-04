import React, { useState } from "react";
import WS_URL from "./api";

export default function Login({ setUser, setWs }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  const connect = () => {
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: isSignup ? "signup" : "login",
          username,
          password,
        })
      );
    };

    socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === "signup_success") {
        alert("Signup successful! Please login.");
        setIsSignup(false);
      } else if (data.type === "signup_error") {
        setError(data.message);
      } else if (data.type === "login_success") {
        setUser({ username: data.username, unread: data.unread });
        setWs(socket);
      } else if (data.type === "login_error") {
        setError(data.message);
      }
    };
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-800">
      <div className="backdrop-blur-lg text-white shadow-2xl rounded-xl p-8 w-96">
        <h2 className="text-2xl font-bold text-center mb-6 ">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>
        <input
          className="w-full mb-3 px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full mb-3 px-4 py-2 border text-gray-700  rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full py-2 bg-gray-600 hover:bg-gray-900 text-white rounded-lg font-semibold"
          onClick={connect}
        >
          {isSignup ? "Sign Up" : "Login"}
        </button>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        <p className="text-sm mt-4 text-center text-gray-400">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            className="text-gray-200 font-semibold cursor-pointer"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Login" : "Signup"}
          </span>
        </p>
      </div>
    </div>
  );
}
