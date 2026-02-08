import type { TaskStatus } from "../api/tasksApi";
import { useTasksStore } from "../store/tasksStore";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const options: Array<{ label: string; value?: TaskStatus }> = [
  { label: "All", value: undefined },
  { label: "To Do", value: "TODO" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" },
];

export function StatusFilter() {
  const statusFilter = useTasksStore((s) => s.statusFilter);
  const load = useTasksStore((s) => s.load);
  const loading = useTasksStore((s) => s.loading);

  return (
    <Card className="px-3 py-2 shadow-sm">
      <div className="flex items-center gap-3">
        <Label
          htmlFor="status-filter"
          className="text-sm font-medium text-muted-foreground"
        >
          Filter
        </Label>

        <select
          id="status-filter"
          className="h-9 rounded-md border bg-background px-3 text-sm font-medium outline-none focus:ring-4 focus:ring-muted"
          value={statusFilter ?? ""}
          disabled={loading}
          onChange={(e) => {
            const v = e.target.value as TaskStatus | "";
            void load(v === "" ? undefined : v);
          }}
        >
          {options.map((o) => (
            <option key={o.label} value={o.value ?? ""}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
}
