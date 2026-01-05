import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";

// Lazy load all page components for better performance
const HomePage = lazy(() => import("./components/pages/HomePage"));
const AboutPage = lazy(() => import("./components/pages/AboutPage"));
const ContactPage = lazy(() => import("./components/pages/ContactPage"));
const LoginForm = lazy(() => import("./components/auth/LoginForm"));
const RegisterForm = lazy(() => import("./components/auth/RegisterForm"));
const DoctorDashboard = lazy(() => import("./components/doctor/DoctorDashboard"));
const DoctorAvailabilityPage = lazy(() => import("./components/doctor/DoctorAvailabilityPage"));
const PatientDashboard = lazy(() => import("./components/patient/PatientDashboard"));
const PatientProfileDashboard = lazy(() => import("./components/pages/PatientProfileDashboard"));
const DoctorProfileDashboard = lazy(() => import("./components/pages/DoctorProfileDashboard"));
const FindTherapistPage = lazy(() => import("./components/pages/FindTherapistPage"));
const VideoCallPreviewPage = lazy(() => import("./components/pages/VideoCallPreviewPage"));
const VideoCallPage = lazy(() => import("./components/pages/VideoCallPage"));
const PaymentSuccess = lazy(() => import("./components/payment/PaymentSuccess"));
const PaymentFailure = lazy(() => import("./components/payment/PaymentFailure"));
const PaymentPending = lazy(() => import("./components/payment/PaymentPending"));
const PaymentStatus = lazy(() => import("./components/payment/PaymentStatus"));
const PatientPaymentsPage = lazy(() => import("./components/pages/PatientPaymentsPage"));
const ForgotPasswordPage = lazy(() => import("./components/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./components/auth/ResetPasswordPage"));
const UserJourneyPage = lazy(() => import("./components/pages/UserJourneyPage"));

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="text-gray-600 font-medium text-lg">Loading...</p>
    </div>
  </div>
);

// Dashboard Component with loading state
const Dashboard = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const role = user.role?.toLowerCase();
  return role === "doctor" ? <DoctorDashboard /> : <PatientDashboard />;
};

// Profile Page Component with loading state
const ProfilePage = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const role = user.role?.toLowerCase();
  return role === "doctor" ? <DoctorProfileDashboard /> : <PatientProfileDashboard />;
};

// Doctor Availability Component with protection
const DoctorAvailability = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role?.toLowerCase() !== "doctor") {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <DoctorAvailabilityPage />;
};

// Patient Payments Component with protection
const ProfileProtectedPatientOnly = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role?.toLowerCase() !== "patient") {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <PatientPaymentsPage />;
};

// Protected Route Component for Login/Register (redirects if already logged in)
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Private Route Component (requires authentication)
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// App Content Component
const AppContent = () => {
  return (
    <Router>
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes - Accessible to everyone */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/find-therapist" element={<FindTherapistPage />} />
          
          {/* Auth Routes - Only accessible when NOT logged in */}
          <Route 
            path="/login" 
            element={
              <PublicOnlyRoute>
                <LoginForm />
              </PublicOnlyRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicOnlyRoute>
                <RegisterForm />
              </PublicOnlyRoute>
            } 
          />
          
          {/* Password Reset Routes - Public */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/how-it-works" element={<UserJourneyPage />} />
          
          {/* Protected Routes - Require Authentication */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/availability" 
            element={
              <PrivateRoute>
                <DoctorAvailability />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/payments" 
            element={
              <PrivateRoute>
                <ProfileProtectedPatientOnly />
              </PrivateRoute>
            } 
          />
          
          {/* Video Call Routes */}
          <Route 
            path="/video-preview/:appointmentId/:userType" 
            element={
              <PrivateRoute>
                <VideoCallPreviewPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/video-call/:appointmentId/:userType/:userId" 
            element={
              <PrivateRoute>
                <VideoCallPage />
              </PrivateRoute>
            } 
          />
          
          {/* Payment Routes */}
          <Route 
            path="/payment-success" 
            element={
              <PrivateRoute>
                <PaymentSuccess />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/payment-failure" 
            element={
              <PrivateRoute>
                <PaymentFailure />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/payment-pending" 
            element={
              <PrivateRoute>
                <PaymentPending />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/payment-status" 
            element={
              <PrivateRoute>
                <PaymentStatus />
              </PrivateRoute>
            } 
          />
          
          {/* 404 - Catch all routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

// 404 Not Found Page Component
const NotFoundPage = () => {
  const { user } = useAuth();
  const redirectPath = user ? "/dashboard" : "/";
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="text-center px-4">
        <div className="mb-8">
          <svg className="w-32 h-32 mx-auto text-blue-600 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href={redirectPath}
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          {user ? "Back to Dashboard" : "Back to Home"}
        </a>
      </div>
    </div>
  );
};

// Main App Component
const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
