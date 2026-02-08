import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  message: string;
  onDismiss?: () => void;
};

export function ErrorAlert({ message, onDismiss }: Props) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-destructive">Error</p>
          <p className="text-sm text-destructive/90 mt-1">{message}</p>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
