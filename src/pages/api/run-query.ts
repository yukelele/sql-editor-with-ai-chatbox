import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

type Data = {
  result?: any;
  error?: string;
};

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "No query provided" });
  }

  try {
    // ⚡ Prisma $queryRawUnsafe is required for raw SQL
    const result = await prisma.$queryRawUnsafe(query);
    res.status(200).json({ result });
    console.log('Query ran successfully!');
  } catch (err: any) {
    res.status(400).json({ error: err.message });
    console.error('Query failed to run');

    // Extract detailed info if it's a Prisma error
    if (err.code && err.meta) {
      console.error('code: ', err.code);
      console.error('details: ', err.meta);
      console.error('message: ', err.message);
      return res.status(400).json({
        error: "Database error",
      });
    }

    // For generic SQL or syntax errors
    console.error('message: ', err.message);
    return res.status(400).json({
      error: "Query failed to run",
    });
  }
}
