import * as React from "react";
import { cn } from "@/lib/utils";

export interface IconInputProps extends React.ComponentProps<"input"> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const IconInput = React.forwardRef<HTMLInputElement, IconInputProps>(
  ({ className, type, startIcon, endIcon, ...props }, ref) => {
    return (
      <div className="relative flex w-full items-center">
        {startIcon && (
          <span className="pointer-events-none absolute left-3 flex items-center text-muted-foreground [&_svg]:size-5">
            {startIcon}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            startIcon ? "pl-10 pr-3" : "px-3",
            endIcon ? "pr-10" : "",
            className,
          )}
          ref={ref}
          {...props}
        />
        {endIcon && (
          <span className="pointer-events-none absolute right-3 flex items-center text-muted-foreground [&_svg]:size-5">
            {endIcon}
          </span>
        )}
      </div>
    );
  },
);
IconInput.displayName = "IconInput";

export { IconInput };
