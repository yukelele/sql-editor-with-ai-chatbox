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
  cursorOffset: number; // current cursor position in the editor
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

  const { text, cursorOffset } = req.body as AutocompleteRequest;
  if (!text) return res.status(400).json({ error: "Missing text input" });

  try {
    // Load schema dynamically
    const schema = await getDbSchema();
    console.log('SCHEMA', schema);

    const prompt = `
    You are an AI SQL autocomplete assistant for a live SQL editor.

    Rules:
    1. Only suggest read-only SQL completions (SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY, etc.). Never INSERT, UPDATE, DELETE, ALTER, or DROP.
    2. Suggest a fully complete SQL statement. 
    4. Suggest a maximum of 5 short completions. Avoid duplicates.
    5. Respond ONLY with a JSON object: { "suggestions": ["...", "..."] }. No explanations or extra text.

    Current schema:
    ${JSON.stringify(schema, null, 2)}

    Current SQL:
    ${text}

    Cursor position:
    ${cursorOffset}
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
      const parsed = JSON.parse(textResponse);
      suggestions = parsed.suggestions;
    } catch {
      suggestions = [];
    }

    console.log('api: ', suggestions);

    res.status(200).json({ suggestions });
    // res.status(200).json({ suggestions: response.choices[0].message.content });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}