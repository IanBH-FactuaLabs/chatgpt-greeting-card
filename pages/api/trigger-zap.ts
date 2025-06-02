// pages/api/trigger-zap.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { summary, revision, image } = req.body;

  try {
    const zapierRes = await fetch('https://hooks.zapier.com/hooks/catch/18620594/2vsp223/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary,
        revision: revision || undefined,
        image: image || undefined,
      }),
    });

    const resultText = await zapierRes.text();

    if (!zapierRes.ok) {
      console.error('Zapier response failed:', resultText);
      return res.status(500).json({ ok: false, error: resultText });
    }

    return res.status(200).json({ ok: true, result: resultText });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ ok: false, error: (err as Error).message });
  }
}
