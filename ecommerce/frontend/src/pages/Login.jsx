import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate(res.data.user.role === "owner" ? "/complaints" : "/shop");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="form-container">
      <form className="form-card" onSubmit={handleSubmit}>
        <h2 className="form-title">{form.role === "owner" ? "Owner Login" : "Customer Login"}</h2>
        {error && <p className="error-msg">{error}</p>}
        <label className="form-input">
          Sign in as
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="customer">Customer</option>
            <option value="owner">Owner</option>
          </select>
        </label>
        <input type="email" placeholder="Email" className="form-input" onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Password" className="form-input" minLength={6} autoComplete="current-password" onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "1rem" }}>Login</button>
        <p className="form-footer"><Link to="/forgot-password">Forgot password?</Link></p>
        <p className="form-footer">New customer? <Link to="/signup">Create a customer account</Link></p>
      </form>
    </div>
  );
}