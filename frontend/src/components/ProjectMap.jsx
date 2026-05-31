import React, { useEffect, useRef, useState } from 'react';
import './ProjectMap.css';

// Mock project data (Hyderabad/Telangana focused)
const MOCK_PROJECTS = [
  { id: 1, name: 'Hyderabad Metro Phase 2', sector: 'infrastructure', lat: 17.385, lng: 78.4867, budget: 14400, spent: 8200, status: 'ongoing', completion: 57 },
  { id: 2, name: 'AIIMS Hyderabad', sector: 'healthcare', lat: 17.545, lng: 78.571, budget: 2000, spent: 1800, status: 'ongoing', completion: 90 },
  { id: 3, name: 'Outer Ring Road Extension', sector: 'infrastructure', lat: 17.290, lng: 78.560, budget: 3200, spent: 3200, status: 'completed', completion: 100 },
  { id: 4, name: 'Jal Jeevan Mission – Nalgonda', sector: 'rural_dev', lat: 17.058, lng: 79.267, budget: 850, spent: 430, status: 'ongoing', completion: 51 },
  { id: 5, name: 'IIIT Hyderabad Campus Expansion', sector: 'education', lat: 17.445, lng: 78.349, budget: 500, spent: 280, status: 'ongoing', completion: 56 },
  { id: 6, name: 'Rajiv Aarogyasri Health Centres', sector: 'healthcare', lat: 17.680, lng: 78.213, budget: 320, spent: 310, status: 'completed', completion: 97 },
  { id: 7, name: 'PM Awas Yojana – Warangal', sector: 'social_welfare', lat: 17.977, lng: 79.598, budget: 1200, spent: 640, status: 'stalled', completion: 53 },
  { id: 8, name: 'Telangana Highway NH-44 Widening', sector: 'infrastructure', lat: 17.100, lng: 78.750, budget: 2800, spent: 1400, status: 'ongoing', completion: 50 },
];

const SECTOR_COLORS = {
  infrastructure: '#4a9eff',
  healthcare: '#00e5a0',
  education: '#a78bfa',
  social_welfare: '#fbbf24',
  rural_dev: '#34d399',
  admin: '#f87171',
  others: '#60a5fa',
  defence: '#ff6b35',
};

export default function ProjectMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterSector, setFilterSector] = useState('all');
  const [L, setL] = useState(null);

  useEffect(() => {
    // Dynamically import leaflet
    import('leaflet').then(leaflet => {
      setL(leaflet.default || leaflet);
    });
  }, []);

  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [17.4, 78.5],
      zoom: 9,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [L]);

  useEffect(() => {
    if (!L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.CircleMarker || layer instanceof L.Marker) layer.remove();
    });

    const filtered = filterSector === 'all' ? MOCK_PROJECTS : MOCK_PROJECTS.filter(p => p.sector === filterSector);

    filtered.forEach(p => {
      const color = SECTOR_COLORS[p.sector] || '#888';
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 10,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.8,
      }).addTo(map);

      marker.on('click', () => setSelectedProject(p));
      marker.bindTooltip(p.name, { direction: 'top', offset: [0, -8] });
    });
  }, [L, filterSector]);

  const formatCr = (n) => `₹${n.toLocaleString('en-IN')} Cr`;

  const sectors = ['all', ...new Set(MOCK_PROJECTS.map(p => p.sector))];

  return (
    <div className="map-container card">
      <div className="map-header">
        <div>
          <h2 className="section-title">Government-Funded Projects</h2>
          <p className="section-subtitle">Live map of publicly funded projects in Telangana</p>
        </div>
        <select
          className="sector-filter"
          value={filterSector}
          onChange={e => setFilterSector(e.target.value)}
        >
          {sectors.map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All Sectors' : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
          ))}
        </select>
      </div>

      <div className="map-body">
        <div className="leaflet-map" ref={mapRef} />

        {selectedProject && (
          <div className="project-panel fade-up">
            <button className="panel-close" onClick={() => setSelectedProject(null)}>✕</button>
            <div className="panel-sector" style={{ color: SECTOR_COLORS[selectedProject.sector] }}>
              {selectedProject.sector.replace('_', ' ').toUpperCase()}
            </div>
            <div className="panel-name">{selectedProject.name}</div>
            <div className="panel-grid">
              <div className="panel-stat">
                <div className="panel-stat-val">{formatCr(selectedProject.budget)}</div>
                <div className="panel-stat-label">Allocated</div>
              </div>
              <div className="panel-stat">
                <div className="panel-stat-val">{formatCr(selectedProject.spent)}</div>
                <div className="panel-stat-label">Spent</div>
              </div>
            </div>
            <div className="panel-progress-label">
              <span>Completion</span>
              <span>{selectedProject.completion}%</span>
            </div>
            <div className="panel-progress-wrap">
              <div
                className="panel-progress-bar"
                style={{
                  width: `${selectedProject.completion}%`,
                  background: selectedProject.status === 'stalled' ? '#ffcc44' : SECTOR_COLORS[selectedProject.sector],
                }}
              />
            </div>
            <div className={`panel-status badge ${selectedProject.status === 'completed' ? 'badge-green' : selectedProject.status === 'stalled' ? 'badge-yellow' : 'badge-green'}`}>
              {selectedProject.status === 'stalled' ? '⚠️' : selectedProject.status === 'completed' ? '✅' : '🔵'} {selectedProject.status}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
