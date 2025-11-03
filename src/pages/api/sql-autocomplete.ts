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

    // Prompt for OpenAI: provide the current editor text and schema
    const prompt = `
            You are an AI assistant providing SQL autocompletion.
            Current editor text:
            ${text}

            Database schema:
            ${JSON.stringify(schema, null, 2)}

            Rules:
            1️⃣ Only suggest full SQL statement that are valid on the given schema.
            2️⃣ Suggest 1 statement that make sense based on current text.
            3️⃣ Respond with a JSON array of strings, nothing else. Example: ["SELECT id, name FROM users;", "SELECT COUNT(*) FROM orders;"]
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
