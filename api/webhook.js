import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST allowed" });

  try {
    const queryText = req.body.queryResult?.queryText || "";
    
    // --- Extract time (minutes) ---
    // Matches patterns like "15 min", "15 minutes", "in 15 mins"
    let timeMatch = queryText.match(/(\d+)\s*(min|mins|minutes)/i);
    let timeText = "15 minutes"; // default
    if (timeMatch) {
      timeText = `${timeMatch[1]} minutes`;
    }

    // --- Extract ingredients ---
    // Simple regex to match common ingredients (can expand list)
    const possibleIngredients = [
      "chicken", "beef", "pasta", "tomatoes", "rice", "broccoli",
      "cheese", "potatoes", "onion", "garlic", "carrot", "bell pepper"
    ];

    let ingredients = [];
    const lowerText = queryText.toLowerCase();
    possibleIngredients.forEach(item => {
      if (lowerText.includes(item)) ingredients.push(item);
    });

    if (!ingredients.length) return res.status(200).json({ fulfillmentText: "Which ingredients do you have?" });

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
        prompt,
        max_tokens: 150
      })
    });

    const openaiData = await openaiRes.json();
    const mealSuggestion = openaiData.choices?.[0]?.text?.trim() || "Sorry, could not generate a meal.";

    // --- Respond to Dialogflow ---
    return res.status(200).json({ fulfillmentText: mealSuggestion });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ fulfillmentText: "Server error occurred." });
  }
}
