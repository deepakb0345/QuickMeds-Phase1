const axios = require("axios");
const dotenv = require('dotenv');

// 1. Configure dotenv at the top
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * Sends a prescription image to LLaMA 4 via OpenRouter and returns
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
        model: "meta-llama/llama-4-maverick:free",
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
      }
    );

    const reply = response.data.choices[0].message.content;

    try {
      return JSON.parse(reply);
    } catch (err) {
      console.error("Failed to parse LLaMA response as JSON:", reply);
      return [];
    }

  } catch (err) {
    console.error("LLaMA API error:", err.response?.data || err.message);
    return [];
  }
}

module.exports = { queryLLaMAWithImage };