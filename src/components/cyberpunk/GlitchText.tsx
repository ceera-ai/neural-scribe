import { ReactNode } from 'react'
import './GlitchText.css'

interface GlitchTextProps {
  children: ReactNode
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div'
  className?: string
  intensity?: 'subtle' | 'medium' | 'strong'
  active?: boolean
}

export function GlitchText({
  children,
  as: Component = 'span',
  className = '',
  intensity = 'medium',
  active = true,
}: GlitchTextProps) {
  const text = typeof children === 'string' ? children : ''

  return (
    <Component
      className={`glitch-text glitch-text--${intensity} ${active ? 'glitch-text--active' : ''} ${className}`}
      data-text={text}
    >
      {children}
    </Component>
  )
}
