import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface FormFieldProps extends React.ComponentProps<"input"> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  wrapperClassName?: string;
}

export function FormField({
  label,
  icon,
  error,
  wrapperClassName,
  className,
  id,
  ...props
}: FormFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("space-y-2", wrapperClassName)}>
      <Label
        htmlFor={fieldId}
        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </Label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </span>
        )}
        <Input
          id={fieldId}
          className={cn(
            "rounded-xl",
            icon && "pl-10",
            error && "border-destructive focus-visible:ring-destructive/20",
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
