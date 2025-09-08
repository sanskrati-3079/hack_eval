import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignIn.css";
import Header from "./Header_SignIn.jsx";
import { judgeLogin } from "../utils/api.js";

function SignIn() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const data = await judgeLogin(username, password);
            
            // Store the token in localStorage
            localStorage.setItem('judgeToken', data.access_token);
            localStorage.setItem('judgeUsername', username);
            // alert("Login successful!");
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Login failed. Please check your credentials.");
            console.error("Login error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-background">
            <Header onMenuClick={() => {}} />
            <div className="auth-container">
                <div className="auth-logo">
                    <img src="..\..\public\images\gla.png" alt="GLA University" />
                </div>
                <h1 className="auth-title">Judge Panel</h1>
                <p className="auth-subtitle">Hackathon Evaluation Portal</p>
                
                {error && (
                    <div className="error-message" style={{ 
                        color: 'red', 
                        backgroundColor: '#ffe6e6', 
                        padding: '10px', 
                        borderRadius: '5px', 
                        marginBottom: '15px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username:</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SignIn;
