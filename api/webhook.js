import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  try {
    const body = req.body;
    const parameters = body.queryResult?.parameters || {};

    // --- Extract ingredients ---
    let ingredients = [];
    if (parameters.ingredient) {
      // Dialogflow list or string
      if (Array.isArray(parameters.ingredient)) {
        ingredients = parameters.ingredient;
      } else if (typeof parameters.ingredient === "string") {
        ingredients = parameters.ingredient.split(/,|and/).map(i => i.trim());
      }
    }

    // Fallback if empty
    if (!ingredients || ingredients.length === 0) {
      return res.status(200).json({ fulfillmentText: "Which ingredients do you have?" });
    }

    // --- Extract time ---
    let timeObj = parameters.time || {};
    let timeText = "15 minutes"; // default
    if (timeObj.amount && timeObj.unit) {
      timeText = `${timeObj.amount} ${timeObj.unit}`;
    }

    // --- Generate meal using OpenAI ---
    const prompt = `You are a cooking assistant. Suggest a quick meal that can be prepared in ${timeText} using these ingredients: ${ingredients.join(", ")}. Provide only the meal name and short instructions.`;

    const openaiRes = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 150
      })
    });

    const openaiData = await openaiRes.json();
    const mealSuggestion = openaiData.choices?.[0]?.text?.trim() || "Sorry, I could not generate a meal.";

    // --- Respond to Dialogflow ---
    return res.status(200).json({ fulfillmentText: mealSuggestion });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ fulfillmentText: "Server error occurred." });
  }
}
