// /pages/api/proxy.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { endpoint, ...query } = req.query;

  const url = `https://web-production-74f24.up.railway.app/api/${endpoint}?${new URLSearchParams(query as any)}`;
  const response = await fetch(url);
  const data = await response.json();

  res.status(200).json(data);
}
