import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Simple test: fetch all tables from public schema
    const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public';`;
    res.status(200).json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}


// export default function handler(req: any, res: any) {
//   res.status(200).json({ message: "API is working" });
// }