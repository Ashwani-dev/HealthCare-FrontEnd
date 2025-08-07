// Import Cashfree load function
import { load } from "@cashfreepayments/cashfree-js";

// Initialize Cashfree instance
let cashfree = null;

const initializeCashfree = async () => {
  if (!cashfree) {
    cashfree = await load({
      mode: "sandbox", //or production
      // Add additional configuration to prevent form-encoded requests
      returnUrl: `${window.location.origin}/payment-success`,
      // Configure to use JSON for all requests
      useJson: true
    });
  }
  return cashfree;
};
//This load function returns a Promise that resolves with a newly created Cashfree object once Cashfree.js has loaded. If you call load in a server environment it will resolve to null.

/**
 * Cashfree Checkout Function
 * @param {Object} options - Checkout configuration options
 * @param {string} options.sessionId - Session identifier
 * @param {string} options.redirectTarget - Target for redirect ("_blank" or "_self")
 * @returns {Promise} - Returns a promise that resolves with payment result
 */
export const cashfreeCheckout = async (options) => {
  try {
    // Initialize Cashfree
    const cashfreeInstance = await initializeCashfree();
    
    // Validate required parameters
    if (!options.sessionId) {
      throw new Error('Missing required parameter: sessionId is required');
    }

    // Default configuration
    const config = {
      redirectTarget: "_blank",
      ...options
    };



    // Initialize payment using the correct Cashfree SDK method
    const checkoutOptions = {
      paymentSessionId: config.sessionId,
      redirectTarget: config.redirectTarget,
      // Add configuration to prevent form-encoded requests
      environment: "sandbox",
      // Ensure proper content type handling
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Use the checkout method as per Cashfree SDK
    cashfreeInstance.checkout(checkoutOptions);

  } catch (error) {
    console.error('Cashfree checkout error:', error);
    throw error;
  }
};

/**
 * Handle payment success callback
 * @param {Object} paymentData - Payment response data
 * @returns {Object} - Processed payment result
 */
export const handlePaymentSuccess = (paymentData) => {
  try {
    const result = {
      success: true,
      transactionId: paymentData.transactionId,
      amount: paymentData.orderAmount,
      currency: paymentData.orderCurrency,
      status: paymentData.paymentStatus,
      timestamp: new Date().toISOString()
    };

    console.log('Payment successful:', result);
    return result;
  } catch (error) {
    console.error('Error processing payment success:', error);
    throw error;
  }
};

/**
 * Handle payment failure callback
 * @param {Object} errorData - Error response data
 * @returns {Object} - Error details
 */
export const handlePaymentFailure = (errorData) => {
  try {
    const error = {
      success: false,
      errorCode: errorData.errorCode,
      errorMessage: errorData.errorMessage,
      timestamp: new Date().toISOString()
    };

    console.error('Payment failed:', error);
    return error;
  } catch (err) {
    console.error('Error processing payment failure:', err);
    throw err;
  }
};

/**
 * Verify payment status
 * @param {string} sessionId - Session ID to verify
 * @returns {Promise} - Payment verification result
 */
export const verifyPayment = async (sessionId) => {
  try {
    if (!sessionId) {
      throw new Error('Session ID is required for payment verification');
    }

    // Make API call to verify payment status
    const response = await fetch(`/api/payment/verify/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Payment verification failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

export default cashfree;