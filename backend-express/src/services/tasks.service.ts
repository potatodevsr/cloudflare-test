import type { PrismaClient } from "@prisma/client";
import type { CreateTaskInput, UpdateTaskInput, TaskStatus } from "../types/task";

export async function listTasks(prisma: PrismaClient, status?: TaskStatus) {
    return prisma.task.findMany({
        where: {
            deletedAt: null,
            ...(status ? { status } : {}),
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function createTask(prisma: PrismaClient, input: CreateTaskInput) {
    return prisma.task.create({
        data: {
            title: input.title,
            description: input.description,
            status: input.status ?? "TODO",
        },
    });
}

export async function updateTask(prisma: PrismaClient, id: number, input: UpdateTaskInput) {
    const result = await prisma.task.updateMany({
        where: { id, deletedAt: null },
        data: {
            ...(input.title !== undefined ? { title: input.title } : {}),
            ...(input.description !== undefined ? { description: input.description } : {}),
            ...(input.status !== undefined ? { status: input.status } : {}),
        },
    });

    if (result.count === 0) return null;

    return prisma.task.findUnique({ where: { id } });
}

export async function softDeleteTask(prisma: PrismaClient, id: number) {
    const result = await prisma.task.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
    });

    if (result.count === 0) return null;

    return prisma.task.findUnique({ where: { id } });
}
