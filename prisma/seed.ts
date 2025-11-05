import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Dynamically get the project root (works in Vercel & Windows)
const ROOT = path.resolve();

// Helper to load JSON from `prisma/mockData`
function loadJson(fileName: string) {
  const filePath = path.join(ROOT, 'prisma', 'mockData', fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Convert ISO string to Date if needed
function parseDates(array: any[], dateFields: string[]) {
  return array.map(item => {
    const copy = { ...item };
    for (const field of dateFields) {
      if (copy[field]) copy[field] = new Date(copy[field]);
    }
    return copy;
  });
}

async function main() {
  // --- Customers ---
  const customerData = loadJson('customer-data.json');
  await prisma.customer.createMany({ data: customerData, skipDuplicates: true });
  console.log(`✅ ${customerData.length} customers added!`);

  // --- Products ---
  const productData = loadJson('product-data.json');
  await prisma.product.createMany({ data: productData, skipDuplicates: true });
  console.log(`✅ ${productData.length} products added!`);

  // --- Purchases ---
  const purchaseData = loadJson('purchase-data.json');
  await prisma.purchase.createMany({ data: purchaseData, skipDuplicates: true });
  console.log(`✅ ${purchaseData.length} purchases added!`);

  // --- PurchaseItems ---
  const purchaseItemData = loadJson('purchase-item-data.json');
  await prisma.purchaseItem.createMany({ data: purchaseItemData, skipDuplicates: true });
  console.log(`✅ ${purchaseItemData.length} purchaseItems added!`);

  // --- Reviews ---
  const reviewDataRaw = loadJson('review-data.json');
  const reviewData = parseDates(reviewDataRaw, ['createdAt']);
  await prisma.review.createMany({ data: reviewData, skipDuplicates: true });
  console.log(`✅ ${reviewData.length} reviews added!`);
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
