const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;

app.post("/webhook", async (req, res) => {
  const parameters = req.body.queryResult?.parameters || {};
  const ingredients = parameters.ingredient || [];
  const time = parameters.time || "15 minutes";

  const prompt = `I have these ingredients: ${ingredients.join(", ")}. I want to cook a meal in ${time}. Suggest a recipe with instructions.`;

  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await openaiResponse.json();
  const reply = data.choices[0].message.content;

  res.json({ fulfillmentText: reply });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
