import { useState, useEffect, useRef, useCallback } from "react";
import { askAI, checkOllamaHealth } from "../../api/aiClient.js";

// ─── Speech helpers ──────────────────────────────────────────────────
// These use the browser's built-in Web Speech API — no extra packages needed

function useSpeechRecognition(onResult) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous   = false;
    r.interimResults = false;
    r.lang         = "en-IN"; // Change to "en-US" or "en-GB" if needed
    r.onresult     = (e) => { onResult(e.results[0][0].transcript); };
    r.onend        = () => setListening(false);
    r.onerror      = () => setListening(false);
    recognitionRef.current = r;
  }, [onResult]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setListening(true);
    recognitionRef.current.start();
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setListening(false);
  }, []);

  return { listening, start, stop, supported: !!recognitionRef.current };
}

function speak(text, onEnd) {
  window.speechSynthesis.cancel(); // stop any current speech
  const utterance   = new SpeechSynthesisUtterance(text);
  utterance.lang    = "en-IN";     // Change if needed
  utterance.rate    = 0.92;        // Slightly slower = clearer
  utterance.pitch   = 1.0;
  utterance.volume  = 1.0;
  if (onEnd) utterance.onend = onEnd;

  // Pick a natural-sounding voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium")
  );
  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.speak(utterance);
}

// ─── Main component ──────────────────────────────────────────────────

export default function AIAssistant({ trackerContext = {} }) {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your C++ study assistant. Ask me anything about PPP3, or say 'how am I doing' for a progress update." }
  ]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [online,   setOnline]   = useState(null); // null = checking
  const [model]                 = useState("llama3.1");
  const bottomRef = useRef(null);

  // Check if Ollama is running on mount
  useEffect(() => {
    checkOllamaHealth().then(setOnline);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async (text) => {
    const message = (text || input).trim();
    if (!message || loading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", text: message }]);
    setLoading(true);

    try {
      const reply = await askAI(message, trackerContext);
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
      setSpeaking(true);
      speak(reply, () => setSpeaking(false));
    } catch (err) {
      const errMsg = "Could not reach the AI. Make sure Ollama is running on port 11434.";
      setMessages(prev => [...prev, { role: "assistant", text: errMsg, error: true }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, trackerContext]);

  const onVoiceResult = useCallback((transcript) => {
    handleSend(transcript);
  }, [handleSend]);

  const { listening, start, stop, supported: micSupported } = useSpeechRecognition(onVoiceResult);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // Quick prompt buttons
  const QUICK = [
    "How am I doing today?",
    "What should I study next?",
    "Explain pointers in C++",
    "Give me motivation",
    "What is a vector in C++?",
    "How do I handle errors in C++?",
  ];

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(o => !o)} style={{
        position: "fixed", bottom: 90, right: 20, width: 52, height: 52,
        borderRadius: "50%", border: "none", cursor: "pointer", zIndex: 300,
        background: open ? "var(--card2)" : "linear-gradient(135deg,var(--gold),var(--gold2))",
        color: open ? "var(--muted)" : "#000",
        fontSize: 22, boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {open ? "✕" : "🤖"}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 155, right: 20,
          width: 360, maxHeight: 520,
          background: "var(--surface)", border: "1px solid var(--border2)",
          borderRadius: 12, display: "flex", flexDirection: "column",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)", zIndex: 299,
          fontFamily: "var(--font)",
        }}>
          {/* Header */}
          <div style={{
            padding: "12px 16px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ fontSize: 20 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>C++ Study Assistant</div>
              <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)" }}>
                {online === null ? "connecting…" : online ? `● ${model} · local` : "⚠ Ollama offline"}
              </div>
            </div>
            {speaking && (
              <button onClick={stopSpeaking} style={{
                background: "var(--red-gl)", border: "1px solid rgba(239,68,68,0.2)",
                color: "var(--red)", borderRadius: 6, padding: "4px 8px",
                fontSize: 10, cursor: "pointer", fontFamily: "var(--font)",
              }}>
                ⏹ Stop
              </button>
            )}
          </div>

          {/* Ollama offline warning */}
          {online === false && (
            <div style={{ padding: "10px 14px", background: "var(--red-gl)", borderBottom: "1px solid var(--border)", fontSize: 11, color: "var(--red)" }}>
              Ollama is not running. Open a terminal and run:<br />
              <code style={{ fontFamily: "var(--mono)", background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: 3 }}>ollama serve</code>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                marginBottom: 10,
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "85%", padding: "9px 13px", borderRadius: 10,
                  fontSize: 13, lineHeight: 1.5,
                  background: m.role === "user"
                    ? "var(--gold-gl)" : m.error ? "var(--red-gl)" : "var(--card2)",
                  border: `1px solid ${m.role === "user" ? "rgba(232,160,32,0.2)" : m.error ? "rgba(239,68,68,0.15)" : "var(--border)"}`,
                  color: m.error ? "var(--red)" : "var(--text)",
                  borderBottomRightRadius: m.role === "user" ? 2 : 10,
                  borderBottomLeftRadius:  m.role === "user" ? 10 : 2,
                }}>
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: 5, padding: "8px 0" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "var(--gold)", opacity: 0.5,
                    animation: `bounce 1s ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div style={{ padding: "8px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 5, flexWrap: "wrap" }}>
            {QUICK.map(q => (
              <button key={q} onClick={() => handleSend(q)} disabled={loading} style={{
                fontSize: 10, padding: "3px 9px", borderRadius: 12,
                background: "var(--card2)", border: "1px solid var(--border)",
                color: "var(--muted)", cursor: "pointer", fontFamily: "var(--font)",
                transition: "all 0.15s",
              }}>
                {q}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask anything about C++…"
              disabled={loading || !online}
              style={{ flex: 1, fontSize: 13, padding: "8px 12px" }}
            />
            {micSupported && (
              <button
                onClick={listening ? stop : start}
                disabled={loading}
                title={listening ? "Stop listening" : "Speak"}
                style={{
                  width: 38, height: 38, borderRadius: 8,
                  background: listening ? "var(--red)" : "var(--card2)",
                  border: `1px solid ${listening ? "var(--red)" : "var(--border)"}`,
                  color: listening ? "#fff" : "var(--muted)",
                  cursor: "pointer", fontSize: 16, flexShrink: 0,
                  animation: listening ? "pulse 1s infinite" : "none",
                }}
              >
                🎤
              </button>
            )}
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim() || !online}
              style={{
                width: 38, height: 38, borderRadius: 8, border: "none",
                background: input.trim() && !loading && online ? "var(--gold)" : "var(--card2)",
                color: input.trim() ? "#000" : "var(--muted2)",
                cursor: "pointer", fontSize: 15, flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50%       { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
      `}</style>
    </>
  );
}
