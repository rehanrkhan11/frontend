// src/pages/patient/Chatbot.jsx
// ─────────────────────────────────────────────────────────────
// AI Medical Chatbot — connected to Anthropic claude-haiku SLM
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import PatientLayout from "../../components/layout/PatientLayout";
import { useAuth } from "../../context/AuthContext";
import { Send, Bot, User, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import api from "../../services/api";

const SUGGESTED_QUESTIONS = [
  "I have a headache and mild fever, what should I do?",
  "What are common symptoms of dehydration?",
  "How do I manage a cold at home?",
  "What does high blood pressure feel like?",
  "When should I visit a doctor for back pain?",
];

function ChatBubble({ msg }) {
  const isBot = msg.sender === "bot";
  return (
    <div className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
          ${isBot ? "bg-teal-100" : "bg-slate-200"}`}
      >
        {isBot ? (
          <Bot size={16} className="text-teal-600" />
        ) : (
          <User size={16} className="text-slate-600" />
        )}
      </div>

      <div className={`max-w-[75%]`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
            ${isBot
              ? "bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm"
              : "bg-teal-600 text-white rounded-tr-none"
            }`}
        >
          {msg.text}
        </div>
        {msg.error && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertTriangle size={11} /> Failed to send
          </p>
        )}
        <p className={`text-xs text-slate-400 mt-1 ${isBot ? "text-left" : "text-right"}`}>
          {format(new Date(msg.timestamp), "h:mm a")}
        </p>
      </div>
    </div>
  );
}

export default function Chatbot() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: `Hi ${firstName}! 👋 I'm MediBot, your AI health assistant.\n\nI can help you understand symptoms, learn about medicines, and know when to see a doctor. Ask me anything health-related!\n\n⚠️ I'm not a substitute for professional medical advice.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || typing) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: userText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Build history for context (only user/bot turns, last 10)
    const history = messages
      .filter((m) => !m.error)
      .slice(-10)
      .map((m) => ({
        role: m.sender === "bot" ? "bot" : "user",
        content: m.text,
      }));

    try {
      const { data } = await api.post("/chatbot/message", {
        message: userText,
        history,
      });

      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: data.reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setTyping(false);
      const errText =
        err.response?.data?.error ||
        "Sorry, I couldn't reach the AI service. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: errText,
          timestamp: new Date().toISOString(),
          error: true,
        },
      ]);
    }

    inputRef.current?.focus();
  };

  const handleClear = () => {
    setMessages([
      {
        id: Date.now(),
        sender: "bot",
        text: "Chat cleared! How can I help you today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <PatientLayout>
      <div className="flex flex-col h-[calc(100vh-7rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <Bot size={20} className="text-teal-600" />
            </div>
            <div>
              <h2 className="page-title leading-none">MediBot — AI Health Assistant</h2>
              <p className="text-muted text-xs mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 mb-px" />
                Powered by AI · Not a medical professional
              </p>
            </div>
          </div>
          <button onClick={handleClear} className="btn-outline py-2 px-3 text-xs gap-1.5">
            <RefreshCw size={13} /> Clear
          </button>
        </div>

        {/* Chat window */}
        <div className="flex-1 card overflow-hidden flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} msg={msg} />
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-teal-600" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions — shown only at the start */}
          {messages.length < 3 && (
            <div className="px-5 pb-3 border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500 mb-2 font-medium">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    disabled={typing}
                    className="text-xs px-3 py-1.5 rounded-full border border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="p-4 border-t border-slate-100 flex gap-3">
            <input
              ref={inputRef}
              className="input flex-1"
              placeholder="Ask a health question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={typing}
              maxLength={1000}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              className="btn-primary px-4 py-2.5 disabled:opacity-40"
            >
              {typing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
