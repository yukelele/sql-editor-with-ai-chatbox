This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.



## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.




# Locally build Schema and initialize mock data
## optinal if migrations are out of sync
```rm -recurse -force prisma/migrations```

## create schemas
```npx prisma migrate dev --name init```

## drop + create schemas
```npx prisma migrate reset```

### view database
```npx prisma studio``` 



## AI Chatbox Stress Test Prompts:
- List all customers who spent more than $1000 in total, including each product they purchased, the quantity, unit price, and the total spent by the customer
- For each product category, show the top 3 most purchased products by quantity. Include product name, category, total quantity sold, and total revenue for that product.
- Show all products with the average rating, number of reviews, and the details of the latest review (comment and customer name). Only include products with at least 5 reviews.
- List all purchases in the last 30 days where total_amount > $500, including the customer name, email, each product purchased, quantity, unit price, and the running total spent by the customer.
- For each product, show the total revenue, total quantity sold, average review rating, and the names of customers who gave a 5-star rating, sorted by total revenue descending.
- Identify products that have stock below 10 and have sold more than 50 units in the last 60 days. Show product name, category, remaining stock, total units sold, and total revenue
- List all customers who made more than 3 purchases in the last 90 days, including the number of purchases, average purchase amount, and total spent. Sort by total spent descending.
- For each product category, show the top 2 customers by total spending within that category. Include customer name, email, category, total quantity purchased, and total amount spent.
- Show the 10 most recent 5-star reviews across all products. Include product name, customer name, review comment, rating, and purchase date.
- List all products that have never been purchased. Include product name, category, price, and stock.


## Challenges Learned:
- Rewrote the prompt for AI multiple times to get its sql query realiability perfectly. One issue was that not only the prompt had to valid with the current schema, but valid in PostGres-syntax query, but also valid in Prisma. Afterward, the AI response also needs to be serialized, so that it can send over via NextApiResponse json.
- similiarly with AI Sql autocompletion, I had to be specific with the rules. Also, it needed to be clever to know not only the entire context of the current text in the editor, but also its cursor position within the text.