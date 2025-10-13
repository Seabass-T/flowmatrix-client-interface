/**
 * Button Component
 *
 * Provides consistent button styling across the application.
 * PRD Reference: Section 8.4.3 (Button Styles)
 *
 * Features:
 * - Multiple variants: primary, secondary, danger, ghost
 * - Size variants: sm, md, lg
 * - Loading state with spinner
 * - Disabled state
 * - Icon support
 * - Smooth hover/active animations
 * - Accessible (ARIA labels, keyboard navigation)
 */

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
}

/**
 * Base Button Component
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  // Variant styles (PRD Section 8.4.3)
  const variantStyles = {
    primary: 'bg-blue-900 text-white hover:bg-blue-800 active:bg-blue-950 focus:ring-blue-500 shadow-sm hover:shadow-md hover:scale-105 active:scale-95',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 focus:ring-gray-500 shadow-sm hover:shadow',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm hover:shadow-md hover:scale-105 active:scale-95',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500',
  }

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Loading spinner */}
      {isLoading && (
        <Loader2 className={`animate-spin ${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />
      )}

      {/* Left icon */}
      {!isLoading && leftIcon && (
        <span className={`${size === 'sm' ? 'mr-1.5' : 'mr-2'}`}>
          {leftIcon}
        </span>
      )}

      {/* Button text */}
      <span>{children}</span>

      {/* Right icon */}
      {!isLoading && rightIcon && (
        <span className={`${size === 'sm' ? 'ml-1.5' : 'ml-2'}`}>
          {rightIcon}
        </span>
      )}
    </button>
  )
}

/**
 * Icon Button (square button with just an icon)
 */
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: ReactNode
  'aria-label': string
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}: IconButtonProps) {
  const sizeStyles = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon}
    </Button>
  )
}

/**
 * Button Group (for related actions)
 */
interface ButtonGroupProps {
  children: ReactNode
  className?: string
}

export function ButtonGroup({ children, className = '' }: ButtonGroupProps) {
  return (
    <div className={`inline-flex rounded-lg shadow-sm ${className}`} role="group">
      {children}
    </div>
  )
}
