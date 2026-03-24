// src/pages/patient/Chatbot.jsx
// ─────────────────────────────────────────────────────────────
// AI health assistant chat interface.
// TODO: Connect to a real AI backend (e.g., OpenAI API, Gemini,
//       or your own LLM endpoint) to replace the mock responses.
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import PatientLayout from "../../components/layout/PatientLayout";
import { useAuth } from "../../context/AuthContext";
import { Send, Bot, User, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";

// ── Mock bot responses (replace with real AI integration) ────
const MOCK_RESPONSES = [
  "I understand your concern. Based on what you've described, it would be best to consult with a doctor. Would you like to book an appointment?",
  "That sounds like it could be related to stress or fatigue. Make sure you're staying hydrated and getting enough rest.",
  "I'm an AI assistant and can't provide medical diagnoses. For accurate advice, please consult one of our verified doctors.",
  "Common remedies for mild symptoms include rest, hydration, and over-the-counter medication. However, if symptoms persist, please see a doctor.",
  "Have you had this symptom before? If it's recurring, keeping a symptom diary and sharing it with your doctor can be very helpful.",
];

const SUGGESTED_QUESTIONS = [
  "I have a headache, what should I do?",
  "How do I manage fever at home?",
  "What are symptoms of dehydration?",
  "How often should I get a health checkup?",
  "I've been feeling anxious lately, is that normal?",
];

function ChatBubble({ msg }) {
  const isBot = msg.sender === "bot";
  return (
    <div className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
        ${isBot ? "bg-teal-100" : "bg-slate-200"}`}>
        {isBot
          ? <Bot size={16} className="text-teal-600" />
          : <User size={16} className="text-slate-600" />
        }
      </div>
      {/* Bubble */}
      <div className={`max-w-[75%] ${isBot ? "" : ""}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isBot
            ? "bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm"
            : "bg-teal-600 text-white rounded-tr-none"
          }`}>
          {msg.text}
        </div>
        <p className={`text-xs text-slate-400 mt-1 ${isBot ? "text-left" : "text-right"}`}>
          {format(new Date(msg.timestamp), "h:mm a")}
        </p>
      </div>
    </div>
  );
}

export default function Chatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: `Hi ${user?.name?.split(" ")[0] || "there"}! 👋 I'm your AI health assistant. I can help answer general health questions, but please remember I'm not a substitute for professional medical advice. How can I help you today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input,    setInput]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: userText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // ── TODO: Replace this mock with a real API call ────────
    // Example:
    // const { data } = await api.post("/chatbot/message", { message: userText });
    // const botReply = data.reply;
    // ──────────────────────────────────────────────────────

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const botReply = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    setTyping(false);
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + 1, sender: "bot", text: botReply, timestamp: new Date().toISOString() },
    ]);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setMessages([{
      id: 1,
      sender: "bot",
      text: "Chat cleared! How can I help you today?",
      timestamp: new Date().toISOString(),
    }]);
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
              <h2 className="page-title leading-none">AI Health Assistant</h2>
              <p className="text-muted text-xs mt-0.5">
                {/* TODO: Show real online/offline status */}
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 mb-px" />
                Online · Not a medical professional
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
            {typing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-teal-600" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {messages.length < 3 && (
            <div className="px-5 pb-3 border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500 mb-2 font-medium">Suggested questions</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
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
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              className="btn-primary px-4 py-2.5 disabled:opacity-40"
            >
              {typing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
