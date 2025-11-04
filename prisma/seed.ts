import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // --- Customers ---
  const customersData = [
    { name: "Alice Johnson", email: "alice1@example.com" },
    { name: "Bob Smith", email: "bob2@example.com" },
    { name: "Charlie Brown", email: "charlie3@example.com" },
    { name: "David Lee", email: "david4@example.com" },
    { name: "Eva Green", email: "eva5@example.com" },
    { name: "Frank Miller", email: "frank6@example.com" },
    { name: "Grace Kim", email: "grace7@example.com" },
    { name: "Henry Adams", email: "henry8@example.com" },
    { name: "Ivy Wilson", email: "ivy9@example.com" },
    { name: "Jack White", email: "jack10@example.com" },
    { name: "Karen Black", email: "karen11@example.com" },
    { name: "Leo Turner", email: "leo12@example.com" },
    { name: "Mia Scott", email: "mia13@example.com" },
    { name: "Nathan Young", email: "nathan14@example.com" },
    { name: "Olivia King", email: "olivia15@example.com" },
    { name: "Paul Walker", email: "paul16@example.com" },
    { name: "Quinn Hall", email: "quinn17@example.com" },
    { name: "Rachel Lewis", email: "rachel18@example.com" },
    { name: "Steve Martin", email: "steve19@example.com" },
    { name: "Tina Brown", email: "tina20@example.com" },
  ];

  await prisma.customer.createMany({
    data: customersData,
    skipDuplicates: true,
  });
  console.log("✅ 20 customers added!");

  // --- Products ---
  const productsData = [
    { name: "Laptop", category: "Electronics", price: 1200.0, stock: 10 },
    { name: "Smartphone", category: "Electronics", price: 800.0, stock: 20 },
    { name: "Headphones", category: "Electronics", price: 150.0, stock: 50 },
    { name: "Monitor", category: "Electronics", price: 300.0, stock: 15 },
    { name: "Keyboard", category: "Electronics", price: 100.0, stock: 40 },
    { name: "Mouse", category: "Electronics", price: 50.0, stock: 60 },
    { name: "Chair", category: "Furniture", price: 200.0, stock: 25 },
    { name: "Desk", category: "Furniture", price: 350.0, stock: 10 },
    { name: "Notebook", category: "Stationery", price: 5.0, stock: 100 },
    { name: "Pen", category: "Stationery", price: 2.0, stock: 200 },
    { name: "Backpack", category: "Accessories", price: 60.0, stock: 30 },
    { name: "Jacket", category: "Clothing", price: 120.0, stock: 20 },
    { name: "T-shirt", category: "Clothing", price: 25.0, stock: 50 },
    { name: "Sneakers", category: "Footwear", price: 90.0, stock: 40 },
    { name: "Socks", category: "Clothing", price: 5.0, stock: 100 },
    { name: "Coffee Maker", category: "Appliances", price: 80.0, stock: 15 },
    { name: "Blender", category: "Appliances", price: 60.0, stock: 20 },
    { name: "Cookware Set", category: "Kitchen", price: 120.0, stock: 15 },
    { name: "Plate Set", category: "Kitchen", price: 50.0, stock: 30 },
    { name: "Water Bottle", category: "Accessories", price: 15.0, stock: 80 },
  ];

  await prisma.product.createMany({
    data: productsData,
    skipDuplicates: true,
  });
  console.log("✅ 20 products added!");

  // --- Purchases ---
  const purchasesData = [
    { customerId: 1, purchaseDate: new Date("2025-09-10"), status: "pending", totalAmount: 120.5 },
    { customerId: 2, purchaseDate: new Date("2025-09-12"), status: "delivered", totalAmount: 45.0 },
    { customerId: 3, purchaseDate: new Date("2025-09-15"), status: "shipped", totalAmount: 78.25 },
    { customerId: 4, purchaseDate: new Date("2025-09-20"), status: "cancelled", totalAmount: 90.0 },
    { customerId: 5, purchaseDate: new Date("2025-09-25"), status: "delivered", totalAmount: 150.75 },
    { customerId: 6, purchaseDate: new Date("2025-09-28"), status: "pending", totalAmount: 60.0 },
    { customerId: 7, purchaseDate: new Date("2025-10-01"), status: "shipped", totalAmount: 35.5 },
    { customerId: 8, purchaseDate: new Date("2025-10-03"), status: "delivered", totalAmount: 200.0 },
    { customerId: 9, purchaseDate: new Date("2025-10-06"), status: "pending", totalAmount: 125.0 },
    { customerId: 10, purchaseDate: new Date("2025-10-08"), status: "shipped", totalAmount: 80.99 },
    { customerId: 11, purchaseDate: new Date("2025-10-10"), status: "pending", totalAmount: 50.5 },
    { customerId: 12, purchaseDate: new Date("2025-10-11"), status: "cancelled", totalAmount: 99.95 },
    { customerId: 13, purchaseDate: new Date("2025-10-12"), status: "delivered", totalAmount: 30.0 },
    { customerId: 14, purchaseDate: new Date("2025-10-13"), status: "shipped", totalAmount: 110.2 },
    { customerId: 15, purchaseDate: new Date("2025-10-14"), status: "pending", totalAmount: 85.75 },
    { customerId: 16, purchaseDate: new Date("2025-10-16"), status: "delivered", totalAmount: 140.0 },
    { customerId: 17, purchaseDate: new Date("2025-10-18"), status: "pending", totalAmount: 65.5 },
    { customerId: 18, purchaseDate: new Date("2025-10-20"), status: "delivered", totalAmount: 77.77 },
    { customerId: 19, purchaseDate: new Date("2025-10-22"), status: "shipped", totalAmount: 95.1 },
    { customerId: 20, purchaseDate: new Date("2025-10-25"), status: "pending", totalAmount: 180.0 },
  ];

  for (const purchase of purchasesData) {
    await prisma.purchase.create({
      data: purchase,
    });
  }
  console.log("✅ 20 purchases added!");
  
