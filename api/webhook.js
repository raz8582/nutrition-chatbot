import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  try {
    const queryText = req.body.queryResult?.queryText || "";

    if (!queryText) {
      return res.status(200).json({ fulfillmentText: "Please tell me your ingredients and time." });
    }

    // --- Generate meal using OpenAI ---
    const prompt = `You are a cooking assistant. Suggest a quick meal based on this request: "${queryText}". 
    Provide only the meal name and short instructions in 2-3 sentences.`;

    const openaiRes = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt,
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const openaiData = await openaiRes.json();
    const mealSuggestion = openaiData.choices?.[0]?.text?.trim() || 
      `I couldn’t generate a recipe, but you can try combining: ${queryText}.`;

    return res.status(200).json({ fulfillmentText: mealSuggestion });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ fulfillmentText: "Server error occurred." });
  }
}
