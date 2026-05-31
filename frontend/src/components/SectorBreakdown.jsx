import React, { useRef, useEffect, useState } from 'react';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { getSectorBreakdown } from '../utils/taxConstants';
import './SectorBreakdown.css';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

export default function SectorBreakdown({ taxResult }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [activeIdx, setActiveIdx] = useState(null);

  const sectors = getSectorBreakdown(taxResult.tax);

  const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: 'doughnut',
      data: {
        labels: sectors.map(s => s.name),
        datasets: [{
          data: sectors.map(s => s.percent),
          backgroundColor: sectors.map(s => s.color + 'cc'),
          borderColor: sectors.map(s => s.color),
          borderWidth: 2,
          hoverBorderWidth: 3,
        }],
      },
      options: {
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const s = sectors[ctx.dataIndex];
                return ` ${s.percent}% — ${formatINR(s.amount)}`;
              }
            }
          }
        },
        onHover: (_, elements) => {
          setActiveIdx(elements.length > 0 ? elements[0].index : null);
        },
        animation: { duration: 800, easing: 'easeInOutQuart' },
      },
    });

    return () => chartInstance.current?.destroy();
  }, [taxResult]);

  return (
    <div className="card breakdown-card fade-up">
      <h2 className="section-title">Your Tax Allocation</h2>
      <p className="section-subtitle">
        How your {formatINR(taxResult.tax)} is distributed across government sectors this fiscal year.
      </p>

      <div className="breakdown-layout">
        <div className="chart-wrap">
          <canvas ref={chartRef} />
          <div className="chart-center">
            <div className="chart-center-val">{formatINR(taxResult.tax)}</div>
            <div className="chart-center-label">Total Tax</div>
          </div>
        </div>

        <div className="sector-list">
          {sectors.map((s, i) => (
            <div
              key={s.id}
              className={`sector-item ${activeIdx === i ? 'active' : ''}`}
              style={{ '--sector-color': s.color }}
            >
              <div className="sector-icon">{s.icon}</div>
              <div className="sector-info">
                <div className="sector-name">{s.name}</div>
                <div className="sector-desc">{s.description}</div>
                <div className="sector-bar-wrap">
                  <div
                    className="sector-bar"
                    style={{ width: `${s.percent}%`, background: s.color }}
                  />
                </div>
              </div>
              <div className="sector-amounts">
                <div className="sector-amount">{formatINR(s.amount)}</div>
                <div className="sector-pct">{s.percent}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
