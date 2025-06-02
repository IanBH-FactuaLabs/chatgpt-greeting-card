import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;

  const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a friendly AI that helps users design greeting cards. Ask one question at a time to gather details like occasion, relationship, tone, imagery, color palette, front message, and inside message. Once you have enough information, offer to generate a visual preview.',
        },
        ...messages,
      ],
    }),
  });

  const data = await chatResponse.json();
  const reply = data.choices?.[0]?.message?.content || 'Sorry, something went wrong.';
  res.status(200).json({ reply });
}
