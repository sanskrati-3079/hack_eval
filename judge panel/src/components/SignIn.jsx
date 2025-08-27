import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignIn.css";

function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        // Static credentials
        if (email === "admin@gla.ac.in" && password === "12345") {
            alert("Login successful!");
            navigate("/dashboard");
        } else {
            alert("Invalid credentials! Please try again.");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-logo">
                <img src="/gla-logo.png" alt="GLA University" />
            </div>
            <h1 className="auth-title">Judge Panel</h1>
            <p className="auth-subtitle">Hackathon Evaluation Portal</p>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">
                    Sign In
                </button>
            </form>
        </div>
    );
}

export default SignIn;
