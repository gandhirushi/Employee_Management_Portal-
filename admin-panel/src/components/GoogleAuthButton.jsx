import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '../config/env';

export default function GoogleAuthButton({ onSuccess, onError, text = "continue_with" }) {
  const [loading, setLoading] = useState(false);
  const clientId = GOOGLE_CLIENT_ID;

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      if (onError) onError("No credential returned from Google.");
      return;
    }

    try {
      setLoading(true);
      if (onSuccess) {
        await onSuccess(credentialResponse.credential);
      }
    } catch (err) {
      if (onError) onError(err.message || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    if (onError) {
      onError("Google sign-in was cancelled or could not be completed.");
    }
  };

  if (!clientId) {
    return (
      <div style={{
        padding: '10px 14px',
        fontSize: '0.8rem',
        borderRadius: '8px',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        color: '#dc2626',
        textAlign: 'center',
        margin: '12px 0'
      }}>
        Google Client ID is not configured. Set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>.env</code>.
      </div>
    );
  }

  return (
    <div className="google-auth-button-container" style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          borderRadius: 4,
          fontSize: '0.85rem',
          fontWeight: 500,
          color: 'var(--text-muted)'
        }}>
          Signing in with Google…
        </div>
      )}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          text={text}
          theme="outline"
          shape="rectangular"
          width="360"
          locale="en"
        />
      </div>
    </div>
  );
}
