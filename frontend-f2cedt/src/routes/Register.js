import React, { useState } from "react";
import axios from "axios";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        try {
            const response = await axios.post(
                "http://localhost:3001/register",
                { username, password }
            );
            if (response.data.success) {
                alert("Registered successfully");
            } else {
                alert(response.data.message);
            }
        } catch (err) {
            alert("Error registering");
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
            <button onClick={handleRegister}>Register</button>
        </div>
    );
}

export default Register;
