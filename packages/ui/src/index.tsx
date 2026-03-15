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
    <section className="rounded-[2rem] border border-stone-900/10 bg-white/80 p-6 shadow-[0_18px_50px_rgba(28,25,23,0.08)] backdrop-blur">
      <p className="text-xs uppercase tracking-[0.3em] text-sky-700">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-stone-900">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
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
    <div className="rounded-2xl border border-stone-900/10 bg-stone-950 px-4 py-3 text-stone-50">
      <div className="text-[0.7rem] uppercase tracking-[0.25em] text-stone-300">
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
    <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-stone-50 px-5 py-8 text-center">
      <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
    </div>
  );
}
