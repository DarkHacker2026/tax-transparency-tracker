import React from 'react';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="brand-icon">₹</div>
          <div>
            <div className="brand-name">Tax Transparency Tracker</div>
            <div className="brand-tagline">Know where your taxes go</div>
          </div>
        </div>
        <div className="header-meta">
          <span className="live-badge">
            <span className="live-dot"></span>
            Union Budget 2024–25
          </span>
        </div>
      </div>
    </header>
  );
}
