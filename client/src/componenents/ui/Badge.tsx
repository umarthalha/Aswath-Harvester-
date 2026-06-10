import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline';
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-white/5 text-gray-300 border border-white/10",
      success: "layer-full",
      warning: "layer-partial",
      danger: "bg-red-500/10 text-red-400 border border-red-500/20",
      outline: "border border-white/10 text-gray-400",
    }
    
    return (
      <div 
        ref={ref} 
        className={cn("status-badge font-semibold focus:outline-none flex items-center justify-center gap-1", variants[variant], className)} 
        {...props} 
      />
    );
  }
);
Badge.displayName = "Badge"
