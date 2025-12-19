import { describe, it, expect } from 'vitest'
import {
  calculateLevelFromXP,
  getRankForLevel,
  getRarityColor,
  DEFAULT_LEVEL_CONFIG,
} from './gamification'

describe('calculateLevelFromXP', () => {
  it('should return level 1 for 0 XP', () => {
    expect(calculateLevelFromXP(0)).toBe(1)
  })

  it('should return level 1 for XP below first level requirement', () => {
    expect(calculateLevelFromXP(50)).toBe(1)
    expect(calculateLevelFromXP(99)).toBe(1)
  })

  it('should return level 2 when reaching 100 XP (baseXP)', () => {
    expect(calculateLevelFromXP(100)).toBe(2)
  })

  it('should return level 3 when reaching 250 XP (100 + 150)', () => {
    // Level 2 requires: 100 * 1.5^0 = 100
    // Level 3 requires: 100 * 1.5^1 = 150
    // Total for level 3: 100 + 150 = 250
    expect(calculateLevelFromXP(250)).toBe(3)
  })

  it('should return level 4 when reaching 475 XP (100 + 150 + 225)', () => {
    // Level 4 requires: 100 * 1.5^2 = 225
    // Total: 100 + 150 + 225 = 475
    expect(calculateLevelFromXP(475)).toBe(4)
  })

  it('should handle large XP values', () => {
    const level = calculateLevelFromXP(10000)
    expect(level).toBeGreaterThanOrEqual(10)
    expect(level).toBeLessThan(20) // With 1.5x growth, should be around level 10-15
  })

  it('should use custom config when provided', () => {
    const customConfig = {
      baseXP: 50,
      growthRate: 2.0,
      ranks: DEFAULT_LEVEL_CONFIG.ranks,
    }

    // With baseXP=50 and growthRate=2.0:
    // Level 2: 50 * 2^0 = 50
    // Level 3: 50 * 2^1 = 100
    // Total for level 3: 50 + 100 = 150
    expect(calculateLevelFromXP(150, customConfig)).toBe(3)
  })

  it('should handle fractional growth rates', () => {
    const config = {
      baseXP: 100,
      growthRate: 1.1,
      ranks: DEFAULT_LEVEL_CONFIG.ranks,
    }

    // Slower progression with 1.1x growth
    const level = calculateLevelFromXP(500, config)
    expect(level).toBeGreaterThan(4)
    expect(level).toBeLessThan(7)
  })

  it('should be deterministic (same XP always returns same level)', () => {
    const xp = 1234
    const level1 = calculateLevelFromXP(xp)
    const level2 = calculateLevelFromXP(xp)
    const level3 = calculateLevelFromXP(xp)

    expect(level1).toBe(level2)
    expect(level2).toBe(level3)
  })

  it('should increase level as XP increases', () => {
    let previousLevel = 1
    for (let xp = 0; xp <= 1000; xp += 100) {
      const currentLevel = calculateLevelFromXP(xp)
      expect(currentLevel).toBeGreaterThanOrEqual(previousLevel)
      previousLevel = currentLevel
    }
  })
})

describe('getRankForLevel', () => {
  it('should return Initiate for level 1', () => {
    const rank = getRankForLevel(1)
    expect(rank.name).toBe('Initiate')
    expect(rank.icon).toBe('🌱')
  })

  it('should return Apprentice for level 5', () => {
    const rank = getRankForLevel(5)
    expect(rank.name).toBe('Apprentice')
  })

  it('should return Scribe for level 10', () => {
    const rank = getRankForLevel(10)
    expect(rank.name).toBe('Scribe')
  })

  it('should return highest rank for level 100+', () => {
    const rank = getRankForLevel(100)
    expect(rank.name).toBe('Singularity')
    expect(rank.icon).toBe('🌌')
  })

  it('should return same rank for levels in between milestones', () => {
    // Levels 5-9 should all be "Apprentice"
    expect(getRankForLevel(5).name).toBe('Apprentice')
    expect(getRankForLevel(6).name).toBe('Apprentice')
    expect(getRankForLevel(9).name).toBe('Apprentice')
  })

  it('should use default config when not provided', () => {
    const rank = getRankForLevel(1)
    expect(rank).toBeDefined()
    expect(rank.minLevel).toBeLessThanOrEqual(1)
  })
})

describe('getRarityColor', () => {
  it('should return correct color for common rarity', () => {
    expect(getRarityColor('common')).toBe('#a0a0a0')
  })

  it('should return correct color for uncommon rarity', () => {
    expect(getRarityColor('uncommon')).toBe('#00ff88')
  })

  it('should return correct color for rare rarity', () => {
    expect(getRarityColor('rare')).toBe('#00aaff')
  })

  it('should return correct color for epic rarity', () => {
    expect(getRarityColor('epic')).toBe('#aa00ff')
  })

  it('should return correct color for legendary rarity', () => {
    expect(getRarityColor('legendary')).toBe('#ffaa00')
  })

  it('should return white for unknown rarity', () => {
    expect(getRarityColor('unknown' as any)).toBe('#ffffff')
  })

  it('should return colors in hex format', () => {
    const colors = [
      getRarityColor('common'),
      getRarityColor('uncommon'),
      getRarityColor('rare'),
      getRarityColor('epic'),
      getRarityColor('legendary'),
    ]

    colors.forEach((color) => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/)
    })
  })
})
