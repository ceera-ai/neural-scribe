import { useRef, useEffect } from 'react'
import type { Achievement } from '../../types/gamification'
import { getRarityColor } from '../../types/gamification'

interface AchievementShareCardProps {
  achievement: Achievement
  onExport: (blob: Blob) => void
}

export function AchievementShareCard({ achievement, onExport }: AchievementShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size (optimal for social media)
    canvas.width = 1200
    canvas.height = 630

    // Draw background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 630)
    bgGradient.addColorStop(0, '#0a1428')
    bgGradient.addColorStop(1, '#140a28')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, 1200, 630)

    // Draw border glow
    const rarityColor = getRarityColor(achievement.rarity)
    ctx.strokeStyle = rarityColor
    ctx.lineWidth = 4
    ctx.shadowColor = rarityColor
    ctx.shadowBlur = 20
    ctx.strokeRect(20, 20, 1160, 590)
    ctx.shadowBlur = 0

    // Draw "Achievement Unlocked!" header
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 32px "Share Tech Mono", monospace'
    ctx.textAlign = 'center'
    ctx.fillText('🏆 Achievement Unlocked!', 600, 80)

    // Draw achievement card background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.fillRect(150, 120, 900, 360)

    // Draw achievement icon (as text since we're using emojis)
    ctx.font = '128px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(achievement.icon, 300, 280)

    // Draw achievement name
    ctx.font = 'bold 48px "Share Tech Mono", monospace'
    ctx.fillStyle = rarityColor
    ctx.textAlign = 'left'
    ctx.fillText(achievement.name, 450, 220)

    // Draw achievement description
    ctx.font = '24px Arial'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.fillText(achievement.description, 450, 270)

    // Draw rarity badge
    ctx.font = 'bold 18px "Share Tech Mono", monospace'
    ctx.fillStyle = rarityColor
    const rarityText = achievement.rarity.toUpperCase()
    const rarityWidth = ctx.measureText(rarityText).width
    ctx.fillRect(450, 300, rarityWidth + 40, 40)
    ctx.fillStyle = '#0a1428'
    ctx.fillText(rarityText, 470, 325)

    // Draw unlock date
    if (achievement.unlockedAt) {
      const date = new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
      ctx.font = '18px Arial'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.textAlign = 'left'
      ctx.fillText(`Earned: ${date}`, 450, 380)
    }

    // Draw XP reward
    ctx.font = 'bold 20px "Share Tech Mono", monospace'
    ctx.fillStyle = '#ffaa00'
    ctx.fillText(`⭐ +${achievement.xpReward} XP`, 450, 420)

    // Draw branding
    ctx.font = 'bold 24px "Share Tech Mono", monospace'
    ctx.fillStyle = '#00e5ff'
    ctx.textAlign = 'center'
    ctx.fillText('Neural Scribe', 600, 540)

    ctx.font = '16px Arial'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fillText('AI-Powered Voice Transcription', 600, 570)

    // Export as PNG
    canvas.toBlob((blob) => {
      if (blob) {
        onExport(blob)
      }
    }, 'image/png')
  }, [achievement, onExport])

  return <canvas ref={canvasRef} style={{ display: 'none' }} />
}

// Helper function to download the achievement card
export function downloadAchievementCard(achievement: Achievement): void {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = 1200
  canvas.height = 630

  // Draw background gradient
  const bgGradient = ctx.createLinearGradient(0, 0, 1200, 630)
  bgGradient.addColorStop(0, '#0a1428')
  bgGradient.addColorStop(1, '#140a28')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, 1200, 630)

  // Draw border glow
  const rarityColor = getRarityColor(achievement.rarity)
  ctx.strokeStyle = rarityColor
  ctx.lineWidth = 4
  ctx.shadowColor = rarityColor
  ctx.shadowBlur = 20
  ctx.strokeRect(20, 20, 1160, 590)
  ctx.shadowBlur = 0

  // Draw "Achievement Unlocked!" header
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 32px "Share Tech Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('🏆 Achievement Unlocked!', 600, 80)

  // Draw achievement card background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
  ctx.fillRect(150, 120, 900, 360)

  // Draw achievement icon
  ctx.font = '128px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(achievement.icon, 300, 280)

  // Draw achievement name
  ctx.font = 'bold 48px "Share Tech Mono", monospace'
  ctx.fillStyle = rarityColor
  ctx.textAlign = 'left'
  ctx.fillText(achievement.name, 450, 220)

  // Draw achievement description
  ctx.font = '24px Arial'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.fillText(achievement.description, 450, 270)

  // Draw rarity badge
  ctx.font = 'bold 18px "Share Tech Mono", monospace'
  ctx.fillStyle = rarityColor
  const rarityText = achievement.rarity.toUpperCase()
  const rarityWidth = ctx.measureText(rarityText).width
  ctx.fillRect(450, 300, rarityWidth + 40, 40)
  ctx.fillStyle = '#0a1428'
  ctx.fillText(rarityText, 470, 325)

  // Draw unlock date
  if (achievement.unlockedAt) {
    const date = new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    ctx.font = '18px Arial'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.textAlign = 'left'
    ctx.fillText(`Earned: ${date}`, 450, 380)
  }

  // Draw XP reward
  ctx.font = 'bold 20px "Share Tech Mono", monospace'
  ctx.fillStyle = '#ffaa00'
  ctx.fillText(`⭐ +${achievement.xpReward} XP`, 450, 420)

  // Draw branding
  ctx.font = 'bold 24px "Share Tech Mono", monospace'
  ctx.fillStyle = '#00e5ff'
  ctx.textAlign = 'center'
  ctx.fillText('Neural Scribe', 600, 540)

  ctx.font = '16px Arial'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.fillText('AI-Powered Voice Transcription', 600, 570)

  // Download
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `achievement-${achievement.id}-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    }
  }, 'image/png')
}
