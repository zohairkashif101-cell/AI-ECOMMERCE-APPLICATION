import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchComplaints } from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [pendingComplaints, setPendingComplaints] = useState(0);

  useEffect(() => {
    if (!token || user?.role !== "owner") {
      setPendingComplaints(0);
      return undefined;
    }

    const loadPendingComplaints = async () => {
      try {
        const res = await fetchComplaints();
        setPendingComplaints(res.data.filter((complaint) => complaint.status === "Pending").length);
      } catch (err) {
        console.error("Failed to check new complaints", err);
      }
    };

    loadPendingComplaints();
    const intervalId = window.setInterval(loadPendingComplaints, 10000);
    return () => window.clearInterval(intervalId);
  }, [token, user?.role]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };      

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">TechStore</Link>
      
      <div className="nav-links">
        {token ? (
          <>
            <Link to="/shop" className="nav-link">Shop</Link>
            {user?.role === "customer" && <Link to="/cart" className="nav-link">Cart</Link>}
            <Link to="/complaints" className="nav-link">
              {user?.role === "owner" ? "Complaint Dashboard" : "Complaints"}
              {user?.role === "owner" && pendingComplaints > 0 && (
                <span aria-label={`${pendingComplaints} pending complaints`} style={{ marginLeft: "0.4rem", color: "red" }}>
                  ({pendingComplaints})
                </span>
              )}
            </Link>
            <Link to="/policies" className="nav-link">{user?.role === "owner" ? "Manage Policies" : "Policies"}</Link>
            <span className="user-text">Hi, {user?.name || "User"}</span>
            <button onClick={handleLogout} className="btn-danger">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}