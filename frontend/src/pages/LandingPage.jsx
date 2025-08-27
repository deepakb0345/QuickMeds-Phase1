// src/pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom"; // Assuming you'll use React Router for navigation
import "./LandingPage.css"; // We'll create this CSS file next

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Header Section */}
      <header className="header">
        {/* Placeholder for your logo */}
        <div className="logo-placeholder">QuickMeds.</div>
      </header>

      {/* Main Content Section */}
      <main className="main-content">
        <h1 className="main-heading">Choose Your Path</h1>
        <p className="sub-heading">How would you like to get your medicine?</p>

        <div className="options-grid">
          {/* Option 1: With Prescription */}
          <Link to="/upload" className="option-card with-prescription">
            <div className="icon-box">
              {/* This is a placeholder for an SVG icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <line x1="10" y1="9" x2="8" y2="9"></line>
              </svg>
            </div>
            <span className="card-text">With Prescription</span>
          </Link>

          {/* Option 2: Without Prescription */}
          <div className="option-card without-prescription">
            <div className="icon-box">
              {/* Placeholder for an SVG icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 12.55a2 2 0 0 0 2 1.45h9.5a2 2 0 0 0 2-1.45L23 6H6"></path>
              </svg>
            </div>
            <span className="card-text">Without Prescription</span>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="footer">
        <p>© 2025 QuickMeds. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
