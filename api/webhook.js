import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  try {
    const parameters = req.body.queryResult?.parameters || {};
    const ingredients = parameters.ingredient || [];
    const time = parameters.time || "15 minutes";

    const prompt = `I have these ingredients: ${ingredients.join(", ")}. I want to cook a meal in ${time}. Suggest a quick recipe with instructions.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.status(200).json({ fulfillmentText: reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ fulfillmentText: "Error generating meal." });
  }
}
