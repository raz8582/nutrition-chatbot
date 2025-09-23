// index.js (Node.js webhook for Dialogflow)

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    const parameters = req.body.queryResult.parameters;

    // Get parameters from Dialogflow
    const diet = parameters.diet || "not specified";
    const meals = parameters.meals || "not specified";
    const calories = parameters.calories || "not specified";
    let allergies = parameters.allergies || "none";

    // Handle 'no' or 'none' input for allergies
    if (typeof allergies === "string") {
        if (allergies.trim().toLowerCase() === "no" || allergies.trim().toLowerCase() === "none") {
            allergies = "none";
        }
    }

    // Create response message
    let responseText = `✅ Here’s your personalized meal plan:\n`;
    responseText += `Diet: ${diet}\n`;
    responseText += `Meals per day: ${meals}\n`;
    responseText += `Calories: ${calories}\n`;
    responseText += `Allergies: ${allergies}\n\n`;
    responseText += `Your meal plan PDF will be generated shortly!`;

    // Respond to Dialogflow
    return res.json({
        fulfillmentText: responseText,
        source: "nutrition-bot-webhook"
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook server running on port ${PORT}`);
});
