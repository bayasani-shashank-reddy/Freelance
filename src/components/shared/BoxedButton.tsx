import React from 'react';
import { Loader2 } from 'lucide-react';

export type BoxedButtonVariant = 'primary' | 'secondary' | 'accent' | 'blue' | 'tertiary' | 'destructive' | 'outline' | 'ghost';
export type BoxedButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface BoxedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BoxedButtonVariant;
  size?: BoxedButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  href?: string;
  target?: string;
  rel?: string;
}

export const BoxedButton = React.forwardRef<HTMLButtonElement, BoxedButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  href,
  target,
  rel,
  ...props
}, ref) => {
  // Base classes: Stitch rounded-xl boxed styling with clear hit areas and transitions
  const baseClasses = 'inline-flex items-center justify-center font-sans font-semibold tracking-normal rounded-xl border transition-all duration-150 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50';

  // Variant styling matching Google Stitch visual design
  const variantClasses: Record<BoxedButtonVariant, string> = {
    // Electric Violet (#7357FF)
    primary: 'bg-[#7357FF] text-white border-[#7357FF] hover:bg-[#6142FA] hover:border-[#6142FA] active:translate-y-[1px] shadow-sm shadow-[#7357FF]/20 focus:ring-[#7357FF]',
    // Clean White / Surface secondary
    secondary: 'bg-white text-[#17172B] border-[#E5E7F2] hover:bg-[#F7F8FC] hover:border-[#D1D5E8] active:translate-y-[1px] shadow-sm dark:bg-[#1C1C33] dark:text-[#F7F8FC] dark:border-[#2A2A46] dark:hover:bg-[#252542] focus:ring-[#7357FF]',
    // Acid Lime (#D5FF68) - prominent Stitch CTA
    accent: 'bg-[#D5FF68] text-[#17172B] border-[#D5FF68] hover:bg-[#C5F54F] hover:border-[#C5F54F] active:translate-y-[1px] font-bold shadow-sm shadow-[#D5FF68]/30 focus:ring-[#D5FF68]',
    // Cobalt Blue (#3978FF)
    blue: 'bg-[#3978FF] text-white border-[#3978FF] hover:bg-[#2868F0] hover:border-[#2868F0] active:translate-y-[1px] shadow-sm shadow-[#3978FF]/20 focus:ring-[#3978FF]',
    // Soft Lavender (#EEE9FF)
    tertiary: 'bg-[#EEE9FF] text-[#7357FF] border-[#EEE9FF] hover:bg-[#E2DBFC] active:translate-y-[1px] dark:bg-[#252445] dark:text-[#9C8AFF] dark:border-[#252445] focus:ring-[#7357FF]',
    // Coral (#FF826E)
    destructive: 'bg-[#FF826E] text-white border-[#FF826E] hover:bg-[#F0705C] active:translate-y-[1px] shadow-sm focus:ring-[#FF826E]',
    // Transparent with clean border
    outline: 'bg-transparent text-[#17172B] border-[#E5E7F2] hover:bg-[#F7F8FC] hover:border-[#7357FF] dark:text-[#F7F8FC] dark:border-[#2A2A46] dark:hover:bg-[#1F1F38] focus:ring-[#7357FF]',
    // Ghost
    ghost: 'bg-transparent text-[#65677A] border-transparent hover:bg-[#F7F8FC] hover:text-[#17172B] dark:text-[#A6A8C0] dark:hover:bg-[#1F1F38] dark:hover:text-white',
  };

  // Size styling with comfortable Stitch proportions
  const sizeClasses: Record<BoxedButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8.5 rounded-lg',
    md: 'text-sm px-4 py-2 gap-2 h-10 rounded-xl',
    lg: 'text-base px-6 py-2.5 gap-2.5 h-12 rounded-xl font-bold',
    icon: 'p-2 w-10 h-10 justify-center rounded-xl',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={combinedClasses}
      >
        {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
        {children && <span>{children}</span>}
        {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={combinedClasses}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {size !== 'icon' && <span>Loading...</span>}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
});

BoxedButton.displayName = 'BoxedButton';
export default BoxedButton;
