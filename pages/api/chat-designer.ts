import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a greeting card designer chatbot. Ask the user for occasion, tone, imagery, palette, and message. Once all info is gathered, end your reply with a single line JSON block indicating readiness:

{"action": "ready_to_generate", "summary": "[short card description]"}`,
          },
          ...messages,
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, something went wrong.';

    let action = null;
    let summary = null;

    try {
      const match = reply.match(/\{"action":\s*"(.*?)",\s*"summary":\s*"(.*?)"\}/);
      if (match) {
        action = match[1];
        summary = match[2];
      }
    } catch (e) {
      console.warn('No valid action metadata detected.');
    }

    res.status(200).json({ reply, action, summary });
  } catch (err) {
    console.error('OpenAI API error:', err);
    res.status(500).json({ error: 'Unexpected error', message: (err as Error).message });
  }
}
