const express = require('express');
const router = express.Router();
const axios = require('axios');

const SYSTEM_PROMPT = `You are a helpful civic budget assistant for Indian citizens called "Budget AI". 

Your role:
- Answer questions about Indian government spending, budget allocations, and public projects clearly and honestly
- Use ONLY the budget context provided in the user's message
- Keep answers to 2-3 sentences maximum — concise and to the point
- Respond in the SAME language the user writes in (Hindi, Telugu, or English)
- If asked about a user's personal tax breakdown, refer to the taxContext provided
- If you don't know something, say so clearly — do not make up budget figures
- Do not discuss politics, parties, or make judgments about government performance
- For scheme names in other languages (like জল জীবন মিশন), explain what they are

Budget context (Union Budget 2024-25, approximate allocations):
- Infrastructure: 20% — Roads, highways, railways, metro projects
- Defence: 13% — Armed forces, border security
- Social Welfare: 15% — PM Kisan, MGNREGA, food subsidies
- Administration: 22% — Salaries, judiciary, debt interest
- Rural Development: 10% — Jal Jeevan Mission, PMGSY, rural sanitation
- Healthcare: 5.5% — Ayushman Bharat, AIIMS, govt hospitals
- Education: 4.5% — Schools, IITs, IIMs, scholarships
- Others: 10% — Space (ISRO), environment, sports, culture

Key schemes:
- Jal Jeevan Mission (जल जीवन मिशन / జల్ జీవన్ మిషన్): Provides piped water to every rural household by 2024
- PM Kisan: ₹6,000/year direct income support to farmers
- Ayushman Bharat: Health insurance up to ₹5 lakh per family for low-income households
- MGNREGA: 100 days guaranteed rural employment scheme
- PMGSY: All-weather road connectivity to villages`;

router.post('/', async (req, res) => {
  const { question, taxContext } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'question is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.json({ answer: 'The AI chatbot requires a Gemini API key to function.' });
  }

  let userContent = `User question: ${question.trim()}`;
  if (taxContext) {
    userContent += `\n\nUser's tax context: Income ₹${taxContext.income?.toLocaleString('en-IN')}, Total tax paid: ₹${taxContext.tax?.toLocaleString('en-IN')}, Regime: ${taxContext.regime}`;
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userContent }]
          }
        ]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const answer = response.data.candidates[0].content.parts[0].text;
    res.json({ answer });
  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message);
    res.status(503).json({ error: err.message, answer: err.response?.data?.error?.message || 'Sorry, I\'m having trouble connecting right now.' });
  }
});

module.exports = router;