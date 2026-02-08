import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import type { Env } from "./types/task";
import { createTasksRouter } from "./routes/tasks.routes";
import { createPrismaClient } from "./prisma";
import type { PrismaClient } from "@prisma/client";

type Variables = { prisma: PrismaClient };
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

function parseCorsOrigins(raw: string) {
    return raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
}

function isProd(env: Env) {
    return (env.ENVIRONMENT ?? "").toLowerCase() === "production";
}

// Global error handler
app.onError((err, c) => {
    console.error("Unhandled error:", err);

    // Don't leak error details in production
    if (isProd(c.env)) {
        return c.json({ message: "Internal server error" }, 500);
    }

    return c.json(
        { message: err.message || "Internal server error" },
        500
    );
});

// Prisma client middleware
app.use("*", async (c, next) => {
    c.set("prisma", createPrismaClient(c.env));
    await next();
});

// Security headers
app.use("*", secureHeaders());

// Custom security headers
app.use("*", async (c, next) => {
    await next();
    c.header("X-Content-Type-Options", "nosniff");
    c.header("Referrer-Policy", "no-referrer");
    c.header("Cache-Control", "no-store, no-cache, must-revalidate");
    c.header("Pragma", "no-cache");
});

// CORS configuration
app.use(
    "/*",
    cors({
        origin: (origin, c) => {
            const allowList = parseCorsOrigins(c.env.CORS_ORIGINS ?? "");

            if (!origin) return "";

            if (!isProd(c.env)) {
                return allowList.length === 0 ? "*" : allowList.includes(origin) ? origin : "";
            }

            // Production: strict whitelist only
            if (allowList.length === 0) return "";
            return allowList.includes(origin) ? origin : "";
        },
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        maxAge: 86400,
        credentials: false, // Set to true only if you need cookies
    })
);

// Health check
app.get("/", (c) => c.json({ ok: true, service: "tasks-api", version: "1.0.0" }));
app.get("/health", (c) => c.json({ ok: true, timestamp: new Date().toISOString() }));

// API routes
app.route("/tasks", createTasksRouter());

// 404 handler
app.notFound((c) => c.json({ message: "Not found" }, 404));

export default app;