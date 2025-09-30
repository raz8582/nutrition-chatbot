import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  try {
    const queryText = req.body.queryResult?.queryText?.toLowerCase() || "";

    // --- Extract time ---
    const timeMatch = queryText.match(/(\d+)\s*(min|mins|minutes)/i);
    const timeText = timeMatch ? `${timeMatch[1]} minutes` : "15 minutes";

    // --- Extract ingredients ---
    const possibleIngredients = [
      "chicken","beef","pasta","tomatoes","rice","broccoli",
      "cheese","potatoes","onion","garlic","carrot","bell pepper","fish"
    ];
    const ingredients = possibleIngredients.filter(item => queryText.includes(item));

    if (!ingredients.length) {
      return res.status(200).json({ fulfillmentText: "Which ingredients do you have?" });
    }

    // --- OpenAI Chat API ---
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // faster + cheaper
        messages: [
          {
            role: "system",
            content: "You are a cooking assistant. Respond with a quick meal idea and short instructions only.",
          },
          {
            role: "user",
            content: `Suggest a quick meal in ${timeText} using these ingredients: ${ingredients.join(", ")}.`,
          },
        ],
        max_tokens: 150,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI API Error:", data.error);
      return res.status(500).json({ fulfillmentText: "OpenAI error: " + data.error.message });
    }

    const mealSuggestion = data.choices?.[0]?.message?.content?.trim()
      || "Sorry, I could not generate a meal.";

    return res.status(200).json({ fulfillmentText: mealSuggestion });

  } catch (err) {
    console.error("Webhook Error:", err);
    return res.status(500).json({ fulfillmentText: "Server error occurred." });
  }
}
