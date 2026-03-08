import React, { useState } from 'react';
import { setupTOTP, confirmTOTP } from '../../api/api';

const TotpSetup = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState(1); // 1: Start, 2: QR Code, 3: Success
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [secret, setSecret] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setError('');
    setLoading(true);
    
    try {
      const data = await setupTOTP();
      setQrCodeImage(data.qrCodeImage);
      setSecret(data.secret);
      setStep(2);
    } catch (err) {
      if (err.response?.data?.error === 'TOTP_ALREADY_ENABLED') {
        setError('Authenticator is already enabled for your account');
      } else {
        setError(err.response?.data?.message || 'Setup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmSetup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmTOTP(secret, confirmCode);
      setStep(3);
      
      // Update localStorage with new login method
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.loginMethod = 'TOTP';
      localStorage.setItem('user', JSON.stringify(user));
      
    } catch (err) {
      if (err.response?.data?.error === 'INVALID_TOTP_CODE') {
        setError('Invalid code. Please try again with a new code from your app.');
      } else {
        setError(err.response?.data?.message || 'Confirmation failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="totp-setup-container">
      {/* Step 1: Start */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Enable Authenticator App</h3>
            <p className="text-gray-600">Add an extra layer of security to your account with two-factor authentication</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">What you'll need:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>📱 A smartphone or tablet</li>
              <li>🔐 An authenticator app (Google Authenticator, Microsoft Authenticator, or Authy)</li>
              <li>⏱️ About 2 minutes</li>
            </ul>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={startSetup}
              disabled={loading}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Setting up...' : 'Get Started'}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step 2: QR Code */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Setup Authenticator</h3>
          
          <div className="space-y-6">
            {/* Step 1: Download App */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-2">1</span>
                Download an authenticator app
              </h4>
              <div className="ml-8 space-y-1 text-sm text-gray-600">
                <div>📱 <a href="https://support.google.com/accounts/answer/1066447" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Authenticator</a> (iOS/Android)</div>
                <div>🔐 <a href="https://www.microsoft.com/en-us/security/mobile-authenticator-app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Authenticator</a> (iOS/Android)</div>
                <div>🛡️ <a href="https://authy.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Authy</a> (iOS/Android/Desktop)</div>
              </div>
            </div>

            {/* Step 2: Scan QR Code */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-2">2</span>
                Scan this QR code
              </h4>
              <div className="ml-8">
                {qrCodeImage && (
                  <div className="flex justify-center">
                    <img 
                      src={qrCodeImage} 
                      alt="TOTP QR Code" 
                      className="w-48 h-48 border-2 border-gray-300 rounded-lg p-2 bg-white"
                    />
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1 font-medium">Or enter this code manually:</p>
                  <code className="block text-center font-mono text-sm text-gray-900 bg-white border border-gray-300 rounded px-2 py-2 select-all">
                    {secret}
                  </code>
                </div>
              </div>
            </div>

            {/* Step 3: Enter Code */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-2">3</span>
                Enter the 6-digit code from your app
              </h4>
              <form onSubmit={confirmSetup} className="ml-8">
                <input
                  type="text"
                  placeholder="000000"
                  className="w-full p-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={confirmCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) {
                      setConfirmCode(value);
                      setError('');
                    }
                  }}
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                  disabled={loading}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  The code refreshes every 30 seconds
                </p>

                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-700 text-sm font-medium">{error}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={loading || confirmCode.length !== 6}
                    className={`flex-1 py-3 rounded-lg font-semibold transition ${
                      loading || confirmCode.length !== 6
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {loading ? 'Confirming...' : 'Confirm & Enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-green-600 mb-2">✓ Authenticator Enabled!</h3>
          <p className="text-gray-600 mb-6">Your account is now protected with two-factor authentication</p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Important
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• From now on, you must use your authenticator app to login</li>
              <li>• Keep your phone secure and backed up</li>
              <li>• Save your secret code in a safe place</li>
            </ul>
          </div>

          <button
            onClick={handleSuccess}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Continue to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default TotpSetup;
