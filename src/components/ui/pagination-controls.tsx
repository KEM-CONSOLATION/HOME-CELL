import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationControlsProps = {
  page: number;
  count: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function PaginationControls({
  page,
  count,
  hasNext,
  hasPrevious,
  isLoading = false,
  onPrevious,
  onNext,
}: PaginationControlsProps) {
  if (!hasNext && !hasPrevious && page === 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-4 border-t bg-white">
      <p className="text-xs text-muted-foreground font-medium">
        Page {page} · {count} total records
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPrevious || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNext || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
