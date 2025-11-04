// pages/api/sql-autocomplete.ts
import { getDbSchema } from "@/src/lib/schema";
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY not found in .env file");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

interface AutocompleteRequest {
  text: string; // current text in the editor
  schema: Record<string, string[]>; // optional, fallback if you want
}

interface AutocompleteResponse {
  suggestions: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AutocompleteResponse | { error: string }>
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { text } = req.body as AutocompleteRequest;
  if (!text) return res.status(400).json({ error: "Missing text input" });

  try {
    // Load schema dynamically
    const schema = await getDbSchema();
    console.log('SCHEMA', schema);

    // Prompt for OpenAI: provide the current editor text and schema
        // Prompt for SQL Query Generation
        const prompt = `
        You are an AI SQL assistant. Follow these rules strictly:

        1️⃣ Reference tables and columns exactly as they exist in the provided database schema. Do not hallucinate fields or tables.
        2️⃣ Use snake_case column names for all SQL queries.
        3️⃣ Ensure that all generated SQL queries are valid and executable on the given schema.
        4️⃣ Always include all relevant columns in SQL statements, whether SELECT, INSERT, or UPDATE.
        5️⃣ Provide a two-part response:
        - First, a casual plain-language explanation of the query.
        - Second, the SQL statement wrapped in triple backticks.
        6️⃣ Use correct foreign keys when performing JOIN operations. Do not create erroneous relationships between tables.
        7️⃣ Avoid any hallucinations of tables, columns, or relationships.
        8️⃣ Produce error-free SQL output. No SQL syntax errors or invalid queries.

        Current Database schema shown in Prisma (so tables and columns will not shown in snake_case):
        ${schema}
        `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a SQL autocompletion assistant." },
        { role: "user", content: prompt },
      ],
    });


    // Parse the AI response
    let suggestions: string[] = [];
    try {
      const textResponse = response.choices[0].message.content!;
      suggestions = JSON.parse(textResponse);
    } catch {
      suggestions = [];
    }

    console.log('api: ', suggestions);

    res.status(200).json({ suggestions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
