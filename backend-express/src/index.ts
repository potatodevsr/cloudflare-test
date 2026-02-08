import "dotenv/config";
import express from "express";
import cors from "cors";
import { getPrismaClient } from "./prisma";
import { createTasksRouter } from "./routes/tasks.routes";

function parseCorsOrigins(raw: string) {
    return raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
}

const app = express();
const prisma = getPrismaClient();

app.use(express.json({ limit: "1mb" }));

app.use(
    cors({
        origin: (origin, cb) => {
            const allowList = parseCorsOrigins(process.env.CORS_ORIGINS ?? "");

            if (!origin) return cb(null, false);

            if (allowList.length === 0) return cb(null, true);
            return cb(null, allowList.includes(origin));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        maxAge: 86400,
    })
);

app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Cache-Control", "no-store");
    next();
});

app.get("/", (req, res) => res.json({ ok: true, service: "tasks-api" }));
app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/tasks", createTasksRouter(prisma));

app.use((req, res) => res.status(404).json({ message: "Not found" }));

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
    console.log(`Express API listening on http://localhost:${port}`);
});
