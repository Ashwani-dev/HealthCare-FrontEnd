import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../api/api";
import styles from "../../styles/RegisterForm.module.css";

const PatientRegisterForm = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    full_name: "",
    contact_number: "",
    address: ""
  });
  const [err, setErr] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await registerUser(form, "patient");
    if (res.success) login(res.user);
    else setErr("Registration failed");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg max-w-md mx-auto p-6">
      <div className="text-2xl font-bold text-blue-600 mb-6 text-center">Patient Registration</div>
      <input name="username" placeholder="Username" className="w-full p-3 mb-3 border border-gray-300 rounded focus:border-blue-500" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" className="w-full p-3 mb-3 border border-gray-300 rounded focus:border-blue-500" onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" className="w-full p-3 mb-3 border border-gray-300 rounded focus:border-blue-500" onChange={handleChange} required />
      <input name="full_name" placeholder="Full Name" className="w-full p-3 mb-3 border border-gray-300 rounded focus:border-blue-500" onChange={handleChange} required />
      <input name="contact_number" placeholder="Contact Number" className="w-full p-3 mb-3 border border-gray-300 rounded focus:border-blue-500" onChange={handleChange} required />
      <input name="address" placeholder="Address" className="w-full p-3 mb-3 border border-gray-300 rounded focus:border-blue-500" onChange={handleChange} required />
      {err && <div className={styles.errorMsg}>{err}</div>}
      <button type="submit" className="w-full bg-green-500 text-white font-semibold py-3 rounded hover:bg-green-600 transition">Register</button>
    </form>
  );
};

export default PatientRegisterForm; 