import React, { useState } from "react";
import axios from "axios";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const response = await axios.post("http://localhost:3001/login", {
                username,
                password,
            });
            if (response.data.success) {
                localStorage.setItem("token", response.data.token);
                alert("Logged in successfully");
            } else {
                alert(response.data.message);
            }
        } catch (err) {
            alert("Error logging in");
        }
    };

    return (
        <div>
            <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}

export default Login;
