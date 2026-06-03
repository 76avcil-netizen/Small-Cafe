import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

type BadgeTone = 'default' | 'success' | 'danger' | 'warning';

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const tones: Record<BadgeTone, string> = {
  default: 'border-line bg-white/5 text-stone-200',
  success: 'border-success/30 bg-success/15 text-green-300',
  danger: 'border-danger/30 bg-danger/15 text-red-300',
  warning: 'border-primary/30 bg-primary/15 text-orange-300',
};

export function Badge({ children, tone = 'default', className }: BadgeProps) {
  return (
    <span
      className={twMerge(
        clsx('inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold', tones[tone], className),
      )}
    >
      {children}
    </span>
  );
}
