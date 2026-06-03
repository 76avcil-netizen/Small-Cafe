import type { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={twMerge(
        'min-h-11 w-full rounded-xl border border-line bg-app px-4 text-sm text-white outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20',
        className,
      )}
      {...props}
    />
  );
}
