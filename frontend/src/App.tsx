import { useEffect } from "react";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { FilterSort } from "./components/FilterSort";
import { ErrorAlert } from "./components/ErrorAlert";
import { useTasksStore } from "./store/tasksStore";

export default function App() {
  const load = useTasksStore((s) => s.load);
  const loading = useTasksStore((s) => s.loading);
  const error = useTasksStore((s) => s.error);
  const clearError = useTasksStore((s) => s.clearError);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Task Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and organize your tasks efficiently
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorAlert message={error} onDismiss={clearError} />
          </div>
        )}

        <div className="space-y-6">
          <TaskForm />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Tasks</h2>
              {loading && (
                <div className="text-sm text-muted-foreground animate-pulse">
                  Loading...
                </div>
              )}
            </div>

            <FilterSort />
            <TaskList />
          </div>
        </div>
      </div>
    </div>
  );
}
