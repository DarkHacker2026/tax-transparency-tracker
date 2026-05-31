const express = require('express');
const router = express.Router();
const axios = require('axios');

const SYSTEM_PROMPT = `You are a helpful civic budget assistant for Indian citizens called "Budget AI". 
Answer questions about Indian government spending clearly and honestly.
Keep answers to 2-3 sentences. Respond in the SAME language the user writes in (Hindi, Telugu, or English).

Budget context (Union Budget 2024-25):
- Infrastructure: 20% — Roads, highways, railways, metro
- Defence: 13% — Armed forces, border security  
- Social Welfare: 15% — PM Kisan, MGNREGA, subsidies
- Administration: 22% — Salaries, judiciary, debt interest
- Rural Development: 10% — Jal Jeevan Mission, PMGSY
- Healthcare: 5.5% — Ayushman Bharat, AIIMS, hospitals
- Education: 4.5% — Schools, IITs, IIMs, scholarships
- Others: 10% — ISRO, environment, sports, culture

Key schemes:
- Jal Jeevan Mission: Piped water to every rural household
- PM Kisan: Rs 6,000/year direct support to farmers
- Ayushman Bharat: Health insurance up to Rs 5 lakh per family
- MGNREGA: 100 days guaranteed rural employment`;

// Free models to try in order — if one is rate limited, tries next
const MODELS = [
  'deepseek/deepseek-v4-flash:free',
  'google/gemma-4-31b-it:free',
  'google/gemma-3-27b-it:free',
  'google/gemma-3-12b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
];

async function callOpenRouter(messages, apiKey) {
  for (const model of MODELS) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          messages,
          max_tokens: 300,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://tax-transparency-tracker.vercel.app',
            'X-Title': 'Tax Transparency Tracker',
          },
          timeout: 15000,
        }
      );
      console.log(`[chat] Success with model: ${model}`);
      return response.data.choices[0].message.content;
    } catch (err) {
      const code = err.response?.data?.error?.code || err.response?.status;
      console.log(`[chat] Model ${model} failed with ${code}, trying next...`);
      if (code !== 429 && code !== 404 && code !== 400) throw err; // unexpected error
      // 429/404/400 → try next model
    }
  }
  throw new Error('All models exhausted');
}

router.post('/', async (req, res) => {
  const { question, taxContext } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'question is required' });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return res.json({ answer: 'OPENROUTER_API_KEY not set in environment variables.' });
  }

  let userContent = `User question: ${question.trim()}`;
  if (taxContext) {
    userContent += `\n\nUser tax context: Income Rs ${taxContext.income?.toLocaleString('en-IN')}, Tax paid: Rs ${taxContext.tax?.toLocaleString('en-IN')}, Regime: ${taxContext.regime}`;
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];

  try {
    const answer = await callOpenRouter(messages, process.env.OPENROUTER_API_KEY);
    res.json({ answer });
  } catch (err) {
    console.error('All OpenRouter models failed:', err.message);
    res.status(503).json({
      answer: 'AI is temporarily unavailable. Please try again in a moment.'
    });
  }
});

module.exports = router;