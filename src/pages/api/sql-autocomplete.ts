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

    const prompt = `
        You are an AI SQL autocomplete assistant for a live SQL editor. Your job is to provide **context-aware autocomplete suggestions** based on the SQL text and cursor position.

        Rules:

        1️⃣ **Suggestion Scope**
          - Suggest **read-only SQL keywords only** (SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY, LIMIT, etc.).
          - Never suggest INSERT, UPDATE, DELETE, ALTER, DROP, or any other write/DDL statements.
          - Suggest **columns, tables, aliases, functions, operators, or parameters** only from the provided schema.
          - All table names, column names, and aliases must match the schema **exactly in snake_case**.
          - Do not invent any tables, columns, or aliases.

        2️⃣ **Context Awareness**
          - Use the **cursor position** to determine what type of suggestion is valid:
              - After SELECT: suggest columns, functions, or aliases.
              - After FROM: suggest tables or table aliases.
              - After JOIN / ON: suggest columns, table aliases, or operators.
              - After WHERE / HAVING: suggest columns, operators, or constants.
              - After GROUP BY / ORDER BY: suggest columns or aliases.
          - Only suggest **operators** (<, >, =, <=, >=, !=, AND, OR, NOT, LIKE, IS NULL) when valid in context.
          - Only suggest **functions** (COUNT, SUM, AVG, MAX, MIN, etc.) where aggregations are allowed.

        3️⃣ **Suggestion Limits**
          - Suggest **no more than 5 items**.
          - Avoid duplicates.
          - If no valid suggestions exist at the cursor, return an **empty array**. Do not hallucinate suggestions.

        4️⃣ **Response Format**
          - Respond **only with a JSON object**, no extra text, no explanations.
          - Use this mapping for suggestion types to Monaco completion kinds:

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

          - JSON format example:

          {
            "suggestions": [
              {"text": "WHERE", "type": "Keyword"},
              {"text": "id", "type": "Field"},
              {"text": "customer", "type": "Table"},
              {"text": "LIKE", "type": "Operator"},
              {"text": "COUNT", "type": "Function"}
            ]
          }

        5️⃣**Database Schema**
        - customer: id, name, email, created_at  
          - Relations: purchases → purchase.customer_id, reviews → review.customer_id
        - product: id, name, category, price, stock  
          - Relations: purchase_items → purchase_item.product_id, reviews → review.product_id
        - purchase: id, customer_id, purchase_date, status, total_amount  
          - Relations: customer → customer.id, purchase_items → purchase_item.purchase_id
        - purchase_item: id, purchase_id, product_id, quantity, unit_price  
          - Relations: purchase → purchase.id, product → product.id
        - review: id, product_id, customer_id, rating, comment, created_at  
          - Relations: product → product.id, customer → customer.id

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