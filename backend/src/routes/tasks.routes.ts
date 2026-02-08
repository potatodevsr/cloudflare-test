import { Hono } from "hono";
import type { Env } from "../types/task";
import type { PrismaClient } from "@prisma/client";
import { ZodError } from "zod";
import {
    CreateTaskSchema,
    UpdateTaskSchema,
    TaskIdSchema,
    ListTasksQuerySchema,
} from "../schemas/task.schema";
import { createTask, listTasks, softDeleteTask, updateTask } from "../services/tasks.service";

type Variables = { prisma: PrismaClient };

function formatZodError(error: ZodError): string {
    const firstError = error.issues[0];
    return firstError?.message || "Validation failed";
}

export function createTasksRouter() {
    const app = new Hono<{ Bindings: Env; Variables: Variables }>();

    app.get("/", async (c) => {
        try {
            const prisma = c.get("prisma");
            const query = ListTasksQuerySchema.parse({
                status: c.req.query("status"),
                sortBy: c.req.query("sortBy"),
                sortOrder: c.req.query("sortOrder"),
            });

            const tasks = await listTasks(prisma, query);
            return c.json(tasks, 200);
        } catch (e) {
            if (e instanceof ZodError) {
                return c.json({ message: formatZodError(e) }, 400);
            }
            throw e;
        }
    });

    app.post("/", async (c) => {
        try {
            const prisma = c.get("prisma");
            const body = await c.req.json();
            const input = CreateTaskSchema.parse(body);

            const task = await createTask(prisma, input);
            return c.json(task, 201);
        } catch (e) {
            if (e instanceof ZodError) {
                return c.json({ message: formatZodError(e) }, 400);
            }
            throw e;
        }
    });

    app.put("/:id", async (c) => {
        try {
            const prisma = c.get("prisma");
            const id = TaskIdSchema.parse(c.req.param("id"));
            const body = await c.req.json();
            const input = UpdateTaskSchema.parse(body);

            const updated = await updateTask(prisma, id, input);
            if (!updated) return c.json({ message: "Task not found" }, 404);

            return c.json(updated);
        } catch (e) {
            if (e instanceof ZodError) {
                return c.json({ message: formatZodError(e) }, 400);
            }
            throw e;
        }
    });

    app.delete("/:id", async (c) => {
        try {
            const prisma = c.get("prisma");
            const id = TaskIdSchema.parse(c.req.param("id"));

            const deleted = await softDeleteTask(prisma, id);
            if (!deleted) return c.json({ message: "Task not found" }, 404);

            return c.body(null, 204);
        } catch (e) {
            if (e instanceof ZodError) {
                return c.json({ message: formatZodError(e) }, 400);
            }
            throw e;
        }
    });

    return app;
}