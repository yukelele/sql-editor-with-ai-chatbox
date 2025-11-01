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


// import { getDMMF } from "@prisma/sdk";

// export async function getDbSchema() {
//   const schemaPath = "./prisma/schema.prisma"; // adjust path if needed
//   const dmmf = await getDMMF({ datamodel: schemaPath });

//   const schema: Record<string, string[]> = {};

//   for (const model of dmmf.datamodel.models) {
//     const tableName = model.dbName || model.name;
//     schema[tableName] = model.fields
//       .filter(f => !f.isId)
//       .map(f => f.name);
//   }

//   return schema;
// }
