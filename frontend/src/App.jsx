import React, { useState } from 'react';
import Header from './components/Header';
import TaxCalculator from './components/TaxCalculator';
import SectorBreakdown from './components/SectorBreakdown';
import ProjectMap from './components/ProjectMap';
import AnomalyAlerts from './components/AnomalyAlerts';
import Chatbot from './components/Chatbot';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [taxResult, setTaxResult] = useState(null);

  const tabs = [
    { id: 'calculator', label: '₹ Calculator', icon: '🧮' },
    { id: 'map', label: 'Project Map', icon: '🗺️' },
    { id: 'alerts', label: 'Alerts', icon: '🚩' },
  ];

  return (
    <div className="app">
      <Header />

      <nav className="tab-nav">
        <div className="tab-nav-inner">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'calculator' && (
          <div className="fade-up">
            <TaxCalculator onResult={setTaxResult} />
            {taxResult && <SectorBreakdown taxResult={taxResult} />}
          </div>
        )}
        {activeTab === 'map' && (
          <div className="fade-up">
            <ProjectMap />
          </div>
        )}
        {activeTab === 'alerts' && (
          <div className="fade-up">
            <AnomalyAlerts />
          </div>
        )}
      </main>

      <Chatbot taxResult={taxResult} />
    </div>
  );
}
