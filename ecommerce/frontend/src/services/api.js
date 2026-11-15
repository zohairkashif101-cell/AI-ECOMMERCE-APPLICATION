import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const loginUser = (formData) => API.post("/auth/login", formData);
export const signupUser = (formData) => API.post("/auth/signup", formData);
export const requestPasswordReset = (email) => API.post("/auth/forgot-password", { email });
export const resetPassword = (data) => API.post("/auth/reset-password", data);

export const fetchProducts = () => API.get("/products");
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);

export const fetchCart = () => API.get("/cart");
export const addToCart = (data) => API.post("/cart/add", data);
export const removeFromCart = (data) => API.post("/cart/remove", data);

export const fetchComplaints = () => API.get("/complaints");
export const createComplaint = (data) => API.post("/complaints", data);
export const updateComplaintStatus = (id, data) => API.put(`/complaints/${id}`, data);

export const fetchPolicies = () => API.get("/policy");
export const createPolicy = (data) => API.post("/policy", data);
export const updatePolicy = (id, data) => API.put(`/policy/${id}`, data);
export const deletePolicy = (id) => API.delete(`/policy/${id}`);
export const sendChatMessage = (message) => API.post("/chat", { message });
