import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import App from './App';

global.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(() => Promise.resolve({ data: [] })),
}));

jest.mock('chart.js', () => ({
  Chart: Object.assign(
    jest.fn().mockImplementation(() => ({
      destroy: jest.fn(),
    })),
    { register: jest.fn() }
  ),
  DoughnutController: jest.fn(),
  ArcElement: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

jest.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid="doughnut-chart" />,
}));

jest.mock('./components/SectorBreakdown', () => function MockSectorBreakdown() {
  return <div>Your Tax Allocation</div>;
});

jest.mock('./components/AnomalyAlerts', () => function MockAnomalyAlerts() {
  return <div>Anomaly Alerts</div>;
});

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
}));

jest.mock('leaflet', () => ({
  Icon: jest.fn(),
}));

describe('App', () => {
  let container;
  let root;

  beforeEach(() => {
    jest.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    document.body.removeChild(container);
    container = null;
  });

  test('renders the main calculator view', () => {
    act(() => {
      root.render(<App />);
    });

    expect(container.textContent).toContain('Tax Transparency Tracker');
    expect(container.textContent).toContain('Your Tax Calculator');
  });

  test('calculates tax after income entry', () => {
    act(() => {
      root.render(<App />);
    });

    const input = container.querySelector('.income-input');
    const button = container.querySelector('.calc-btn');

    act(() => {
      input.value = '1000000';
      Simulate.change(input);
    });
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      jest.advanceTimersByTime(600);
    });

    expect(container.textContent).toContain('Total Tax Paid');
    expect(container.textContent).toContain('Your Tax Allocation');
  });

  test('switches to project map and alerts tabs', () => {
    act(() => {
      root.render(<App />);
    });

    const buttons = Array.from(container.querySelectorAll('.tab-btn'));

    act(() => {
      buttons.find((button) => button.textContent.includes('Project Map')).click();
    });
    expect(container.textContent).toContain('Government-Funded Projects');

    act(() => {
      buttons.find((button) => button.textContent.includes('Alerts')).click();
    });
    expect(container.textContent).toContain('Anomaly Alerts');
  });
});
