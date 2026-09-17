import React from 'react';
import clsx from 'clsx';

interface FestiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const FestiveButton: React.FC<FestiveButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs tracking-wide',
    md: 'px-5 py-2.5 text-sm tracking-wide',
    lg: 'px-6 py-3 text-base font-semibold tracking-wide',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-sindoor-600 via-sindoor-500 to-sindoor-600 hover:from-sindoor-500 hover:to-sindoor-600 text-[#FFF8EC] border border-gold-500/70 hover:border-gold-400 shadow-lg shadow-sindoor-950/60 hover:shadow-sindoor-600/40 hover:-translate-y-0.5 backdrop-blur-md',
    secondary: 'bg-[#2A0B0B]/85 hover:bg-[#4A1010]/90 text-cream-100 border border-gold-500/50 hover:border-gold-400 shadow-md shadow-black/60 hover:shadow-gold-500/20 hover:-translate-y-0.5 backdrop-blur-md',
    gold: 'bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-[#120909] font-bold shadow-lg shadow-gold-950/40 border border-gold-300/60 hover:border-white/60 hover:-translate-y-0.5 backdrop-blur-md',
    danger: 'bg-red-700/85 hover:bg-red-600/90 text-white shadow-md shadow-red-950/50 border border-red-400/40 backdrop-blur-md',
    ghost: 'bg-transparent hover:bg-white/10 text-cream-200 hover:text-white border border-transparent hover:border-gold-500/30 backdrop-blur-sm',
  };

  return (
    <button
      className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default FestiveButton;
