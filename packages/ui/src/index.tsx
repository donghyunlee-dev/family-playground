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
    <section className="rounded-[1.8rem] border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_18px_50px_rgba(15,23,42,0.07)] md:rounded-[2.25rem] md:p-6">
      <p className="text-[11px] font-semibold tracking-[0.24em] text-[#0f9d58] md:text-xs md:tracking-[0.28em]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#18324c] md:mt-3 md:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5d7088] md:mt-3 md:leading-7">
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
    <div className="rounded-[1.4rem] border border-white/90 bg-white/90 px-3 py-2.5 text-[#1b3550] shadow-[0_16px_34px_rgba(37,99,235,0.08)] md:rounded-[1.7rem] md:px-4 md:py-3">
      <div className="text-[10px] tracking-[0.16em] text-[#4285f4] md:text-[0.72rem] md:tracking-[0.18em]">
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
    <div className="rounded-[1.6rem] border border-dashed border-[#c9def7] bg-[#f7fbff] px-4 py-6 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)] md:rounded-[1.9rem] md:px-5 md:py-8">
      <h3 className="text-base font-semibold text-[#18324c] md:text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5d7088] md:leading-7">{description}</p>
    </div>
  );
}
