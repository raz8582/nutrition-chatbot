export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  const parameters = req.body.queryResult?.parameters || {};
  console.log("Received parameters:", parameters);

  const ingredients = parameters.ingredient || [];
  const timeObj = parameters.time || { amount: 15, unit: "minutes" };
  const time = `${timeObj.amount || 15} ${timeObj.unit || "minutes"}`;

  if (!ingredients || ingredients.length === 0) {
    return res.status(200).json({ fulfillmentText: "Which ingredients do you have?" });
  }

  res.status(200).json({ fulfillmentText: `Received ingredients: ${ingredients.join(", ")} in ${time}` });
}
