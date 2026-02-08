import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import { ZodError } from "zod";
import {
    CreateTaskSchema,
    UpdateTaskSchema,
    TaskIdSchema,
    ListTasksQuerySchema,
} from "../schemas/task.schema";
import { createTask, listTasks, softDeleteTask, updateTask } from "../services/tasks.service";

function formatZodError(error: ZodError): string {
    const firstError = error.issues[0];
    return firstError?.message || "Validation failed";
}

export function createTasksRouter(prisma: PrismaClient) {
    const router = Router();

    router.get("/", async (req, res, next) => {
        try {
            const query = ListTasksQuerySchema.parse({
                status: req.query.status,
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder,
            });

            const tasks = await listTasks(prisma, query);
            res.status(200).json(tasks);
        } catch (e) {
            if (e instanceof ZodError) {
                return res.status(400).json({ message: formatZodError(e) });
            }
            next(e);
        }
    });

    router.post("/", async (req, res, next) => {
        try {
            const input = CreateTaskSchema.parse(req.body);
            const task = await createTask(prisma, input);
            res.status(201).json(task);
        } catch (e) {
            if (e instanceof ZodError) {
                return res.status(400).json({ message: formatZodError(e) });
            }
            next(e);
        }
    });

    router.put("/:id", async (req, res, next) => {
        try {
            const id = TaskIdSchema.parse(req.params.id);
            const input = UpdateTaskSchema.parse(req.body);

            const updated = await updateTask(prisma, id, input);
            if (!updated) return res.status(404).json({ message: "Task not found" });

            res.json(updated);
        } catch (e) {
            if (e instanceof ZodError) {
                return res.status(400).json({ message: formatZodError(e) });
            }
            next(e);
        }
    });

    router.delete("/:id", async (req, res, next) => {
        try {
            const id = TaskIdSchema.parse(req.params.id);

            const deleted = await softDeleteTask(prisma, id);
            if (!deleted) return res.status(404).json({ message: "Task not found" });

            res.status(204).send();
        } catch (e) {
            if (e instanceof ZodError) {
                return res.status(400).json({ message: formatZodError(e) });
            }
            next(e);
        }
    });

    return router;
}