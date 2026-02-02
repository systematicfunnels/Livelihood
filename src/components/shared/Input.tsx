import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
            error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
