import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-orange-600 shadow-lg shadow-orange-950/30',
  secondary: 'border border-line bg-card text-stone-100 hover:border-primary/70 hover:text-white',
  danger: 'bg-danger text-white hover:bg-red-600',
  ghost: 'text-muted hover:bg-white/5 hover:text-white',
};

export function Button({ className, variant = 'primary', icon, children, ...props }: ButtonProps) {
  return (
    <button
      className={twMerge(
        clsx(
          'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
          variants[variant],
          className,
        ),
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
