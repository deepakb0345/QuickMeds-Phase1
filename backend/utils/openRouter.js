const axios = require("axios");
const dotenv = require('dotenv');

// 1. Configure dotenv at the top
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * Helper: find and parse first JSON array in a string
 */
function extractFirstJsonArray(text) {
  if (!text || typeof text !== "string") return null;

  // 1) If text contains a fenced code block like ```json ... ``` extract contents
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch && fencedMatch[1]) {
    text = fencedMatch[1].trim();
  }

  // 2) Try to find the first '[' ... ']' pair and parse that substring
  const first = text.indexOf("[");
  const last = text.lastIndexOf("]");
  if (first !== -1 && last !== -1 && last > first) {
    let candidate = text.slice(first, last + 1);

    // Clean common artifacts: backticks, trailing commas before ], trailing commas in objects
    candidate = candidate.replace(/`/g, "")
                         .replace(/,\s*]/g, "]")
                         .replace(/,\s*}/g, "}");

    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // fallthrough to further attempts
    }
  }

  // 3) As a last resort, try to JSON.parse the whole trimmed text
  try {
    const whole = JSON.parse(text);
    if (Array.isArray(whole)) return whole;
    // maybe an object with array field
    if (whole && typeof whole === "object") {
      for (const k of Object.keys(whole)) {
        if (Array.isArray(whole[k])) return whole[k];
      }
    }
  } catch (e) {
    // can't parse whole text
  }

  return null;
}

/**
 * Sends a prescription image to LLaMA (or other model) via OpenRouter and returns
 * a JSON array of medicines in the format: [{ name, dosage }]
 * @param {string} imageUrl - URL of the prescription image
 * @param {string} promptText - Custom prompt instructing the model how to respond
 * @returns {Array} - Array of recognized medicines
 */
async function queryLLaMAWithImage(imageUrl, promptText) {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        // <-- make sure this model supports images; update MODEL if needed
        model: "google/gemma-3-4b-it:free",

        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptText },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 120000,
      }
    );

    // get the model's textual reply (shape may vary by provider/model)
    let reply = response?.data?.choices?.[0]?.message?.content ?? response?.data?.choices?.[0]?.message ?? response?.data;
    
    // if the provider already returned an array/object, handle it immediately
    if (Array.isArray(reply)) {
      return reply;
    }
    if (reply && typeof reply === "object") {
      // if object contains usable fields, try them
      if (Array.isArray(reply.content)) return reply.content;
      if (typeof reply.content === "string") reply = reply.content;
      else if (Array.isArray(reply.message)) return reply.message;
      else if (typeof reply.message === "string") reply = reply.message;
      else reply = JSON.stringify(reply);
    }

    // from here reply should be a string (maybe containing code fences)
    if (typeof reply !== "string") {
      console.error("Unexpected reply shape, cannot parse:", reply);
      return [];
    }

    // Try simple JSON.parse first (fast path)
    try {
      const parsed = JSON.parse(reply);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {
      // ignore, try robust extraction
    }

    // Robust: extract first JSON array even if wrapped in backticks or markdown
    const extracted = extractFirstJsonArray(reply);
    if (extracted) {
      return extracted;
    }

    // If we reach here, parsing failed — log the raw reply for debugging
    console.error("Failed to parse LLaMA response as JSON:", reply);
    return [];

  } catch (err) {
    console.error("LLaMA API error:", err.response?.data || err.message);
    return [];
  }
}

module.exports = { queryLLaMAWithImage };
