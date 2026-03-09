import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { getPaymentStatus } from '../../api/api';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const orderId = searchParams.get('order_id');
        
        if (!orderId) {
          setError('No order ID found in URL');
          setLoading(false);
          return;
        }

        // Call the payment status API
        const statusText = await getPaymentStatus(orderId);
        
        // Extract the status from the response text
        const status = statusText.replace('Your payment status is ', '').trim();
        
        // Redirect based on payment status
        switch (status.toUpperCase()) {
          case 'SUCCESS':
          case 'COMPLETED':
            navigate('/payment-success');
            break;
          case 'PENDING':
            navigate('/payment-pending');
            break;
          case 'FAILED':
          case 'FAILURE':
            navigate('/payment-failure');
            break;
          default:
            // For unknown statuses, redirect to failure page
            navigate('/payment-failure');
            break;
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-2xl rounded-2xl p-8 text-center max-w-md w-full"
        >
          <h1 className="text-2xl font-bold text-red-700 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            onClick={() => navigate('/')}
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl p-8 text-center max-w-md w-full"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="flex justify-center mb-4"
        >
          <Loader2 className="w-20 h-20 text-blue-500" />
        </motion.div>
        <h1 className="text-2xl font-bold text-blue-700 mb-2">Checking Payment Status</h1>
        <p className="text-gray-600 mb-6">
          Please wait while we verify your payment status...
        </p>
      </motion.div>
    </div>
  );
}
