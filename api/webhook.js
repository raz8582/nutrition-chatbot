import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Set your OpenAI API key in Vercel
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const body = req.body;
  const parameters = body.queryResult?.parameters || {};

  const diet = parameters.diet || "general";
  const meals = parameters.meals || 3;
  const calories = parameters.calories || 2000;
  let allergies = parameters.allergies || "none";

  if (typeof allergies === "string") {
    if (allergies.trim().toLowerCase() === "no" || allergies.trim().toLowerCase() === "none") {
      allergies = "none";
    }
  }

  // Create prompt for AI
  const prompt = `Create a ${diet} meal plan for a person who wants ${meals} meals per day,
with a total of ${calories} calories, avoiding the following allergies: ${allergies}.
Provide the plan in a clear format with meal names and ingredients.`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const mealPlan = completion.data.choices[0].message.content;

    // Build response messages for Dialogflow Messenger
    const messages = [
      { text: { text: ["Perfect! I’ll generate your personalized AI meal plan now…"] } },
      { text: { text: [`✅ Summary:\nDiet: ${diet}\nMeals: ${meals}\nCalories: ${calories}\nAllergies: ${allergies}`] } },
      { text: { text: [`🍽 Your AI Meal Plan:\n${mealPlan}`] } }
    ];

    return res.json({
      fulfillmentMessages: messages,
      source: "nutrition-bot-webhook"
    });

  } catch (error) {
    console.error("OpenAI API error:", error);
    return res.json({
      fulfillmentText: "Sorry, I couldn’t generate your meal plan at the moment. Please try again."
    });
  }
}
