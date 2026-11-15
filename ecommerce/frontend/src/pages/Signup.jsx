import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../services/api";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    ownerSignupKey: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signupUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="form-container">
      <form className="form-card" onSubmit={handleSubmit}>
        <h2 className="form-title">{form.role === "owner" ? "Create Owner Account" : "Create Customer Account"}</h2>
        {error && <p className="error-msg">{error}</p>}
        <input type="text" placeholder="Full Name" className="form-input" onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="email" placeholder="Email" className="form-input" onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label className="form-input">
          Account type
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, ownerSignupKey: "" })}>
            <option value="customer">Customer</option>
            <option value="owner">Owner</option>
          </select>
        </label>
        {form.role === "owner" && (
          <input
            type="password"
            placeholder="Owner invite key"
            className="form-input"
            value={form.ownerSignupKey}
            onChange={(e) => setForm({ ...form, ownerSignupKey: e.target.value })}
            required
          />
        )}
        <input type="password" placeholder="Password (minimum 6 characters)" className="form-input" minLength={6} autoComplete="new-password" onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "1rem" }}>Sign Up</button>
        <p className="form-footer">Already registered? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}