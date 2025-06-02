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
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'system',
          content: `You are a greeting card designer who creates both the greeting message and a card image. Once you've gathered all the necessary information, respond with a message and a visual card design in the form of a base64-encoded image embedded in a Markdown image tag.`,
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
