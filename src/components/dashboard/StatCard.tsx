import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  helper?: string;
}

export function StatCard({ title, value, icon: Icon, helper }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-line bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{title}</p>
          <strong className="mt-2 block text-2xl font-bold text-white">{value}</strong>
          {helper ? <span className="mt-3 block text-xs text-green-300">{helper}</span> : null}
        </div>
        <div className="rounded-2xl bg-primary/15 p-3 text-primary">
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}
