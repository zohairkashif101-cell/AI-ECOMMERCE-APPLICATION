import React, { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset, resetPassword } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleRequestCode = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const response = await requestPasswordReset(email);
      setCodeSent(true);
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Could not request a reset code");
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setBusy(true);
    try {
      const response = await resetPassword({ email, otp, password, confirmPassword });
      setMessage(response.data.message);
      setOtp("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2 className="form-title">Reset your password</h2>
        {error && <p className="error-msg">{error}</p>}
        {message && <p role="status">{message}</p>}
        {!codeSent ? (
          <form onSubmit={handleRequestCode}>
            <label className="form-input">
              Account email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </label>
            <button className="btn-primary" type="submit" disabled={busy}>
              {busy ? "Sending..." : "Send reset code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <p>Enter the code sent to {email}. It is valid for 10 minutes.</p>
            <label className="form-input">
              Six-digit email code
              <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value)} required />
            </label>
            <label className="form-input">
              New password (minimum 6 characters)
              <input type="password" minLength={6} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            <label className="form-input">
              Confirm new password
              <input type="password" minLength={6} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
            </label>
            <button className="btn-primary" type="submit" disabled={busy}>
              {busy ? "Updating..." : "Set new password"}
            </button>
            <button className="btn-primary" type="button" onClick={handleRequestCode} disabled={busy}>
              Send another code
            </button>
          </form>
        )}
        <p className="form-footer"><Link to="/login">Back to login</Link></p>
      </div>
    </div>
  );
}
