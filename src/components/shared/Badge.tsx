import { type HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'blue';
}

const Badge = ({ className = '', variant = 'neutral', ...props }: BadgeProps) => {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    neutral: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    />
  );
};

export default Badge;
