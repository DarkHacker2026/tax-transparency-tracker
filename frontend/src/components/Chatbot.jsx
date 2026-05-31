import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

const SUGGESTED_QUESTIONS = [
  'Where did my ₹42,000 go?',
  'How much was spent on education in Telangana?',
  'What is Jal Jeevan Mission?',
  'Is the Hyderabad Metro Phase 2 on track?',
  'జల్ జీవన్ మిషన్ అంటే ఏమిటి?',
];

export default function Chatbot({ taxResult }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'नमस्ते! 👋 I\'m your civic budget assistant. Ask me anything about government spending in Hindi, Telugu, or English.',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);

    try {
      const res = await axios.post('https://tax-transparency-tracker.onrender.com/api/chat', {
        question: q,
        taxContext: taxResult,
      });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Sorry, I couldn\'t connect to the server right now. Please try again in a moment.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className={`chat-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Open AI Chatbot"
      >
        {open ? '✕' : '🤖'}
        {!open && <span className="fab-label">Ask AI</span>}
      </button>

      {open && (
        <div className="chatbot-window fade-up">
          <div className="chat-header">
            <div className="chat-header-title">
              <span className="chat-bot-icon">🤖</span>
              <div>
                <div className="chat-title">Budget AI Assistant</div>
                <div className="chat-subtitle">Hindi · Telugu · English</div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role}`}>
                {m.role === 'assistant' && <span className="bubble-icon">🤖</span>}
                <div className="bubble-text">{m.text}</div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble assistant">
                <span className="bubble-icon">🤖</span>
                <div className="bubble-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="suggestions">
                <div className="suggestions-label">Try asking:</div>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button key={i} className="suggestion-chip" onClick={() => sendMessage(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="chat-input-wrap">
            <input
              className="chat-input"
              placeholder="Ask about government spending..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              disabled={loading}
            />
            <button
              className="chat-send"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}