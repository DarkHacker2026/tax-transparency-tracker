# 🤖 AGENTS.md — AI Agents in Tax Transparency Tracker

This document describes all AI agents used in the Tax Transparency Tracker, their roles, inputs, outputs, and how they interact.

---

## Overview

The app uses **3 AI agents**, each handling a distinct layer of intelligence:

```
User Input
    │
    ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Budget Parser  │────▶│ Citizen Chatbot │────▶│ Anomaly Detector│
│     Agent       │     │     Agent       │     │     Agent       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                        │
         ▼                      ▼                        ▼
  Structured spend        Plain-language           Risk flags &
  data by sector          Q&A answers              anomaly alerts
```

---

## Agent 1: Budget Parser Agent

**Purpose:** Converts raw government budget PDFs and data.gov.in datasets into structured, queryable spend data.

**Type:** NLP + Document Processing

**Model / Tools:** Python, pdfplumber, spaCy, regex patterns

**Inputs:**
- Union Budget PDF (Ministry of Finance)
- CAG audit reports
- State budget documents (Telangana)

**Outputs:**
- JSON object with sector-wise allocations
- Rupee amounts per ministry per year
- Project-level spend records

**How it works:**
1. Extracts raw text from PDFs using `pdfplumber`
2. Uses regex + spaCy NER to identify ministry names, rupee figures, and scheme names
3. Maps line items to one of 8 predefined sectors
4. Stores structured output in PostgreSQL for the backend API to serve

**Limitations:**
- May miss items in scanned/image PDFs (OCR not yet implemented)
- Sector mapping is rule-based; edge cases may be miscategorised

---

## Agent 2: Citizen Chatbot Agent

**Purpose:** Answers citizen questions about government spending in plain, conversational language across Hindi, Telugu, and English.

**Type:** Conversational AI (RAG-based)

**Model:** Claude API (claude-sonnet-4-20250514) via Anthropic

**Inputs:**
- User's natural language question (any of 3 languages)
- Structured budget data from the database (injected as context)
- User's calculated tax breakdown (session context)

**Outputs:**
- Plain-language answer (1–3 sentences)
- Optional: relevant project name or scheme link
- Language auto-detected and matched in response

**System Prompt Summary:**
```
You are a helpful civic assistant for Indian citizens. You answer questions 
about government spending clearly and honestly. Use only the budget data 
provided in context. If you don't know, say so. Keep answers under 3 sentences.
Respond in the same language the user writes in.
```

**Example Interactions:**

| User asks | Agent responds |
|---|---|
| "Where did my ₹42,000 go?" | Breaks down allocation across 8 sectors in plain language |
| "Hyderabad Metro budget?" | Pulls project data and gives current spend + status |
| "జల్ జీవన్ మిషన్ అంటే ఏమిటి?" | Explains in Telugu |

**API Call Structure:**
```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: `Budget context: ${budgetData}\n\nUser question: ${userQuestion}` }
    ]
  })
});
```

---

## Agent 3: Anomaly Detector Agent

**Purpose:** Identifies suspicious patterns in government spending — overbilling, stalled projects, repeated vendor anomalies.

**Type:** ML Classification + Rule-based Flagging

**Model:** Isolation Forest (scikit-learn) + rule-based thresholds

**Inputs:**
- Historical budget allocation data (2019–2024)
- Project completion status
- Contractor/vendor records from public tenders

**Outputs:**
- Risk score per project (0.0 – 1.0)
- Flag category: `overspend`, `stalled`, `vendor_anomaly`, `ghost_project`
- Human-readable alert message

**How it works:**
1. **Isolation Forest** identifies statistical outliers in spend-per-project vs sector average
2. **Rule engine** checks: completion % vs budget used, repeat vendor patterns, tender gaps
3. Projects above risk threshold 0.65 are flagged and surfaced in the Alerts tab

**Risk Levels:**

| Score | Level | Meaning |
|---|---|---|
| 0.0 – 0.4 | 🟢 Normal | Within expected range |
| 0.4 – 0.65 | 🟡 Watch | Minor deviation, monitor |
| 0.65 – 1.0 | 🔴 Flagged | Significant anomaly detected |

**Limitations:**
- Model trained on limited public data; false positives possible
- Does not constitute legal evidence of fraud — for awareness only

---

## Agent Interaction Flow

```
1. User opens app
2. Budget Parser Agent → loads sector allocations into DB (runs at startup / daily cron)
3. User enters income → Backend calculates tax split using DB data
4. User asks chatbot question → Citizen Chatbot Agent queries DB + calls Claude API → returns answer
5. Anomaly Detector Agent → runs nightly on new project data → updates Alerts tab
```

---

## Future Agent Ideas

- **Multilingual NLP Parser** — process state budgets in regional languages
- **Satellite Image Verifier** — cross-check road/construction projects vs satellite imagery
- **Petition Generator Agent** — auto-draft RTI requests for flagged anomalies
