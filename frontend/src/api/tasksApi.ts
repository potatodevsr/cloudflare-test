import { z } from "zod";
import {
    CreateTaskSchema,
    UpdateTaskSchema,
    TaskStatusSchema,
    type ListTasksQuery,
} from "../schemas/task.schema";

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export type Task = {
    id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    createdAt: string;
    updatedAt: string;
};

const rawWorkersBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const rawExpressBaseUrl = (import.meta.env.VITE_EXPRESS_API_URL as string | undefined)?.trim();
const useExpressRaw = (import.meta.env.USE_EXPRESS as string | undefined)?.trim();

function isUseExpress() {
    return useExpressRaw === "1" || useExpressRaw?.toLowerCase() === "true";
}

function normalizeBaseUrl(v: string) {
    return v.replace(/\/+$/, "");
}

function getBaseUrl() {
    if (isUseExpress()) {
        const u = rawExpressBaseUrl || "http://localhost:4000";
        return normalizeBaseUrl(u);
    }

    if (!rawWorkersBaseUrl) throw new Error("VITE_API_URL is not set");
    return normalizeBaseUrl(rawWorkersBaseUrl);
}

function joinUrl(base: string, path: string) {
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${base}${p}`;
}

function buildHeaders(init?: RequestInit) {
    const headers = new Headers(init?.headers);
    const hasBody = init?.body !== undefined && init?.body !== null;

    if (hasBody && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    headers.set("Accept", "application/json");
    return headers;
}

function isObject(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null;
}

export class ApiError extends Error {
    constructor(
        message: string,
        public status?: number
    ) {
        super(message);
        this.name = "ApiError";
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = joinUrl(getBaseUrl(), path);

    const controller = new AbortController();
    const timeoutMs = 15000;
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(url, {
            ...init,
            headers: buildHeaders(init),
            signal: controller.signal,
        });

        if (!res.ok) {
            const data = (await res.json().catch(() => null)) as unknown;
            const msg =
                isObject(data) && "message" in data ? String(data.message) : `HTTP ${res.status}`;
            throw new ApiError(msg, res.status);
        }

        if (res.status === 204) return undefined as T;
        return (await res.json()) as T;
    } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
            throw new ApiError("Request timed out");
        }
        throw e;
    } finally {
        window.clearTimeout(timeoutId);
    }
}

export function fetchTasks(query?: Partial<ListTasksQuery>) {
    const params = new URLSearchParams();
    if (query?.status) params.set("status", query.status);
    if (query?.sortBy) params.set("sortBy", query.sortBy);
    if (query?.sortOrder) params.set("sortOrder", query.sortOrder);

    const qs = params.toString() ? `?${params.toString()}` : "";
    return request<Task[]>(`/tasks${qs}`);
}

export function createTask(input: z.infer<typeof CreateTaskSchema>) {
    const validated = CreateTaskSchema.parse(input);
    return request<Task>("/tasks", { method: "POST", body: JSON.stringify(validated) });
}

export function updateTask(id: number, input: z.infer<typeof UpdateTaskSchema>) {
    const validated = UpdateTaskSchema.parse(input);
    return request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(validated) });
}

export function deleteTask(id: number) {
    return request<void>(`/tasks/${id}`, { method: "DELETE" });
}