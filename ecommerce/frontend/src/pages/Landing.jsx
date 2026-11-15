import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  const token = localStorage.getItem("token");

  return (
    <div className="landing-wrapper">
      {/* Hero Banner */}
      <section className="hero">
        <span className="hero-badge">New Generation Tech</span>
        <h1 className="hero-title">Elevate Your Everyday Tech</h1>
        <p className="hero-subtitle">
          Discover premium, carefully curated gadgets designed to boost your productivity and lifestyle. Experience quality without compromise.
        </p>
        <div className="hero-actions">
          {token ? (
            <Link to="/shop" className="btn-cta">
              Go to Store
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn-cta">
                Get Started
              </Link>
              <Link to="/login" className="btn-secondary">
                Login Account
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Fast Shipping</h3>
            <p>Express doorstep delivery with real-time tracking on all orders.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>2-Year Warranty</h3>
            <p>Guaranteed official hardware support and hassle-free replacements.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>24/7 Support</h3>
            <p>Dedicated technical support team ready to assist you anytime.</p>
          </div>
        </div>
      </section>
    </div>
  );
}