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
      1. Suggest **read-only SQL keywords** (SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY, LIMIT, etc.). Never INSERT, UPDATE, DELETE, ALTER, DROP.
      2. Suggest **columns, tables, operators, functions, aliases, and parameters** only from the provided schema.
      3. Suggest **operators** (<, >, =, <=, >=, !=, AND, OR, NOT, LIKE, etc.) only when contextually valid (e.g., after a column in WHERE, ON, or HAVING clauses).
      4. Use **cursor position** to decide what to suggest: column names, table names, keywords, operators, functions, aliases, or parameters.
      5. Suggest up to **5 items** and avoid duplicates.
      6. If no valid suggestions exist at the cursor position (e.g., invalid or unclear context), return an **empty array**. Do not hallucinate suggestions.
      7. Respond **ONLY with a JSON object**; no extra text or explanation.
      8. Use this mapping for Monaco completion kinds:

        SQL_Type → Monaco Kind
        Keyword → Keyword
        Operator → Operator
        Function → Function
        Table → Table
        Column → Field
        Column (with alias) → Property
        Table alias → Variable
        Query variable → Variable
        Boolean / NULL constant → Constant
        Other → Text

      9. Return this JSON format exactly:
      {
        "suggestions": [
          {"text": "WHERE", "type": "Keyword"},
          {"text": "id", "type": "Field"},
          {"text": "customer", "type": "Table"},
          {"text": "LIKE", "type": "Operator"},
          {"text": "COUNT", "type": "Function"}
        ]
      }

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