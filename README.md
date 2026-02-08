## Backend choice (Workers vs Express)

Original requirement was Express, but this repo includes **two** backends for learning:

- **Workers (Hono + Prisma D1)**: `backend/`
- **Express (Node + Prisma SQLite)**: `backend-express/`

### Run Workers backend

```bash
cd backend
npm i
npm run dev

````

### Run Express backend + frontend

```bash
cd backend-express
npm i
npm run dev

cd ../frontend
npm i
USE_EXPRESS=true npm run dev

```
