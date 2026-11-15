import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { addToCart, fetchProducts, updateProduct } from "../services/api";

export default function Shopping() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isOwner = user?.role === "owner";
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetchProducts();
        setProducts(res.data.products);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setError("Failed to load products. Please try again.");
      }
    };

    loadProducts();
  }, []);

  const handleAddToCart = async (productId, quantity) => {
    try {
      await addToCart({ productId, quantity });
      alert("Product added to cart successfully!");
    } catch (err) {
      console.error("Failed to add to cart", err);
      alert(err.response?.data?.message || "Failed to add product to cart");
    }
  };

  const handleUpdateStock = async (productId, stock) => {
    try {
      const res = await updateProduct(productId, { stock });
      setProducts((current) => current.map((product) => (
        product._id === productId ? res.data.product : product
      )));
    } catch (err) {
      console.error("Failed to update stock", err);
      setError(err.response?.data?.message || "Failed to update stock");
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Explore Products</h2>
      {error && <p className="error-msg">{error}</p>}
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard 
            key={p._id} 
            product={p} 
            onAddToCart={handleAddToCart}
            isOwner={isOwner}
            onUpdateStock={handleUpdateStock}
          />
        ))}
      </div>
    </div>
  );
}