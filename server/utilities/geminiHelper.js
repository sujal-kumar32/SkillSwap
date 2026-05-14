const { GoogleGenAI } = require("@google/genai");

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "missing" });

const MODEL = "gemini-1.5-flash";

const MAX_RETRIES = 2;

const SYSTEM_PROMPTS = {
  title: `You are a professional session title generator for SkillSwap, a peer-to-peer skill sharing platform.
Generate ONE concise, professional, and engaging session title (max 12 words).
Respond with ONLY the title text, no quotes, no labels, no explanation.`,

  outcomes: `You are a learning designer for SkillSwap.
Generate 4-6 clear learning outcomes as bullet points using "•".
Each outcome should start with an action verb (e.g., Build, Design, Analyze, Implement).
Respond with ONLY the bullet points, one per line.`,

  description: `You are a professional session description writer for SkillSwap.
Generate a detailed session description with these sections:
- Overview (2-3 sentences)
- Learning Outcomes (3-5 bullet points using "•")
- Requirements (2-3 bullet points using "•")
Keep it practical, actionable, and mentor-focused.
Respond in plain text only.`,

  tags: `You are a skill tagging expert for SkillSwap.
Generate 5-8 relevant tags/keywords for the given skill or session.
Tags should be single words or short phrases, sorted by relevance.
Respond with ONLY the tags separated by commas.`,

  roadmap: `You are a learning path advisor for SkillSwap.
Generate a structured learning roadmap for the given skill and current level.
Structure it as:
Phase 1: Foundation (Beginner)
- Step 1: ...
- Step 2: ...
Phase 2: Core Skills (Intermediate)
- Step 1: ...
- Step 2: ...
Phase 3: Advanced (Advanced)
- Step 1: ...
- Step 2: ...
Recommended Resources: ...
Estimated Time: ...
End each step with "•" followed by a key milestone.
Keep it practical and achievable.`,

  mentor: `You are a mentor coach for SkillSwap.
Provide constructive feedback to improve the mentor's session content.
Analyze the provided title and description and suggest:
1. Title improvements (if needed)
2. Description enhancements
3. Teaching tips for this topic
4. Engagement strategies
Be specific, actionable, and encouraging.
Keep response under 200 words.`,

  chat: `You are SkillSwap AI Assistant, a helpful guide for a peer-to-peer skill sharing platform.
Answer questions about:
- Learning paths and roadmaps
- Skill recommendations
- Mentorship advice
- Career guidance
- Study tips
Be concise (max 150 words), friendly, and practical.
If you don't know something, suggest asking a mentor on SkillSwap.`,
};

function validatePrompt(prompt, maxLength = 1000) {
  if (!prompt || typeof prompt !== "string") {
    throw Object.assign(
      new Error("Prompt is required and must be a string"),
      { statusCode: 400, expose: true }
    );
  }
  const trimmed = prompt.trim();
  if (trimmed.length < 3) {
    throw Object.assign(
      new Error("Prompt must be at least 3 characters"),
      { statusCode: 400, expose: true }
    );
  }
  if (trimmed.length > maxLength) {
    throw Object.assign(
      new Error(`Prompt must be under ${maxLength} characters`),
      { statusCode: 400, expose: true }
    );
  }
  return trimmed;
}

function buildPrompt(systemKey, userMessage) {
  return `${SYSTEM_PROMPTS[systemKey] || SYSTEM_PROMPTS.chat}

User input: ${userMessage}

Response:`;
}

function extractText(response) {
  if (!response) return "";
  if (response.text) return response.text;
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || "";
}

function cleanResponse(text) {
  if (!text) return "";
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:text|markdown)?\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");
  cleaned = cleaned.replace(/^"|"$/g, "");
  return cleaned.trim();
}

