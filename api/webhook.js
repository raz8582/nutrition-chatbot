export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  // Simply return a test message
  res.status(200).json({ fulfillmentText: "Webhook is working!" });
}
