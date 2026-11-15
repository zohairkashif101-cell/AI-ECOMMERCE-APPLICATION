import React, { useEffect, useState } from "react";
import { fetchCart, removeFromCart, addToCart } from "../services/api";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = async () => {
    try {
      const res = await fetchCart();
      setCart(res.data.cart);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const idString = typeof productId === 'object' && productId !== null ? productId?._id || productId?.toString() : productId;
      const res = await removeFromCart({ productId: idString });
      setCart(res.data.cart);
    } catch (err) {
      console.error("Failed to remove item", err);
      setError(err.response?.data?.message || "Failed to remove item");
    }
  };

  const handleUpdateQuantity = async (productId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    setError("");
    
    try {
      const idString = typeof productId === 'object' && productId !== null ? productId?._id || productId?.toString() : productId;
      const res = await addToCart({ productId: idString, quantity: change });
      setCart(res.data.cart);
    } catch (err) {
      console.error("Failed to update quantity", err);
      setError(err.response?.data?.message || "Failed to update quantity");
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  if (loading) return <div className="page-container">Loading cart...</div>;

  return (
    <div className="page-container">
      <h2 className="page-title">Your Shopping Cart</h2>
      {error && <p className="error-msg">{error}</p>}
      {!cart || !cart.items || cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-list">
          {cart.items.map((item) => {
            // Yahan check kar rahe hain ke item.productId agar poora object hai (populate huawa)
            const prodObj = typeof item.productId === 'object' && item.productId !== null ? item.productId : null;
            
            // Name aur Price extract karna
            const prodName = prodObj?.name || "Product Name Not Available";
            const prodPrice = prodObj?.price || 0;
            const rawId = prodObj?._id ? prodObj._id : item.productId;

            return (
              <div key={item._id} className="cart-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
                <div>
                  {/* Product ka asli Name show hoga */}
                  <h4 style={{ margin: "0 0 5px 0" }}>{prodName}</h4>
                  
                  {/* Product ki asli Price show hogi */}
                  <p style={{ margin: "0 0 8px 0", color: "#555" }}>Price: ${prodPrice}</p>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span>Quantity: {item.quantity}</span>
                    <button 
                      onClick={() => handleUpdateQuantity(rawId, item.quantity, -1)}
                      style={{ padding: "2px 8px", cursor: "pointer" }}
                    >
                      -
                    </button>
                    <button 
                      onClick={() => handleUpdateQuantity(rawId, item.quantity, 1)}
                      disabled={item.quantity >= (prodObj?.stock ?? item.quantity)}
                      style={{ padding: "2px 8px", cursor: "pointer" }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button 
                  className="btn-danger" 
                  onClick={() => handleRemove(rawId)}
                  style={{ background: "red", color: "white", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}