function classifyError(raw, statusCode) {
  const msg = raw.toLowerCase();
  if (msg.includes("api_key") || msg.includes("api key") || msg.includes("api-key") || (msg.includes("not found") && msg.includes("key"))) {
    return { message: "AI service is not configured. Add GEMINI_API_KEY to your .env file.", code: 503 };
  }
  if (msg.includes("safety") || msg.includes("safety_settings") || msg.includes("blocked") || msg.includes("finish_reason") && msg.includes("safety")) {
    return { message: "Content filtered by AI safety guidelines. Please rephrase.", code: 400 };
  }
  if (statusCode === 429 || msg.includes("quota") || msg.includes("rate_limit") || msg.includes("resource_exhausted") || msg.includes("too many requests")) {
    return { message: "AI service is currently overloaded. Please try again.", code: 429 };
  }
  if (statusCode === 503 || msg.includes("unavailable") || msg.includes("overloaded") || msg.includes("down")) {
    return { message: "AI service is temporarily unavailable. Please try again.", code: 503 };
  }
  if (statusCode === 400 || statusCode === 403 || statusCode === 404) {
    return { message: "AI request was rejected. Check your input and API key.", code: statusCode };
  }
  return null;
}

function parseGeminiError(raw) {
  try {
    const parsed = JSON.parse(raw);
    const inner = parsed.error || parsed;
    const code = inner.code || 500;
    let message = inner.message || inner.status || "Unknown error";
    message = message.split("\n")[0].trim();
    if (message.length > 200) message = message.slice(0, 200) + "...";
    const classified = classifyError(message, code);
    if (classified) return classified;
    return { message, code: code >= 500 ? 503 : code };
  } catch {
    return null;
  }
}

function shorten(msg, max = 150) {
  const cleaned = msg.split("\n")[0]?.trim() || msg;
  return cleaned.length > max ? cleaned.slice(0, max) + "..." : cleaned;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateContent(systemKey, userMessage, options = {}) {
  const { maxLength = 1000, temperature = 0.7 } = options;
  const validated = validatePrompt(userMessage, maxLength);
  const prompt = buildPrompt(systemKey, validated);

  if (!API_KEY) {
    throw Object.assign(
      new Error("AI service is not configured. Add GEMINI_API_KEY to your .env file."),
      { statusCode: 503, expose: true }
    );
  }

  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const wait = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`AI retry ${attempt}/${MAX_RETRIES} for "${systemKey}" after ${wait}ms`);
      await delay(wait);
    }

    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: { temperature, maxOutputTokens: 1024 },
      });

      const rawText = extractText(response);
      const text = cleanResponse(rawText);

      if (!text) {
        console.log("AI empty response:", JSON.stringify(response, null, 2));
        throw Object.assign(
          new Error("AI returned empty response"),
          { statusCode: 500, expose: true }
        );
      }

      return text;
    } catch (error) {
      lastError = error;

      if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
        if (attempt < MAX_RETRIES) {
          console.log(`AI non-retryable error on attempt ${attempt + 1}: ${shorten(error.message)}`);
        }
        throw error;
      }
    }
  }

  const classified = classifyError(lastError.message || "", lastError.statusCode || 500);
  if (classified) {
    throw Object.assign(
      new Error(classified.message),
      { statusCode: classified.code, expose: true }
    );
  }

  const parsed = parseGeminiError(lastError.message || "");
  if (parsed) {
    throw Object.assign(
      new Error(parsed.message),
      { statusCode: parsed.code, expose: true }
    );
  }

  throw Object.assign(
    new Error(`AI generation failed: ${shorten(lastError.message || "Unknown error")}`),
    { statusCode: 500, expose: true }
  );
}

module.exports = {
  generateTitle: (prompt) => generateContent("title", prompt, { temperature: 0.8 }),
  generateDescription: (prompt) => generateContent("description", prompt, { temperature: 0.7 }),
  generateOutcomes: (prompt) => generateContent("outcomes", prompt, { temperature: 0.6 }),
  generateTags: (prompt) => generateContent("tags", prompt, { temperature: 0.5 }),
  generateRoadmap: (prompt) => generateContent("roadmap", prompt, { temperature: 0.7 }),
  mentorAssistant: (prompt) => generateContent("mentor", prompt, { maxLength: 2000, temperature: 0.7 }),
  chatAssistant: (prompt) => generateContent("chat", prompt, { temperature: 0.8 }),
};
