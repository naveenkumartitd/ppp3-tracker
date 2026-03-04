// ─── Local Ollama AI Client ───────────────────────────────────────────
const OLLAMA_URL = "http://localhost:11434";
const MODEL      = "llama3.1"; // Change to "phi3" or "mistral" if you used those

// System prompt — tells the AI who it is and what context it has
function buildSystemPrompt(trackerContext) {
  return `You are a helpful study assistant for a student learning C++ through the book 
"Programming: Principles and Practice Using C++" by Bjarne Stroustrup.

The student is on a 70-day challenge to complete the book before a Java placement exam.

Current status:
- Day: ${trackerContext.dayNum} of 70
- Current chapter: ${trackerContext.activeChapter || "Not set"}
- Streak: ${trackerContext.streak} days
- Chapters done: ${trackerContext.chaptersDone} of 21

Your job:
- Answer C++ questions clearly and concisely
- Help with exercises from PPP3
- Give motivation and study advice
- Keep answers SHORT for voice — 2 to 4 sentences max unless the user asks for more detail
- Always be encouraging

Do not use markdown formatting like ** or ## — speak in plain sentences.`;
}

// Send a message to the local AI and get a response
export async function askAI(userMessage, trackerContext = {}) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      messages: [
        { role: "system",    content: buildSystemPrompt(trackerContext) },
        { role: "user",      content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  return data.message?.content || "Sorry, I did not get a response.";
}

// Check if Ollama is reachable
export async function checkOllamaHealth() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

// List available models on this machine
export async function listModels() {
  try {
    const res  = await fetch(`${OLLAMA_URL}/api/tags`);
    const data = await res.json();
    return data.models?.map(m => m.name) || [];
  } catch {
    return [];
  }
}
