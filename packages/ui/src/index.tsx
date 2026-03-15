import type { ReactNode } from "react";

interface SectionCardProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function SectionCard({
  eyebrow,
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-[1.8rem] border border-[#ffdca8] bg-[#fffdf9] p-4 shadow-[0_18px_40px_rgba(245,158,11,0.1)] md:rounded-[2.25rem] md:p-6 md:shadow-[0_24px_70px_rgba(245,158,11,0.12)]">
      <p className="text-[11px] tracking-[0.22em] text-[#f97316] md:text-xs md:tracking-[0.26em]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#26324b] md:mt-3 md:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f6784] md:mt-3 md:leading-7">
        {description}
      </p>
      <div className="mt-4 md:mt-6">{children}</div>
    </section>
  );
}

interface StatPillProps {
  label: string;
  value: string;
}

export function StatPill({ label, value }: StatPillProps) {
  return (
    <div className="rounded-[1.3rem] border border-[#ffe2b4] bg-[#fff7e8] px-3 py-2.5 text-[#26324b] shadow-[0_12px_28px_rgba(56,189,248,0.12)] md:rounded-[1.7rem] md:px-4 md:py-3 md:shadow-[0_18px_40px_rgba(56,189,248,0.14)]">
      <div className="text-[10px] tracking-[0.14em] text-[#f97316] md:text-[0.72rem] md:tracking-[0.18em]">
        {label}
      </div>
      <div className="mt-1.5 text-xl font-semibold md:mt-2 md:text-2xl">{value}</div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[1.6rem] border border-dashed border-[#fbbf24] bg-[#fff8ea] px-4 py-6 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)] md:rounded-[1.9rem] md:px-5 md:py-8">
      <h3 className="text-base font-semibold text-[#26324b] md:text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5f6784] md:leading-7">{description}</p>
    </div>
  );
}
