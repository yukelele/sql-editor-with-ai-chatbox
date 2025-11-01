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
        { role: "system", content: `
            You are an AI SQL assistant. Follow these rules strictly:

            1️⃣ You may only reference tables and columns in the provided database schema.
            2️⃣ All generated SQL queries must be valid for the given schema — do not hallucinate table or column names.
            3️⃣ Always include every column of a table when relevant (except auto-generated primary keys if inserting).
            4️⃣ Your response must have exactly two parts:
              - First part: a casual explanation of the SQL query in plain language.
              - Second part: the actual SQL statement, placed on a separate line and clearly marked as SQL.
            5️⃣ Format example:
              Response: "This query retrieves all users with their total sales."
              SQL: "SELECT id, name, total_sales FROM users;"
            6️⃣ Only provide SQL that can run on the database; do not include unrelated text in the SQL part.

            Database schema (tables and columns):
            ${JSON.stringify(schema, null, 2)}

            Always follow this structure when responding.
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
