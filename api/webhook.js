export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  try {
    const parameters = req.body.queryResult?.parameters || {};
    console.log("Received parameters:", parameters);

    let ingredients = parameters.ingredient || [];
    if (typeof ingredients === "string") {
      ingredients = [ingredients]; // convert single string to array
    }

    const timeObj = parameters.time || { amount: 15, unit: "minutes" };
    const time = `${timeObj.amount} ${timeObj.unit}`;

    // Temporary test response
    res.status(200).json({ fulfillmentText: `Received ingredients: ${ingredients.join(", ")} in ${time}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ fulfillmentText: "Server error occurred." });
  }
}
