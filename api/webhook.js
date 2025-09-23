// index.js

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

// POST endpoint for Dialogflow webhook
app.post('/webhook', (req, res) => {
    const parameters = req.body.queryResult.parameters;

    // Collect parameters from Dialogflow
    const diet = parameters.diet || "not specified";
    const meals = parameters.meals || "not specified";
    const calories = parameters.calories || "not specified";
    let allergies = parameters.allergies || "none";

    // Handle "no" or "none" input for allergies
    if (typeof allergies === "string") {
        if (allergies.trim().toLowerCase() === "no" || allergies.trim().toLowerCase() === "none") {
            allergies = "none";
        }
    }

    // Build response messages
    const messages = [
        { 
            text: { text: ["Perfect! I’ll generate your personalized meal plan now…"] } 
        },
        { 
            text: { text: [`✅ Here’s a summary of your plan:\nDiet: ${diet}\nMeals per day: ${meals}\nCalories: ${calories}\nAllergies: ${allergies}`] } 
        },
        { 
            payload: { 
                richContent: [[
                    {
                        type: "button",
                        icon: { type: "chevron_right", color: "#FF9800" },
                        text: "Download Meal Plan PDF",
                        link: "https://yourserver.com/generated_meal_plan.pdf",
                        event: { name: "", languageCode: "", parameters: {} }
                    }
                ]]
            } 
        }
    ];

    // Send response back to Dialogflow
    return res.json({
        fulfillmentMessages: messages,
        source: "nutrition-bot-webhook"
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook server running on port ${PORT}`);
});
