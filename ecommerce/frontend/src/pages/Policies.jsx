import React, { useEffect, useState } from "react";
import { fetchPolicies, createPolicy, updatePolicy, deletePolicy } from "../services/api";

export default function Policies() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isOwner = user?.role === "owner";
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ policyType: "", title: "", content: "" });
  const [error, setError] = useState("");

  const loadPolicies = async () => {
    try {
      const res = await fetchPolicies();
      const policyData = Array.isArray(res.data) ? res.data : res.data.policies || [];
      setPolicies(policyData);
    } catch (err) {
      console.error("Failed to fetch policies", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updatePolicy(id, formData);
      setEditId(null);
      loadPolicies();
    } catch (err) {
      console.error("Failed to update policy", err);
      setError(err.response?.data?.message || "Failed to update policy");
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await createPolicy(formData);
      setFormData({ policyType: "", title: "", content: "" });
      await loadPolicies();
    } catch (err) {
      console.error("Failed to create policy", err);
      setError(err.response?.data?.message || "Failed to create policy");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) {
      return;
    }

    setError("");
    try {
      await deletePolicy(id);
      setPolicies((currentPolicies) => currentPolicies.filter((policy) => (policy._id || policy.id) !== id));
    } catch (err) {
      console.error("Failed to delete policy", err);
      setError(err.response?.data?.message || "Failed to delete policy");
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  if (loading) return <div className="page-container">Loading policies...</div>;

  return (
    <div className="page-container">
      <h2 className="page-title">Store Policies</h2>
      {error && <p className="error-msg">{error}</p>}
      {isOwner && (
        <form className="form-card" onSubmit={handleCreate} style={{ marginBottom: "2rem" }}>
          <h3>Add a Policy</h3>
          <select className="form-input" value={formData.policyType} onChange={(e) => setFormData({ ...formData, policyType: e.target.value })} required>
            <option value="">Select policy type</option>
            <option value="Exchange">Exchange</option>
            <option value="Refund">Refund</option>
            <option value="Shipping">Shipping</option>
            <option value="FAQ">FAQ</option>
          </select>
          <input className="form-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Title" required />
          <textarea className="form-input" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Policy details" required />
          <button className="btn-primary" type="submit">Add Policy</button>
        </form>
      )}
      {policies.length === 0 ? (
        <p>No policies available at the moment.</p>
      ) : (
        <div className="policies-list">
          {policies.map((p) => {
            const pId = p._id || p.id;
            return (
              <div key={pId} className="policy-card" style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem", borderRadius: "8px" }}>
                {editId === pId ? (
                  <div>
                    <select 
                      value={formData.policyType} 
                      onChange={(e) => setFormData({ ...formData, policyType: e.target.value })}
                      style={{ display: "block", marginBottom: "8px", width: "100%", padding: "5px" }}
                    >
                      <option value="Exchange">Exchange</option>
                      <option value="Refund">Refund</option>
                      <option value="Shipping">Shipping</option>
                      <option value="FAQ">FAQ</option>
                    </select>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Title"
                      style={{ display: "block", marginBottom: "8px", width: "100%", padding: "5px" }}
                    />
                    <textarea 
                      value={formData.content} 
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Content"
                      style={{ display: "block", marginBottom: "8px", width: "100%", padding: "5px" }}
                    />
                    <button 
                      onClick={() => handleUpdate(pId)}
                      style={{ background: "green", color: "white", padding: "5px 10px", marginRight: "5px", border: "none", borderRadius: "4px" }}
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditId(null)}
                      style={{ background: "gray", color: "white", padding: "5px 10px", border: "none", borderRadius: "4px" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3>{p.title}</h3>
                    <span className="policy-type">Type: {p.policyType}</span>
                    <p>{p.content}</p>
                    {isOwner && <button 
                      onClick={() => {
                        setEditId(pId);
                        setFormData({ policyType: p.policyType, title: p.title, content: p.content });
                      }}
                      style={{ marginTop: "10px", background: "#007bff", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Update Policy
                    </button>}
                    {isOwner && <button
                      onClick={() => handleDelete(pId)}
                      style={{ marginTop: "10px", marginLeft: "8px", background: "#dc3545", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Delete Policy
                    </button>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}