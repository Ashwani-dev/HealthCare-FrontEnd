import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../api/api";
import { useNavigate } from "react-router-dom";
import "../../styles/AuthTypeBubbles.css";
import styles from "../../styles/RegisterForm.module.css";

const LoginForm = () => {
  const { login } = useAuth();
  const [type, setType] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await loginUser(email, password, type);
    if (res.success) {
      login({
        role: res.role,
        userId: res.userId,
        token: res.token
      });
      navigate("/dashboard");
    } else setErr("Invalid credentials");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">Login</h2>
        <div className="flex justify-center gap-4 mb-4">
          <button
            type="button"
            className={`bubble-btn ${type === "patient" ? "selected" : ""}`}
            onClick={() => setType("patient")}
          >
            Patient
          </button>
          <button
            type="button"
            className={`bubble-btn ${type === "doctor" ? "selected" : ""}`}
            onClick={() => setType("doctor")}
          >
            Doctor
          </button>
        </div>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-3 border border-gray-300 rounded focus:border-blue-500"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-3 border border-gray-300 rounded focus:border-blue-500"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {err && <div className={styles.errorMsg}>{err}</div>}
        <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-3 rounded hover:bg-blue-600 transition">Login</button>
      </form>
      <div className="flex items-center justify-center mt-6 ">
        <span className="text-gray-700 mr-2">Don't have an account?</span>
        <button
          type="button"
          className="text-blue-600 font-semibold hover:underline focus:outline-none"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </div>
    </>
  );
};

export default LoginForm; 