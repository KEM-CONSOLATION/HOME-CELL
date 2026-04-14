"use client";

import { Trash2, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  /** Shown in bold, e.g. the member or record name */
  itemName?: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete this record?",
  description = "This action cannot be undone. All data associated with this record will be permanently removed.",
  itemName,
  confirmLabel = "Yes, delete",
  isLoading = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-desc"
        className="relative w-full max-w-[400px] bg-card border rounded-lg p-8 animate-in fade-in zoom-in duration-300 shadow-2xl"
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-6 top-6"
        >
          <X />
        </Button>

        <div className="flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-destructive/10 rounded-lg flex items-center justify-center mb-6 ring-8 ring-destructive/5">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>

          <h3
            id="confirm-delete-title"
            className="text-2xl font-bold tracking-tight"
          >
            {title}
          </h3>
          {itemName ? (
            <p className="mt-3 text-base font-semibold text-foreground">
              {itemName}
            </p>
          ) : null}
          <p
            id="confirm-delete-desc"
            className="text-muted-foreground mt-2 text-sm leading-relaxed"
          >
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-10">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-2xl h-14"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            disabled={isLoading}
            onClick={() => void onConfirm()}
            className="rounded-2xl h-14"
          >
            {isLoading ? (
              <Skeleton className="h-5 w-5 rounded-full bg-white/40" />
            ) : (
              <Trash2 />
            )}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
