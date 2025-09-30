// api/webhook.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  try {
    const queryText = req.body.queryResult?.queryText || "";

    // --- Extract time ---
    const timeMatch = queryText.match(/(\d+)\s*(min|mins|minutes|hour|hours)/i);
    const timeText = timeMatch ? `${timeMatch[1]} ${timeMatch[2]}` : "20 minutes";

    // --- Extract ingredients ---
    // Use user’s text directly instead of filtering
    const ingredients = queryText
      .replace(/\d+\s*(min|mins|minutes|hour|hours)/gi, "")
      .replace(/^(i have|prepare|make|cook|using|with)\s*/i, "")
      .trim();

    if (!ingredients) {
      return res.status(200).json({ fulfillmentText: "Which ingredients do you have?" });
    }

    // --- Prompt for OpenAI ---
    const prompt = `Suggest a meal that can be prepared in ${timeText} using these ingredients: ${ingredients}.
Give the meal name and very short instructions (2–3 sentences).`;

    // --- Call OpenAI Chat API ---
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful cooking assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const openaiData = await openaiRes.json();
    console.log("OpenAI response:", JSON.stringify(openaiData, null, 2));

    const mealSuggestion =
      openaiData.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I could not generate a meal.";

    return res.status(200).json({ fulfillmentText: mealSuggestion });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ fulfillmentText: "Server error occurred." });
  }
}
