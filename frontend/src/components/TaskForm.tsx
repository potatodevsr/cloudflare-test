import { useMemo, useState } from "react";
import type { TaskStatus } from "../api/tasksApi";
import { useTasksStore } from "../store/tasksStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

const statuses: Array<{ label: string; value: TaskStatus }> = [
  { label: "To Do", value: "TODO" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" },
];

const TITLE_MAX = 120;
const DESC_MAX = 2000;

export function TaskForm() {
  const add = useTasksStore((s) => s.add);
  const loading = useTasksStore((s) => s.loading);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");

  const trimmedTitle = title.trim();
  const trimmedDesc = description.trim();

  const canSubmit = useMemo(
    () => trimmedTitle.length > 0 && !loading,
    [trimmedTitle, loading]
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Create Task</CardTitle>
      </CardHeader>

      <CardContent>
        <form
          className="flex flex-col gap-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSubmit) return;

            await add({
              title: trimmedTitle,
              description: trimmedDesc || undefined,
              status,
            });

            setTitle("");
            setDescription("");
            setStatus("TODO");
          }}
        >
          <div className="flex gap-4 w-full">
            <div className="flex flex-col w-full gap-2">
              <Label htmlFor="task-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="task-title"
                placeholder="Enter task title"
                value={title}
                maxLength={TITLE_MAX}
                disabled={loading}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col w-full gap-2">
              <Label htmlFor="task-status">Status</Label>
              <select
                id="task-status"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm font-medium outline-none focus:ring-4 focus:ring-muted"
                value={status}
                disabled={loading}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              className="min-h-24 resize-y"
              placeholder="Enter task description"
              value={description}
              maxLength={DESC_MAX}
              disabled={loading}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button className="h-11 w-full" disabled={!canSubmit} type="submit">
            <Save className="mr-2 h-4 w-4" />
            Create
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
