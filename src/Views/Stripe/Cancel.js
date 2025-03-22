import React from "react";
import "../../Assets/css/Success.css"; // You can keep using this or rename

export const Cancel = () => {
  return (
    <div className="cancel-container">
      <div className="cancel-card">
        <div className="cancel-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ff4d4f"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h2>Payment Cancelled</h2>
        <p>Your payment process was cancelled or not completed.</p>
        <a href="/" className="cancel-btn">
          Go Back Home
        </a>
      </div>
    </div>
  );
};