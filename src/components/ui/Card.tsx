import clsx from "clsx";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius-lg)] border border-chrome-border bg-chrome-surface p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
