// api/webhook.js
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  try {
    const queryResult = req.body.queryResult || {};
    const queryText = queryResult.queryText || "";

    // --- Extract parameters from Dialogflow ---
    let ingredients = queryResult.parameters?.ingredient || [];
    let time = queryResult.parameters?.time || "";

    // Normalize ingredients
    if (!Array.isArray(ingredients)) {
      ingredients = ingredients ? [ingredients] : [];
    }

    // Fallback if Dialogflow misses ingredients
    if (!ingredients.length) {
      const words = queryText.split(/\s+/);
      ingredients = words.filter(w => w.length > 2); // crude fallback
    }

    // Fallback if Dialogflow misses cooking time
    if (!time) {
      const match = queryText.match(/(\d+)\s*(min|mins|minutes|hour|hours)/i);
      if (match) {
        time = `${match[1]} ${match[2]}`;
      } else {
        time = "any reasonable time";
      }
    }

    // --- Build ChatGPT messages ---
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful cooking assistant. Always return a recipe name, short ingredient list, and concise instructions."
      },
      {
        role: "user",
        content: `Suggest a meal using these ingredients: ${ingredients.join(
          ", "
        )}. It should take about ${time} to prepare.`
      }
    ];

    // --- Call OpenAI Chat Completions ---
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // switch to gpt-4o-mini if available
        messages,
        max_tokens: 250,
        temperature: 0.7
      })
    });

    const openaiData = await openaiRes.json();
    const mealSuggestion =
      openaiData.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I could not generate a meal.";

    return res.status(200).json({ fulfillmentText: mealSuggestion });
  } catch (err) {
    console.error("Webhook error:", err);
    return res
      .status(500)
      .json({ fulfillmentText: "Server error occurred." });
  }
}
