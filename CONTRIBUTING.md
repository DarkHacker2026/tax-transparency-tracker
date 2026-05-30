# 🤝 Contributing to Tax Transparency Tracker

Thank you for being part of Team WOAWLU! This guide explains how we collaborate on this repo during the hackathon.

---

## 🌿 Branch Strategy

We use a simple feature-branch workflow:

```
main          ← stable, demo-ready code only
├── dev       ← integration branch (merge here first)
│   ├── feat/frontend-ui
│   ├── feat/backend-api
│   └── feat/ai-chatbot
```

**Never push directly to `main`.** Always go through `dev` first.

---

## 🔧 How to Make Changes

1. **Pull latest dev**
```bash
git checkout dev
git pull origin dev
```

2. **Create your feature branch**
```bash
git checkout -b feat/your-feature-name
```

3. **Make your changes, then commit**
```bash
git add .
git commit -m "feat: add tax breakdown chart"
```

4. **Push your branch**
```bash
git push origin feat/your-feature-name
```

5. **Open a Merge Request** on code.swecha.org → target branch: `dev`

---

## ✅ Commit Message Format

Use this format for all commits:

```
type: short description
```

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `ui` | Frontend/styling changes |
| `data` | Dataset or parsing changes |
| `ai` | Chatbot or ML changes |
| `docs` | Documentation updates |
| `chore` | Config, setup, cleanup |

**Examples:**
```
feat: add sector breakdown pie chart
fix: correct tax calculation for new regime
ai: integrate Claude API for chatbot responses
```

---

## 👥 Member Responsibilities

| Member | Branch | Area |
|---|---|---|
| Member 1 | `feat/frontend-ui` | React UI, charts, map |
| Member 2 | `feat/backend-api` | APIs, DB, budget parsing |
| Member 3 | `feat/ai-chatbot` | Claude API, ML pipeline |

---

## 🚫 Do Not

- Push API keys or `.env` files to the repo
- Merge directly into `main` without testing
- Break the `/calculate` API endpoint — other members depend on it

---

## 🆘 Conflicts?

If you hit a merge conflict, ping the team on WhatsApp immediately. Don't force push.
