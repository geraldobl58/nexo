import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { startIcon?: React.ReactNode }
>(({ className, type, startIcon, ...props }, ref) => {
  return (
    <div className="relative w-full">
      {startIcon ? (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
          {startIcon}
        </span>
      ) : null}
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          startIcon ? "pl-9" : "",
          className,
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
});
Input.displayName = "Input";

export { Input };
