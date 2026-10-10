# Group Shopping Platform (Minor Project Starter)

A basic full-stack prototype for the AI-Assisted Group Shopping Platform.

## Stack
- Frontend: React + Vite + CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose (optional for quick demo; in-memory mode works without MongoDB)
- API testing: Postman

## Features
- Product catalogue with search and categories
- Create a shopping group and join with a code
- Shared product list for each group
- Assign products to members
- Update item status: Pending, Selected, Purchased
- Estimated budget and progress summary
- Basic rule-based AI-style shopping suggestions (replace with an AI API later)

## Requirements
Install Node.js LTS. Check:
```bash
node -v
npm -v
```

## Run the backend
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
The server runs at `http://localhost:5000`.
If `MONGODB_URI` is blank, the server uses in-memory demo data. Data resets when the server restarts.

## Run the frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the local URL printed by Vite (usually `http://localhost:5173`).

## Enable MongoDB persistence
1. Create a free MongoDB Atlas cluster.
2. Create a database user and allow your development IP.
3. Copy the connection string into `server/.env` as `MONGODB_URI`.
4. Restart the backend.
Never commit `.env` files or expose database credentials.

## Important prototype notes
- This is a college-project prototype, not production-ready authentication.
- The demo uses a simple display name for the current user. Add secure authentication before real-world use.
- No checkout, payments, or Amazon/Flipkart API integration is included.
- Product catalogue data is sample data.
