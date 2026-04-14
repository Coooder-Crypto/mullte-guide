import clsx from "clsx";
import type { ElementType, ReactNode } from "react";

export function Eyebrow({
  as: Component = "p",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Component className={clsx("text-[11px] font-semibold uppercase tracking-[0.22em] text-muted", className)}>
      {children}
    </Component>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  className,
  valueClassName,
  detailClassName,
}: {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  className?: string;
  valueClassName?: string;
  detailClassName?: string;
}) {
  return (
    <article className={clsx("metric-tile", className)}>
      <Eyebrow>{label}</Eyebrow>
      <div className={clsx("mt-3 break-words text-xl font-semibold text-ink", valueClassName)}>{value}</div>
      {detail ? <p className={clsx("mt-2 text-sm leading-6 text-muted", detailClassName)}>{detail}</p> : null}
    </article>
  );
}

export function DetailRow({
  label,
  value,
  className,
  valueClassName,
}: {
  label: ReactNode;
  value: ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div
      className={clsx(
        "flat-card-muted flex flex-col items-start justify-between gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4",
        className,
      )}
    >
      <span>{label}</span>
      <span className={clsx("break-all font-medium text-ink sm:text-right", valueClassName)}>{value}</span>
    </div>
  );
}

export function DataPill({
  label,
  value,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("w-full rounded-[999px] border border-black bg-white px-4 py-3 sm:w-auto", className)}>
      <Eyebrow as="span" className="tracking-[0.2em]">
        {label}
      </Eyebrow>
      <span className="ml-2 break-words font-semibold text-ink">{value}</span>
    </div>
  );
}
