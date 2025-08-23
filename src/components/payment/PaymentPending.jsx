// src/components/payment/PaymentPending.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, User, Phone, Mail, DollarSign } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPaymentStatus } from "../../api/api";

export default function PaymentPending() {
  const [paymentData, setPaymentData] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pollingCount, setPollingCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('paymentData');
    if (storedData) {
      setPaymentData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    
    if (orderId && !isPolling) {
      startPolling(orderId);
    }
  }, [searchParams, isPolling]);

  const startPolling = async (orderId) => {
    setIsPolling(true);
    setPollingCount(0);
    
    const pollPaymentStatus = async () => {
      try {
        const statusResponse = await getPaymentStatus(orderId);
        const status = statusResponse.replace('Your payment status is ', '').trim().toUpperCase();
        
        console.log(`Polling attempt ${pollingCount + 1}: Status = ${status}`);
        
        if (status === 'SUCCESS' || status === 'COMPLETED') {
          navigate('/payment-success');
          return;
        } else if (status === 'FAILED' || status === 'FAILURE') {
          navigate('/payment-failure');
          return;
        } else if (status === 'PENDING') {
          // Continue polling if still pending
          if (pollingCount < 2) { // 0, 1, 2 = 3 attempts
            setPollingCount(prev => prev + 1);
            setTimeout(pollPaymentStatus, 3000); // Wait 3 seconds
          } else {
            // Max attempts reached, stay on pending page
            setIsPolling(false);
            console.log('Max polling attempts reached, staying on pending page');
          }
        } else {
          // Unknown status, redirect to failure
          navigate('/payment-failure');
          return;
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
        if (pollingCount < 2) {
          setPollingCount(prev => prev + 1);
          setTimeout(pollPaymentStatus, 3000);
        } else {
          setIsPolling(false);
        }
      }
    };
    
    // Start first poll immediately
    pollPaymentStatus();
  };

  const handleGoHome = () => {
    if (user && user.role?.toLowerCase() === 'patient') {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-50 p-4">
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
          <Clock className="w-20 h-20 text-yellow-500" />
        </motion.div>
        <h1 className="text-2xl font-bold text-yellow-700 mb-2">Payment Pending</h1>
        <p className="text-gray-600 mb-6">
          Your payment is being processed. You will receive an update shortly.
        </p>
        
        {/* Polling Status */}
        {isPolling && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2"
              />
              <span className="text-blue-700 font-medium">Checking payment status...</span>
            </div>
            <p className="text-sm text-blue-600">
              Attempt {pollingCount + 1} of 3
            </p>
          </div>
        )}
        
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
          className="px-6 py-2 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition"
        >
          Go Home
        </motion.button>
      </motion.div>
    </div>
  );
}


