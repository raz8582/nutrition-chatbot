export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  try {
    const queryText = req.body.queryResult?.queryText?.toLowerCase() || "";

    // --- Extract time (default 15 mins if not provided) ---
    let timeText = "15 minutes"; 
    const timeMatch = queryText.match(/(\d+)\s*(min|mins|minutes|hour|hours)/i);

    if (timeMatch) {
      const amount = parseInt(timeMatch[1]);
      const unit = timeMatch[2].toLowerCase();

      if (unit.startsWith("hour")) {
        timeText = `${amount} hour${amount > 1 ? "s" : ""}`;
      } else {
        timeText = `${amount} minutes`;
      }
    } else if (/an hour/i.test(queryText)) {
      timeText = "1 hour";
    } else if (/half an hour/i.test(queryText)) {
      timeText = "30 minutes";
    }

    // --- Extract ingredients (whatever the user typed) ---
    // Remove time phrases so only food words remain
    const cleanedText = queryText.replace(/(\d+)\s*(min|mins|minutes|hour|hours)|an hour|half an hour/gi, "").trim();

    const words = cleanedText.split(/\s|,|and/).map(w => w.trim()).filter(Boolean);
    const ingredients = words.filter(w => w.length > 2); // basic filter, ignore "an", "in", etc.

    if (!ingredients.length) {
      return res.status(200).json({ fulfillmentText: "Which ingredients do you have?" });
    }

    // --- Generate meal using OpenAI ---
    const prompt = `You are a cooking assistant. Suggest a quick recipe that can be prepared in ${timeText} using these ingredients: ${ingredients.join(", ")}. 
Provide only the meal name and short instructions (2-4 sentences).`;

    const openaiRes = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt,
        max_tokens: 180,
        temperature: 0.7
      })
    });

    const openaiData = await openaiRes.json();
    const mealSuggestion = openaiData.choices?.[0]?.text?.trim() || "Sorry, I could not generate a meal.";

    return res.status(200).json({ fulfillmentText: mealSuggestion });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ fulfillmentText: "Server error occurred." });
  }
}
