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
    <section className="rounded-[2.25rem] border border-[#ffdca8] bg-[linear-gradient(180deg,_rgba(255,255,255,0.95)_0%,_rgba(255,249,239,0.98)_100%)] p-6 shadow-[0_24px_70px_rgba(245,158,11,0.12)] backdrop-blur">
      <p className="text-xs tracking-[0.26em] text-[#f97316]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#26324b]">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f6784]">
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
    <div className="rounded-[1.7rem] border border-white/80 bg-[linear-gradient(135deg,_#ffffff_0%,_#fff2d5_50%,_#dff4ff_100%)] px-4 py-3 text-[#26324b] shadow-[0_18px_40px_rgba(56,189,248,0.14)]">
      <div className="text-[0.72rem] tracking-[0.18em] text-[#f97316]">
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
    <div className="rounded-[1.9rem] border border-dashed border-[#fbbf24] bg-[linear-gradient(180deg,_#fffdf8_0%,_#fff2d9_100%)] px-5 py-8 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]">
      <h3 className="text-lg font-semibold text-[#26324b]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[#5f6784]">{description}</p>
    </div>
  );
}
