import type { TaskStatus } from "../api/tasksApi";

export const statusBadgeClass: Record<TaskStatus, string> = {
    TODO: "bg-yellow-100 text-yellow-900 border-yellow-200",
    IN_PROGRESS: "bg-pink-100 text-pink-900 border-pink-200",
    DONE: "bg-green-100 text-green-900 border-green-200",
};
