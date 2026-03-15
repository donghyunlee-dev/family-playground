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
    <section className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <p className="text-xs uppercase tracking-[0.3em] text-sky-700">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
        {description}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

interface StatPillProps {
  label: string;
  value: string;
}

export function StatPill({ label, value }: StatPillProps) {
  return (
    <div className="rounded-[1.6rem] border border-white/20 bg-[linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_100%)] px-4 py-3 text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)]">
      <div className="text-[0.7rem] uppercase tracking-[0.25em] text-sky-100/75">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50/85 px-5 py-8 text-center">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}
