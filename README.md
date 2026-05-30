# 🧾 Tax Transparency Tracker

> **CivicTech Hackathon 2025** — Team WOAWLU | National Level – India

An AI-powered civic web app that shows Indian citizens exactly where their tax money goes — sector by sector, project by project, in plain language.

---

## 🚨 The Problem

Every year, Indian citizens pay income tax but have **zero visibility** into how it's spent. Union Budget documents are 500+ pages of dense jargon. There's no personalised breakdown, no project tracking, and no way to flag misuse.

---

## 💡 Our Solution

The **Tax Transparency Tracker** lets you:

- 🔢 Enter your income → see how your exact tax rupees are split across sectors
- 🗺️ View a live map of government-funded projects near you
- 🤖 Ask an AI chatbot — *"where did my ₹500 go?"* — in Hindi, Telugu, or English
- 📄 Get plain-language summaries of complex budget PDFs
- 🚩 See ML-flagged anomalies and suspected misuse of funds

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Tailwind CSS, Chart.js, Leaflet.js |
| Backend | Node.js + Express |
| AI / Chatbot | Claude API (Anthropic) |
| ML / Anomaly Detection | Python, scikit-learn, pandas |
| Database | PostgreSQL |
| Data Sources | data.gov.in, Union Budget PDFs, CAG reports |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.10+
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

```
DATABASE_URL=your_postgres_url
ANTHROPIC_API_KEY=your_claude_api_key
PORT=5000
```

### Run Locally

```bash
# Start backend
cd backend && npm run dev

# Start frontend (new terminal)
cd frontend && npm start
```

---

## 📁 Project Structure

```
tax-transparency-tracker/
├── frontend/          # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
├── backend/           # Node.js API
│   ├── routes/
│   ├── controllers/
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

## 👥 Team WOAWLU

| Member | Role |
|---|---|
| Member 1 | Frontend & UI/UX |
| Member 2 | Backend & Data Engineering |
| Member 3 | AI/ML & Chatbot |

---

## 📄 License

MIT License — free to use and build upon.
