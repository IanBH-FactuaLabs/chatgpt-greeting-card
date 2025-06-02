import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
          content: `You are a greeting card designer. Ask the user one question at a time to gather card details (occasion, tone, imagery, color palette, front and inside messages). Once ready, generate and return a base64 image inside a Markdown tag (e.g., ![card](data:image/png;base64,...)) and accompany it with a short message.`,
        },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 1500,
    })
  });

  const data = await openaiResponse.json();
  console.log(JSON.stringify(data, null, 2));
  const reply = data.choices?.[0]?.message?.content || 'Sorry, something went wrong.';

  // Look for a base64-encoded image embedded in a markdown-style image tag
  const imageMatch = reply.match(/!\[.*?\]\((data:image\/(png|jpeg);base64,[^)]+)\)/);

  res.status(200).json({
    reply,
    imageUrl: imageMatch ? imageMatch[1] : null,
  });
}
