import { useMemo } from 'react'
import './AIOrb.css'

export type OrbState = 'idle' | 'recording' | 'processing' | 'success' | 'error'

interface AIOrbProps {
  state?: OrbState
  size?: 'sm' | 'md' | 'lg' | 'xl'
  audioLevel?: number // 0-1, for audio reactivity
  frequencyData?: Uint8Array | null // Raw frequency data (optional, for future use)
  onClick?: () => void
  className?: string
}

export function AIOrb({
  state = 'idle',
  size = 'lg',
  audioLevel = 0,
  frequencyData = null,
  onClick,
  className = '',
}: AIOrbProps) {
  // Scale the orb based on audio level when recording
  const audioScale = state === 'recording' ? 1 + audioLevel * 0.15 : 1

  // Generate particles
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      delay: i * 0.3,
      duration: 3 + Math.random() * 2,
      size: 2 + Math.random() * 4,
      distance: 60 + Math.random() * 40,
      angle: (360 / 12) * i,
    }))
  }, [])

  return (
    <div
      className={`ai-orb ai-orb--${state} ai-orb--${size} ${onClick ? 'ai-orb--clickable' : ''} ${className}`}
      onClick={onClick}
      style={
        {
          '--audio-scale': audioScale,
          '--audio-level': audioLevel,
        } as React.CSSProperties
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`AI Assistant - ${state}`}
    >
      {/* Outer Glow */}
      <div className="ai-orb__glow" />

      {/* Orbital Rings */}
      <div className="ai-orb__rings">
        <div className="ai-orb__ring ai-orb__ring--1" />
        <div className="ai-orb__ring ai-orb__ring--2" />
        <div className="ai-orb__ring ai-orb__ring--3" />
      </div>

      {/* Particles */}
      <div className="ai-orb__particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="ai-orb__particle"
            style={
              {
                '--particle-delay': `${particle.delay}s`,
                '--particle-duration': `${particle.duration}s`,
                '--particle-size': `${particle.size}px`,
                '--particle-distance': `${particle.distance}%`,
                '--particle-angle': `${particle.angle}deg`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Core Sphere */}
      <div className="ai-orb__core">
        <div className="ai-orb__core-inner" />
        <div className="ai-orb__core-highlight" />
      </div>

      {/* Arc Spectrum (visible during recording) */}
      {state === 'recording' && (
        <div className="ai-orb__arc-spectrum">
          {Array.from({ length: 24 }, (_, i) => {
            // Use frequency data if available
            let barHeight = 4

            if (frequencyData && frequencyData.length > 0) {
              const dataIndex = Math.floor((i / 24) * Math.min(frequencyData.length, 32))
              const freqValue = frequencyData[dataIndex] || 0
              barHeight = 4 + (freqValue / 255) * 36
            } else {
              barHeight = 4 + audioLevel * 30
            }

            return (
              <div
                key={i}
                className="ai-orb__arc-bar"
                style={
                  {
                    '--bar-index': i,
                    '--bar-height': `${barHeight}px`,
                    '--total-bars': 24,
                  } as React.CSSProperties
                }
              />
            )
          })}
        </div>
      )}

      {/* State Indicators */}
      {state === 'processing' && <div className="ai-orb__spinner" />}
      {state === 'success' && <div className="ai-orb__success-burst" />}
      {state === 'error' && <div className="ai-orb__error-icon">!</div>}
    </div>
  )
}
