# Tax Transparency Tracker

> CivicTech Hackathon 2025 - Team WOAWLU | National Level - India

An AI-powered civic web app that shows Indian citizens exactly where their tax money goes, sector by sector, project by project, in plain language.

---

## The Problem

Every year, Indian citizens pay income tax but have limited visibility into how it is spent. Union Budget documents are 500+ pages of dense jargon. There is no personalised breakdown, no project tracking, and no direct way to flag suspected misuse.

---

## Our Solution

The Tax Transparency Tracker lets you:

- Enter your income and see how your exact tax rupees are split across sectors
- View a live map of government-funded projects near you
- Ask an AI chatbot "where did my Rs 500 go?" in Hindi, Telugu, or English
- Get plain-language summaries of complex budget PDFs
- See ML-flagged anomalies and suspected misuse of funds

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Chart.js, Leaflet.js |
| Backend | Node.js + Express |
| AI / Chatbot | OpenRouter-compatible chat API |
| ML / Anomaly Detection | Python, scikit-learn, pandas |
| Database | PostgreSQL |
| Data Sources | data.gov.in, Union Budget PDFs, CAG reports |
| Deployment | Vercel frontend + Render backend |

---

## Getting Started

### Prerequisites

- Node.js v18+
- Python 3.10-3.12 for the ML dependencies
- PostgreSQL

### Installation

```bash
# Clone the repo
git clone https://code.swecha.org/WOAWLU/tax-transparency-tracker.git
cd tax-transparency-tracker

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install ML dependencies
cd ../ml
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in `/backend`:

```text
DATABASE_URL=your_postgres_url
OPENROUTER_API_KEY=your_openrouter_api_key
PORT=5000
```

### Run Locally

```bash
# Start backend
cd backend && npm run dev

# Start frontend in a new terminal
cd frontend && npm start
```

---

## Testing and Coverage

Install dependencies for all three layers before running tests:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../ml && pip install -r requirements.txt
```

Run the full test suite from the repository root:

```bash
npm test
```

Run coverage checks from the repository root:

```bash
npm run coverage
```

Coverage thresholds are enforced in local coverage runs and CI:

| Layer | Command | Threshold |
|---|---|---|
| Backend | `cd backend && npm run coverage` | 80% statements/lines, 75% functions, 70% branches |
| Frontend | `cd frontend && npm run coverage` | 35% statements/lines, 25% functions, 20% branches |
| ML | `cd ml && python -m pytest` | 55% total coverage |

The CI workflow in `.github/workflows/test.yml` runs these coverage checks on pushes and pull requests, and fails the build if any layer drops below its threshold.

---

## Project Structure

```text
tax-transparency-tracker/
├── frontend/          # React app
│   ├── src/
│   │   ├── components/
│   │   ├── utils/
│   │   └── App.jsx
├── backend/           # Node.js API
│   ├── routes/
│   ├── middleware/
│   └── index.js
├── ml/                # Python ML pipeline
│   ├── anomaly_detection.py
│   ├── nlp_parser.py
│   └── requirements.txt
├── data/              # Budget datasets
├── README.md
├── CONTRIBUTING.md
├── USER_MANUAL.md
└── AGENTS.md
```

---

## Team WOAWLU

| Member | Role |
|---|---|
| Member 1 | Frontend and UI/UX |
| Member 2 | Backend and Data Engineering |
| Member 3 | AI/ML and Chatbot |

---

## License

MIT License - free to use and build upon.
