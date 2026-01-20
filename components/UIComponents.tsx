import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-500 text-white focus:ring-primary-500 ring-offset-slate-900 shadow-lg shadow-primary-900/20",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 focus:ring-slate-500 ring-offset-slate-900 border border-slate-700",
    danger: "bg-red-600 hover:bg-red-500 text-white focus:ring-red-500 ring-offset-slate-900"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ${className}`}>
    {children}
  </label>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, className = '', children, ...props }) => (
  <div className="w-full">
    {label && <Label>{label}</Label>}
    <div className="relative">
      <select 
        className={`w-full appearance-none rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 pr-8 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  </div>
);