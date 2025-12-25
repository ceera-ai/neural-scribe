import { ButtonHTMLAttributes, ReactNode } from 'react'
import './CyberButton.css'

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  glowing?: boolean
  loading?: boolean
}

export function CyberButton({
  children,
  variant = 'primary',
  size = 'md',
  glowing = false,
  loading = false,
  className = '',
  disabled,
  ...props
}: CyberButtonProps) {
  const classes = [
    'cyber-button',
    `cyber-button--${variant}`,
    `cyber-button--${size}`,
    glowing && 'cyber-button--glowing',
    loading && 'cyber-button--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      <span className="cyber-button__content">
        {loading && <span className="cyber-button__spinner" />}
        {children}
      </span>
      <span className="cyber-button__glitch" aria-hidden="true">
        {children}
      </span>
      <span className="cyber-button__border" />
    </button>
  )
}
