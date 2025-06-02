// pages/api/trigger-zap.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { summary } = req.body;

  try {
    const zapierResponse = await fetch('https://hooks.zapier.com/hooks/catch/18620594/2vsp223/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary }),
    });

    const text = await zapierResponse.text();

    if (!zapierResponse.ok) {
      console.error('Zapier webhook failed:', zapierResponse.status, text);
      return res.status(500).json({ error: 'Zapier failed', text });
    }

    return res.status(200).json({ ok: true, zapierResponse: text });
  } catch (err) {
    console.error('Zapier server error:', err);
    return res.status(500).json({ error: 'Unexpected server error', message: (err as Error).message });
  }
}
