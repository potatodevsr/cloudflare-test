import type { TaskStatus } from "../api/tasksApi";
import { useTasksStore } from "../store/tasksStore";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const statusOptions: Array<{ label: string; value?: TaskStatus }> = [
  { label: "All Statuses", value: undefined },
  { label: "To Do", value: "TODO" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" },
];

const sortOptions = [
  { label: "Newest First", value: "createdAt-desc" },
  { label: "Oldest First", value: "createdAt-asc" },
  { label: "Status (A-Z)", value: "status-asc" },
  { label: "Status (Z-A)", value: "status-desc" },
];

export function FilterSort() {
  const statusFilter = useTasksStore((s) => s.statusFilter);
  const sortBy = useTasksStore((s) => s.sortBy);
  const sortOrder = useTasksStore((s) => s.sortOrder);
  const setStatusFilter = useTasksStore((s) => s.setStatusFilter);
  const setSorting = useTasksStore((s) => s.setSorting);
  const loading = useTasksStore((s) => s.loading);

  const sortValue = `${sortBy}-${sortOrder}`;

  return (
    <Card className="px-4 py-3 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Label
            htmlFor="status-filter"
            className="text-sm font-medium text-muted-foreground whitespace-nowrap"
          >
            Filter
          </Label>
          <select
            id="status-filter"
            className="h-9 flex-1 rounded-md border bg-background px-3 text-sm font-medium outline-none focus:ring-4 focus:ring-muted"
            value={statusFilter ?? ""}
            disabled={loading}
            onChange={(e) => {
              const v = e.target.value as TaskStatus | "";
              setStatusFilter(v === "" ? undefined : v);
            }}
          >
            {statusOptions.map((o) => (
              <option key={o.label} value={o.value ?? ""}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 flex-1">
          <Label
            htmlFor="sort-select"
            className="text-sm font-medium text-muted-foreground whitespace-nowrap"
          >
            Sort
          </Label>
          <select
            id="sort-select"
            className="h-9 flex-1 rounded-md border bg-background px-3 text-sm font-medium outline-none focus:ring-4 focus:ring-muted"
            value={sortValue}
            disabled={loading}
            onChange={(e) => {
              const [by, order] = e.target.value.split("-") as [
                "createdAt" | "status",
                "asc" | "desc"
              ];
              setSorting(by, order);
            }}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
}
