export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  console.log("Webhook called", req.body);

  return res.json({
    fulfillmentText: "Webhook is working!"
  });
}
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  res.status(200).json({ fulfillmentText: "Webhook is working!" });
}
