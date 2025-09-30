import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    // 🔹 Test OpenAI call
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say hello from Vercel webhook!" }],
      max_tokens: 20,
    });

    const reply = completion.choices[0].message.content;

    return res.status(200).json({
      success: true,
      openaiReply: reply,
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
