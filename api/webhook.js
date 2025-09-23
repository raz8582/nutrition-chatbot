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

  // Normalize allergies input
  if (typeof allergies === "string") {
    allergies = allergies.trim().toLowerCase();
    if (allergies === "" || allergies === "no" || allergies === "none") {
      allergies = "none";
    }
  }

  console.log("Parameters received:", { diet, meals, calories, allergies });

  // Simple rule-based meal templates
  const mealTemplates = {
    vegan: [
      "Breakfast: Oatmeal with fruits",
      "Lunch: Quinoa salad with vegetables",
      "Dinner: Lentil soup with whole-grain bread",
      "Snack: Mixed nuts and fruit"
    ],
    vegetarian: [
      "Breakfast: Yogurt with berries",
      "Lunch: Vegetable stir-fry with rice",
      "Dinner: Paneer curry with chapati",
      "Snack: Fruit smoothie"
    ],
    keto: [
      "Breakfast: Scrambled eggs with avocado",
      "Lunch: Grilled chicken salad with olive oil",
      "Dinner: Baked salmon with broccoli",
      "Snack: Cheese and almonds"
    ],
    general: [
      "Breakfast: Eggs and toast",
      "Lunch: Chicken sandwich with salad",
      "Dinner: Beef stir-fry with rice",
      "Snack: Yogurt with fruit"
    ]
  };

  // Select meal template based on diet
  const selectedMeals = mealTemplates[diet.toLowerCase()] || mealTemplates.general;

  // Limit meals according to user input
  const mealPlan = selectedMeals.slice(0, meals);

  // Remove any meals containing allergens (simple check)
  const filteredMealPlan = mealPlan.filter(meal => {
    if (allergies === "none") return true;
    return !meal.toLowerCase().includes(allergies);
  });

  // Return messages to Dialogflow Messenger
  const messages = [
    { text: { text: ["Here’s your personalized meal plan:"] } },
    { text: { text: [`✅ Summary:\nDiet: ${diet}\nMeals: ${meals}\nCalories: ${calories}\nAllergies: ${allergies}`] } },
    { text: { text: filteredMealPlan.join("\n") } }
  ];

  return res.json({
    fulfillmentMessages: messages,
    source: "nutrition-bot-webhook"
  });
}
