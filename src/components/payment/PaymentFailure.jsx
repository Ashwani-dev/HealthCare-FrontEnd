// src/components/payment/PaymentFailure.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { XCircle, User, Phone, Mail, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PaymentFailure() {
  const [paymentData, setPaymentData] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const storedData = localStorage.getItem('paymentData');
    if (storedData) {
      setPaymentData(JSON.parse(storedData));
    }
  }, []);

  const handleGoHome = () => {
    if (user && user.role?.toLowerCase() === 'patient') {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl p-8 text-center max-w-lg w-full"
      >
        <motion.div
          initial={{ rotate: -180 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-4"
        >
          <XCircle className="w-20 h-20 text-red-500" />
        </motion.div>
        <h1 className="text-2xl font-bold text-red-700 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          We couldn't process your payment. Please try again or use a different
          method.
        </p>
        
        {paymentData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 rounded-lg p-4 mb-6 text-left"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Payment Details</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-gray-700">{paymentData.customerName}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-gray-700">{paymentData.customerPhone}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-gray-700">{paymentData.customerEmail}</span>
              </div>
              <div className="flex items-center text-sm">
                <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-gray-700 font-semibold">₹{paymentData.amount.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <motion.button
          onClick={handleGoHome}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
        >
          Go Home
        </motion.button>
      </motion.div>
    </div>
  );
}