// --- PurchaseItems ---
const purchaseItemsData = [
  { purchaseId: 1, productId: 1, quantity: 1, unitPrice: 1200.0 },
  { purchaseId: 2, productId: 2, quantity: 1, unitPrice: 800.0 },
  { purchaseId: 3, productId: 4, quantity: 2, unitPrice: 300.0 },
  { purchaseId: 4, productId: 3, quantity: 1, unitPrice: 150.0 },
  { purchaseId: 5, productId: 7, quantity: 1, unitPrice: 200.0 },
  { purchaseId: 6, productId: 8, quantity: 1, unitPrice: 350.0 },
  { purchaseId: 7, productId: 5, quantity: 1, unitPrice: 100.0 },
  { purchaseId: 8, productId: 6, quantity: 1, unitPrice: 50.0 },
  { purchaseId: 9, productId: 11, quantity: 2, unitPrice: 60.0 },
  { purchaseId: 10, productId: 14, quantity: 1, unitPrice: 90.0 },
  { purchaseId: 11, productId: 13, quantity: 1, unitPrice: 25.0 },
  { purchaseId: 12, productId: 15, quantity: 2, unitPrice: 5.0 },
  { purchaseId: 13, productId: 16, quantity: 1, unitPrice: 80.0 },
  { purchaseId: 14, productId: 12, quantity: 1, unitPrice: 120.0 },
  { purchaseId: 15, productId: 11, quantity: 1, unitPrice: 60.0 },
  { purchaseId: 16, productId: 4, quantity: 1, unitPrice: 300.0 },
  { purchaseId: 17, productId: 3, quantity: 2, unitPrice: 150.0 },
  { purchaseId: 18, productId: 8, quantity: 1, unitPrice: 350.0 },
  { purchaseId: 19, productId: 7, quantity: 1, unitPrice: 200.0 },
  { purchaseId: 20, productId: 1, quantity: 1, unitPrice: 1200.0 },
];

await prisma.purchaseItem.createMany({ data: purchaseItemsData });
console.log("✅ 20 purchaseItems added!");


  // --- Reviews ---
  const reviewsData = [
    { customerId: 1, productId: 1, rating: 5, comment: "Excellent laptop!", createdAt: new Date(2025, 0, 1) },
    { customerId: 2, productId: 2, rating: 4, comment: "Good smartphone.", createdAt: new Date(2025, 0, 2) },
    { customerId: 3, productId: 3, rating: 3, comment: "Average headphones.", createdAt: new Date(2025, 0, 3) },
    { customerId: 4, productId: 4, rating: 5, comment: "Great monitor!", createdAt: new Date(2025, 0, 4) },
    { customerId: 5, productId: 5, rating: 4, comment: "Nice keyboard.", createdAt: new Date(2025, 0, 5) },
    { customerId: 6, productId: 6, rating: 3, comment: "Mouse is okay.", createdAt: new Date(2025, 0, 6) },
    { customerId: 7, productId: 7, rating: 5, comment: "Love this chair!", createdAt: new Date(2025, 0, 7) },
    { customerId: 8, productId: 8, rating: 4, comment: "Desk looks good.", createdAt: new Date(2025, 0, 8) },
    { customerId: 9, productId: 9, rating: 3, comment: "Notebook is fine.", createdAt: new Date(2025, 0, 9) },
    { customerId: 10, productId: 10, rating: 5, comment: "Pen writes well!", createdAt: new Date(2025, 0, 10) },
    { customerId: 11, productId: 11, rating: 4, comment: "Backpack is nice.", createdAt: new Date(2025, 0, 11) },
    { customerId: 12, productId: 12, rating: 5, comment: "Jacket is cozy.", createdAt: new Date(2025, 0, 12) },
    { customerId: 13, productId: 13, rating: 3, comment: "T-shirt is okay.", createdAt: new Date(2025, 0, 13) },
    { customerId: 14, productId: 14, rating: 4, comment: "Sneakers are comfy.", createdAt: new Date(2025, 0, 14) },
    { customerId: 15, productId: 15, rating: 2, comment: "Socks are too thin.", createdAt: new Date(2025, 0, 15) },
    { customerId: 16, productId: 16, rating: 5, comment: "Coffee maker is excellent!", createdAt: new Date(2025, 0, 16) },
    { customerId: 17, productId: 17, rating: 4, comment: "Blender works well.", createdAt: new Date(2025, 0, 17) },
    { customerId: 18, productId: 18, rating: 5, comment: "Cookware set is solid.", createdAt: new Date(2025, 0, 18) },
    { customerId: 19, productId: 19, rating: 3, comment: "Plate set is okay.", createdAt: new Date(2025, 0, 19) },
    { customerId: 20, productId: 20, rating: 4, comment: "Water bottle is great.", createdAt: new Date(2025, 0, 20) },
  ];

  await prisma.review.createMany({ data: reviewsData });
  console.log("✅ 20 reviews added!");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
