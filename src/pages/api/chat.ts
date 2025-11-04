// pages/api/ai-chat.ts
import { getDbSchema } from "@/src/lib/schema";
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY not found in .env file");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: "Missing messages" });

  // Load schema dynamically
  const schema = await getDbSchema();

    // const prompt = `${messages}`;
    console.log('schema', schema);

    console.log(...messages);

  try {

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
    You are an AI SQL assistant. Follow these rules strictly:

    1️⃣ Only reference tables and columns exactly as they exist in the database.
    2️⃣ All SQL must use the snake_case column names in the database.
    3️⃣ All generated SQL queries must be valid and runnable on the given schema.
    4️⃣ Always include all relevant columns in SELECT/INSERT/UPDATE.
    5️⃣ Always provide two parts in the response:
      - First: a casual plain-language explanation of the query.
      - Second: the SQL statement, on a new line, wrapped in triple backticks with 'sql'.
    6️⃣ Do not hallucinate tables, columns, or relationships.
    7️⃣ If a JOIN is needed, use the correct foreign keys (e.g., customer_id, purchase_id, product_id).
    8️⃣ Only SQL relevant to the question should be output.

    Database schema:
    customer (id, name, email, created_at)
    product (id, name, category, price, stock)
    purchase (id, customer_id, purchase_date, status, total_amount)
    purchase_item (id, purchase_id, product_id, quantity, unit_price)
    review (id, product_id, customer_id, rating, comment, created_at)

    Always follow this structure.
          `
        },
        ...messages
      ],
    });

    res.status(200).json({ aiResponse: response.choices[0].message.content });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
