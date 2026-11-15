import React, { useState } from "react";

export default function ProductCard({ product, onAddToCart, isOwner, onUpdateStock }) {
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState(product.stock ?? 0);

  return (
    <div className="product-card">
      <img
        src={product.image}
        alt={product.name}
        className="product-image"
        onError={(event) => {
          event.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23eeeeee'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%23555' font-family='sans-serif' font-size='24'%3EImage unavailable%3C/text%3E%3C/svg%3E";
        }}
      />
      <div className="product-body">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">${product.price}</span>
          {isOwner ? (
            <label>
              Stock:{" "}
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
              />
              <button className="btn-primary" onClick={() => onUpdateStock(product._id, Number(stock))}>
                Save stock
              </button>
            </label>
          ) : (
            <div>
              <p>{product.stock} in stock</p>
              <label>
                Quantity{" "}
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  step="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </label>
              <button
                className="btn-primary"
                disabled={!product.stock || Number(quantity) < 1 || Number(quantity) > product.stock}
                onClick={() => onAddToCart(product._id, Number(quantity))}
              >
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}