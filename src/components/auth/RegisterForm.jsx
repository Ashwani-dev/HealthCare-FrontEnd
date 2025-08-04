import React, { useState } from "react";
import DoctorRegisterForm from "./DoctorRegisterForm";
import PatientRegisterForm from "./PatientRegisterForm";
import { useNavigate } from "react-router-dom";
import "../../styles/AuthTypeBubbles.css";

const RegisterForm = () => {
  const [type, setType] = useState("patient");
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Register as</h2>
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
      {type === "patient" ? <PatientRegisterForm /> : <DoctorRegisterForm />}
      <div className="flex items-center justify-center mt-6">
        <span className="text-gray-700 mr-2">Already have account?</span>
        <button
          type="button"
          className="text-blue-600 font-semibold hover:underline focus:outline-none"
          onClick={() => navigate("/login")}
        >
          Log in
        </button>
      </div>
    </div>
  );
};

export default RegisterForm; 