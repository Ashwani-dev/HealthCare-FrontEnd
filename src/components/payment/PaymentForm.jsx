import React, { useState } from 'react';
import { cashfreeCheckout } from './cashree';
import { initiatePayment } from '../../api/api';

const PaymentForm = () => {
  const [loading, setLoading] = useState(false);

  const handlePaymentInitiation = async () => {
    try {
      setLoading(true);
      
      // Call the payment initiation API
      const response = await initiatePayment({
        customerId: "cust123",
        customerName:"Alex Johnson",
        customerPhone: "9999999992",
        customerEmail: "customer@example.com",
        amount: 500.0
      });

      return response.paymentSessionId;
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw new Error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectToPayment = async () => {
    try {
      setLoading(true);
      
      // Get sessionId from API
      const sessionId = await handlePaymentInitiation();
      const redirectTarget = "_blank";
      console.log('Redirecting to payment page with:', { sessionId, redirectTarget });

      // Call Cashfree checkout with redirect mode
      await cashfreeCheckout({
        sessionId: sessionId,
        redirectTarget: redirectTarget
      });
    } catch (error) {
      console.error('Payment redirect error:', error);
      alert('Payment redirect failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePopupPayment = async () => {
    try {
      setLoading(true);
      
      // Get sessionId from API
      const sessionId = await handlePaymentInitiation();
      const redirectTarget = "_self";
      console.log('Opening popup payment page with:', { sessionId, redirectTarget });

      // Call Cashfree checkout with popup mode
      await cashfreeCheckout({
        sessionId: sessionId,
        redirectTarget: redirectTarget
      });
    } catch (error) {
      console.error('Payment popup error:', error);
      alert('Payment popup failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Payment Configuration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Click a button to initiate payment
          </p>
        </div>
        
        <form className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="button"
              onClick={handleRedirectToPayment}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Redirect to Payment Page'}
            </button>
            
            <button
              type="button"
              onClick={handlePopupPayment}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Pop up Payment Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm; 