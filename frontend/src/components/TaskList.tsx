import { useMemo, useState } from "react";
import type { Task, TaskStatus } from "../api/tasksApi";
import { useTasksStore } from "../store/tasksStore";
import { Clock, Pencil, Trash2, X, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { statusBadgeClass } from "./taskConstants";

const label: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

function StatusSelect({ task }: { task: Task }) {
  const update = useTasksStore((s) => s.update);
  const loading = useTasksStore((s) => s.loading);

  return (
    <select
      className="h-10 w-full md:w-44 rounded-md border bg-background px-3 text-sm font-medium outline-none focus:ring-4 focus:ring-muted"
      value={task.status}
      disabled={loading}
      onChange={async (e) => {
        await update(task.id, {
          ...task,
          status: e.target.value as TaskStatus,
        });
      }}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {label[s]}
        </option>
      ))}
    </select>
  );
}

export function TaskList() {
  const tasks = useTasksStore((s) => s.tasks);
  const update = useTasksStore((s) => s.update);
  const remove = useTasksStore((s) => s.remove);
  const loading = useTasksStore((s) => s.loading);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const canSave = useMemo(
    () => editTitle.trim().length > 0 && !loading,
    [editTitle, loading]
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Tasks</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4">
        {tasks.length === 0 && (
          <div className="rounded-lg border bg-muted/20 p-8 text-center text-muted-foreground">
            <div className="text-3xl">📝</div>
            <div className="mt-2 font-medium text-foreground">No tasks yet</div>
            <div className="text-sm">
              Create your first task to get started!
            </div>
          </div>
        )}

        {tasks.map((t) => {
          const isEditing = editingId === t.id;

          return (
            <div key={t.id} className="rounded-xl border bg-card p-4">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                <div className="min-w-0">
                  {!isEditing ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-semibold break-words">
                          {t.title}
                        </div>
                        <Badge
                          variant="outline"
                          className={`border ${statusBadgeClass[t.status]}`}
                        >
                          {label[t.status]}
                        </Badge>
                      </div>

                      {t.description && (
                        <div className="mt-2 text-sm text-muted-foreground break-words">
                          {t.description}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="grid gap-2">
                        <Label>Title</Label>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                          className="min-h-24 resize-y"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <Separator className="mb-3" />
                    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(t.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-2">
                  <StatusSelect task={t} />

                  {!isEditing ? (
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
                      <Button
                        variant="secondary"
                        className="h-10"
                        disabled={loading}
                        onClick={() => {
                          setEditingId(t.id);
                          setEditTitle(t.title);
                          setEditDesc(t.description ?? "");
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <Button
                        variant="destructive"
                        className="h-10"
                        disabled={loading}
                        onClick={async () => {
                          await remove(t.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
                      <Button
                        className="h-10"
                        disabled={!canSave}
                        onClick={async () => {
                          await update(t.id, {
                            title: editTitle.trim(),
                            description: editDesc.trim()
                              ? editDesc.trim()
                              : null,
                          });
                          setEditingId(null);
                        }}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Update
                      </Button>

                      <Button
                        variant="outline"
                        className="h-10"
                        disabled={loading}
                        onClick={() => setEditingId(null)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
