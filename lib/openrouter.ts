import OpenAI from "openai";

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("Missing OPENROUTER_API_KEY environment variable");
}

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "X-Title": "SocialMoon Agency Bot",
  },
});

export const MODELS = {
  fast: "google/gemini-2.0-flash-001",      // cheap — extraction, classification
  standard: "anthropic/claude-sonnet-4-5",  // content, chat
  advanced: "anthropic/claude-opus-4",      // complex reasoning
} as const;
