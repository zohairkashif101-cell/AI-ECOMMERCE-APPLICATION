import React, { useEffect, useState } from "react";
import { fetchComplaints, createComplaint, updateComplaintStatus } from "../services/api";

const complaintStatuses = ["Pending", "In Progress", "Resolved"];

export default function Complaints() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isOwner = user?.role === "owner";
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ productName: "", category: "General", description: "" });
  const [error, setError] = useState("");
  const [loadingError, setLoadingError] = useState("");
  const [savingComplaint, setSavingComplaint] = useState(false);

  const loadComplaints = async () => {
    try {
      const res = await fetchComplaints();
      setComplaints(res.data);
      setLoadingError("");
    } catch (err) {
      console.error("Failed to fetch complaints", err);
      setLoadingError("Could not load complaints. Please refresh and try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSavingComplaint(true);
    try {
      await createComplaint(form);
      setForm({ productName: "", category: "General", description: "" });
      await loadComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create complaint");
    } finally {
      setSavingComplaint(false);
    }
  };

  const handleStatusChange = async (complaintId, status) => {
    try {
      const res = await updateComplaintStatus(complaintId, { status });
      setComplaints((current) =>
        current.map((complaint) =>
          complaint._id === complaintId ? res.data.updatedComplaint : complaint
        )
      );
    } catch (err) {
      console.error("Failed to update complaint status", err);
      setLoadingError(err.response?.data?.message || "Failed to update complaint status");
    }
  };

  useEffect(() => {
    loadComplaints();
    const intervalId = window.setInterval(loadComplaints, 10000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="page-container">
      <h2 className="page-title">{isOwner ? "Owner Complaint Dashboard" : "Support & Complaints"}</h2>

      {isOwner ? (
        <p>New customer complaints appear here for review. Update a status to notify the customer.</p>
      ) : (
        <form onSubmit={handleSubmit} className="form-card" style={{ marginBottom: "2rem" }}>
          <h3>Submit a New Complaint</h3>
          {error && <p className="error-msg">{error}</p>}
          <input type="text" placeholder="Product Name" className="form-input" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} required />
          <input type="text" placeholder="Category" className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <textarea placeholder="Describe your issue..." className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <button type="submit" className="btn-primary" style={{ marginTop: "1rem" }} disabled={savingComplaint}>
            {savingComplaint ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      )}

      <h3>{isOwner ? "Customer Complaints" : "Your Complaints History"}</h3>
      {loadingError && <p className="error-msg">{loadingError}</p>}
      {complaints.length === 0 && <p>No complaints to show yet.</p>}
      <div className="complaints-list">
        {complaints.map((c) => (
          <div key={c._id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem", borderRadius: "8px" }}>
            <h4>{c.productName} <span style={{ fontSize: "0.8rem", color: "gray" }}>({c.status})</span></h4>
            {isOwner && <p><strong>Customer:</strong> {c.customerName}</p>}
            <p><strong>Description:</strong> {c.description}</p>
            {isOwner ? (
              <>
                <p><strong>Owner notice:</strong> {c.ownerNotification || `Review ${c.customerName}'s complaint about ${c.productName}.`}</p>
                <label>
                  Update status:{" "}
                  <select value={c.status} onChange={(e) => handleStatusChange(c._id, e.target.value)}>
                    {complaintStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
              </>
            ) : (
              <p><strong>Store response:</strong> {c.customerReply || c.aiAnalysis?.suggestedReply || "Your complaint has been received and is waiting for review."}</p>
            )}
            {isOwner && c.aiAnalysis && <p><strong>Complaint summary:</strong> {c.aiAnalysis.summary}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}