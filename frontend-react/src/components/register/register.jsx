import React, { useState } from "react";
import Problems from "../problems/problems";

const apiUrl = "http://localhost:5001";

export default function Register() {
  const [login, setLogin] = useState(false);

  async function registerOrLogin(username) {
    let response;
    try {
      response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (response.status === 404) {
        response = await fetch(`${apiUrl}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
      }
      const data = await response.json();
      localStorage.setItem("uid", data.uid);
      setLogin(true);
      // I can remove this part right?
      //   document.getElementById("loginSection").classList.add("hidden");

      //but I have problem with this part
      //   document.getElementById("problemsSection").classList.remove("hidden");
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
          (login && "hidden ") + "bg-white p-8 rounded-lg shadow-md mb-6"
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
          onClick={() => registerOrLogin()}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </div>
      <Problems login={login}></Problems>
    </>
  );
}
