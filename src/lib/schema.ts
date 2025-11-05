import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getDbSchema() {
  const schema: Record<string, string[]> = {};

  // 1️⃣ Get all model names from Prisma
  const models = Object.keys(prisma);

  // 2️⃣ For each model, get its field names
  for (const modelName of models) {
    try {
      // @ts-ignore
      const model = prisma[modelName];
      // Skip if not a model (some internal Prisma properties exist)
      if (!model) continue;

      // Get the first row to infer columns
      const firstRow = await model.findFirst();
      if (firstRow) {
        schema[modelName] = Object.keys(firstRow);
      } else {
        // If table is empty, fallback to Prisma schema info (hardcoded)
        // Or list some common fields if known
        schema[modelName] = [];
      }
    } catch (err) {
      // Skip non-model properties
      continue;
    }
  }

  return schema;
}