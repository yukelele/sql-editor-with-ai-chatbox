### Features
1. SQL editor can run a sql query on a postgres database
2. AI has the context of the schema of the postgres database (not the actual data)
3. you can have a conversation with AI chat, and chat can suggest sql queries
4. the sql queries surfaced in the ai chat should have 2 buttons on them 
    1. run (replaces the sql query in the sql editor)
    2. copy (copies sql editor to clipboard)
5. AI generated queries should be validated (ex: no hallucinated fields or tables should be surfaced to the end user, no queries that are invalid)
6. AI powered autocomplete in the sql editor, similar to cursor. autocomplete suggestions should come up as long as the user is focused in the sql editor

7. Utilized shadecn's UI library 
2. Used https://www.npmjs.com/package/@monaco-editor/react for the sql editor
3. Built this fullstack app in nextjs 

## Getting Started
1. on root directory, run ```npm install``` to install all the dependencies
2. Initialiaze Prisma (if not already done), ```npx prisma init```
3. If your Prisma schema is ready and you want to create the database tables, run ```npx prisma migrate dev --name init```
4. Seed the database locally, ```npx prisma db seed```
5. Start the dev server, ```npm run dev```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Deploy on Vercel
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Locally build Schema and initialize mock data
# optinal if migrations are out of sync
```rm -recurse -force prisma/migrations```
```npx prisma migrate dev --name init```
```npx prisma migrate reset```

### view local database
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
- Rewrote the prompt for AI multiple times to get its sql query realiability perfectly. One issue was that not only the prompt had to valid with the current schema, but valid in Postgres-syntax query, but also valid in Prisma. Afterward, the AI response also needs to be serialized, so that it can send over via NextApiResponse json.
- similiarly with AI Sql autocompletion, I had to be specific with the rules. Also, it needed to be clever to know not only the entire context of the current text in the editor, but also its cursor position within the text.
- Had to learn the quirks of how Prisma handles its database, the logistic of Postgres database, and how OpenAI assumes certain rules of Prisma and Postgres from its trained model. 