// pages/api/receive-image.ts
import type { NextApiRequest, NextApiResponse } from 'next';

let latestImage: { url: string; summary: string } | null = null;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { imageUrl, summary } = req.body;
    if (!imageUrl || !summary) {
      return res.status(400).json({ error: 'Missing imageUrl or summary' });
    }

    latestImage = { url: imageUrl, summary };
    console.log('✅ Received image:', imageUrl);
    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    return res.status(200).json(latestImage || {});
  }

  res.status(405).end();
}
