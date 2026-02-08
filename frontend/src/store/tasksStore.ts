import { create } from "zustand";
import type { Task, TaskStatus } from "../api/tasksApi";
import type { CreateTaskInput, UpdateTaskInput } from "../schemas/task.schema";
import * as api from "../api/tasksApi";
import { ApiError } from "../api/tasksApi";

type SortBy = "createdAt" | "status";
type SortOrder = "asc" | "desc";

type TasksState = {
    tasks: Task[];
    statusFilter?: TaskStatus;
    sortBy: SortBy;
    sortOrder: SortOrder;
    loading: boolean;
    error?: string;
    setStatusFilter: (s?: TaskStatus) => void;
    setSorting: (sortBy: SortBy, sortOrder: SortOrder) => void;
    load: () => Promise<void>;
    add: (input: CreateTaskInput) => Promise<void>;
    update: (id: number, patch: UpdateTaskInput) => Promise<void>;
    remove: (id: number) => Promise<void>;
    clearError: () => void;
};

export const useTasksStore = create<TasksState>((set, get) => ({
    tasks: [],
    statusFilter: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
    loading: false,
    error: undefined,

    setStatusFilter: (s) => {
        set({ statusFilter: s });
        get().load();
    },

    setSorting: (sortBy, sortOrder) => {
        set({ sortBy, sortOrder });
        get().load();
    },

    load: async () => {
        const { statusFilter, sortBy, sortOrder } = get();
        set({ loading: true, error: undefined });
        try {
            const tasks = await api.fetchTasks({ status: statusFilter, sortBy, sortOrder });
            set({ tasks, loading: false });
        } catch (e) {
            const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Failed to load tasks";
            set({ loading: false, error: message });
        }
    },

    add: async (input) => {
        set({ loading: true, error: undefined });
        try {
            const created = await api.createTask(input);
            const { statusFilter } = get();
            set((s) => ({
                tasks: !statusFilter || created.status === statusFilter ? [created, ...s.tasks] : s.tasks,
                loading: false,
            }));
        } catch (e) {
            const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Failed to create task";
            set({ loading: false, error: message });
            throw e;
        }
    },

    update: async (id, patch) => {
        set({ loading: true, error: undefined });
        try {
            const updated = await api.updateTask(id, patch);
            const { statusFilter } = get();
            set((s) => {
                const replaced = s.tasks.map((t) => (t.id === id ? updated : t));
                return {
                    tasks: statusFilter ? replaced.filter((t) => t.status === statusFilter) : replaced,
                    loading: false,
                };
            });
        } catch (e) {
            const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Failed to update task";
            set({ loading: false, error: message });
            throw e;
        }
    },

    remove: async (id) => {
        set({ loading: true, error: undefined });
        try {
            await api.deleteTask(id);
            set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id), loading: false }));
        } catch (e) {
            const message = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Failed to delete task";
            set({ loading: false, error: message });
            throw e;
        }
    },

    clearError: () => set({ error: undefined }),
}));