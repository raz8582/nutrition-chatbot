export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  console.log("Webhook called", req.body);

  return res.json({
    fulfillmentText: "Webhook is working!"
  });
}
