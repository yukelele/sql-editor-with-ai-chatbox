// Hardcoded SQL keywords
export const SQL_KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "JOIN",
  "INNER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "ON",
  "GROUP BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "AND",
  "OR",
  "NOT",
  "IN",
  "IS",
  "NULL"
];


export function getSmartSuggestions(
  text: string,
  cursor: number,
  schema: Record<string, string[]>
): string[] {
  const leftText = text.slice(0, cursor).toLowerCase();
  const suggestions: string[] = [];

  // Get the last token typed
  const tokens = leftText.split(/\s+/);
  const lastToken = tokens[tokens.length - 1];

  if (tokens.includes("select") && !tokens.includes("from")) {
    // We're still in the SELECT part → suggest columns
    Object.values(schema).forEach(cols => suggestions.push(...cols));
  } else if (lastToken === "from" || lastToken === "join") {
    // Expecting table names
    suggestions.push(...Object.keys(schema));
  } else if (tokens.includes("where") || lastToken === "on") {
    // Expecting columns or operators
    Object.values(schema).forEach(cols => suggestions.push(...cols));
    suggestions.push("AND", "OR", "=", "<", ">", "<=", ">=", "<>");
  } else if (lastToken === "group" || lastToken === "order") {
    // After GROUP or ORDER → suggest BY
    suggestions.push("BY");
  } else if (lastToken === "by") {
    // After BY → suggest columns
    Object.values(schema).forEach(cols => suggestions.push(...cols));
  } else {
    // Default context → limit to safe read-only SQL keywords
    suggestions.push(
      "SELECT",
      "FROM",
      "WHERE",
      "JOIN",
      "INNER JOIN",
      "LEFT JOIN",
      "RIGHT JOIN",
      "GROUP BY",
      "ORDER BY",
      "LIMIT",
      "OFFSET"
    );
  }

  return suggestions; // Keep as-is, no deduplication
}