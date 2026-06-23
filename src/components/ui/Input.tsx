import { forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label htmlFor={inputId} className="block">
        {label && (
          <span className="mb-1.5 block text-sm font-medium text-chrome-text">
            {label}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "h-11 w-full rounded-[var(--radius-md)] border bg-chrome-surface px-3.5 text-chrome-text",
            "placeholder:text-chrome-muted/60 transition",
            "focus:outline-none focus:ring-2 focus:ring-gold/60",
            error ? "border-maroon" : "border-chrome-border",
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error ? (
          <span className="mt-1 block text-xs text-maroon">{error}</span>
        ) : hint ? (
          <span className="mt-1 block text-xs text-chrome-muted">{hint}</span>
        ) : null}
      </label>
    );
  },
);
Input.displayName = "Input";
