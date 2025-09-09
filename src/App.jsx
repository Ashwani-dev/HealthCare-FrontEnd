import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import DoctorDashboard from "./components/doctor/DoctorDashboard";
import DoctorAvailabilityPage from "./components/doctor/DoctorAvailabilityPage";
import PatientDashboard from "./components/patient/PatientDashboard";
import HomePage from "./components/pages/HomePage";
import AboutPage from "./components/pages/AboutPage";
import ContactPage from "./components/pages/ContactPage";
import FindTherapistPage from "./components/pages/FindTherapistPage";
import PatientProfileDashboard from "./components/pages/PatientProfileDashboard";
import DoctorProfileDashboard from "./components/pages/DoctorProfileDashboard";

import VideoCallPreviewPage from "./components/pages/VideoCallPreviewPage";
import VideoCallPage from "./components/pages/VideoCallPage";
import PaymentSuccess from "./components/payment/PaymentSuccess";
import PaymentFailure from "./components/payment/PaymentFailure";
import PaymentPending from "./components/payment/PaymentPending";
import PaymentStatus from "./components/payment/PaymentStatus";
import PatientPaymentsPage from "./components/pages/PatientPaymentsPage";

const Dashboard = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-10 text-lg text-blue-600">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  const role = user.role?.toLowerCase();
  
  return role === "doctor" ? <DoctorDashboard /> : <PatientDashboard />;
};

const ProfilePage = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-10 text-lg text-blue-600">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  const role = user.role?.toLowerCase();
  return role === "doctor" ? <DoctorProfileDashboard /> : <PatientProfileDashboard />;
};

const DoctorAvailability = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-10 text-lg text-blue-600">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role?.toLowerCase() !== "doctor") return <Navigate to="/dashboard" />;
  return <DoctorAvailabilityPage />;
};


const ProfileProtectedPatientOnly = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-10 text-lg text-blue-600">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role?.toLowerCase() !== "patient") return <Navigate to="/dashboard" />;
  return <PatientPaymentsPage />;
};



const AppContent = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/find-therapist" element={<FindTherapistPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/availability" element={<DoctorAvailability />} />

        <Route path="/video-preview/:appointmentId/:userType" element={<VideoCallPreviewPage />} />
        <Route path="/video-call/:appointmentId/:userType/:userId" element={<VideoCallPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />
        <Route path="/payment-pending" element={<PaymentPending />} />
        <Route path="/payment-status" element={<PaymentStatus />} />
        <Route path="/payments" element={<ProfileProtectedPatientOnly />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
