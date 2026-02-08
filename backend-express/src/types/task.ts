export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

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
