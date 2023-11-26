import React, { useState } from "react";
import Problems from "../problems/problems";

const apiUrl = "http://localhost:5001";

export default function Register({ isLoggedIn, logIn }) {
  async function registerOrLogin(name) {
    let response;
    try {
      response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (response.status === 404) {
        response = await fetch(`${apiUrl}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
      }

      const data = await response.json();
      localStorage.setItem("uid", data.uid);
      logIn();
    } catch (error) {
      console.error("Error during register/login:", error);
    }
  }

  const [username, setUsername] = useState("");
  return (
    <>
      <div
        id="loginSection"
        className={
          (isLoggedIn && "hidden ") + "bg-white p-8 rounded-lg shadow-md mb-6"
        }
      >
        <h2 className="text-2xl mb-4">Register/Login</h2>
        <input
          id="username"
          type="text"
          placeholder="Enter Name"
          className="border p-2 rounded mb-4 w-full"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
        <button
          onClick={() => registerOrLogin(username)}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </div>
    </>
  );
}
