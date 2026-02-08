import { z } from "zod";

export const TaskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export const CreateTaskSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .transform((s) => s.trim()),
    description: z
        .string()
        .optional()
        .nullable()
        .transform((s) => (s === "" ? null : s)),
    status: TaskStatusSchema.optional().default("TODO"),
});

export const UpdateTaskSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .transform((s) => s.trim())
        .optional(),
    description: z
        .string()
        .nullable()
        .optional()
        .transform((s) => (s === "" ? null : s)),
    status: TaskStatusSchema.optional(),
});

export const TaskIdSchema = z.coerce.number().int().positive();

export const ListTasksQuerySchema = z.object({
    status: TaskStatusSchema.optional(),
    sortBy: z.enum(["createdAt", "status"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export type CreateTaskInput = {
    title: string;
    description?: string | null;
    status?: TaskStatus;
};

export type UpdateTaskInput = {
    title?: string;
    description?: string | null;
    status?: TaskStatus;
};

export type ListTasksQuery = z.infer<typeof ListTasksQuerySchema>;