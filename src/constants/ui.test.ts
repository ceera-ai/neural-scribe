import { describe, it, expect } from 'vitest'
import { UI } from './ui'

describe('UI Constants', () => {
  it('should define pagination constants', () => {
    expect(UI.HISTORY_PAGE_SIZE).toBe(10)
    expect(UI.HISTORY_MAX_ENTRIES).toBe(500)
  })

  it('should define audio analysis constants', () => {
    expect(UI.AUDIO_FFT_SIZE).toBe(128)
    expect(UI.AUDIO_SMOOTHING).toBe(0.3)
    expect(UI.AUDIO_MIN_DECIBELS).toBe(-90)
    expect(UI.AUDIO_MAX_DECIBELS).toBe(-10)
  })

  it('should define overlay constants', () => {
    expect(UI.OVERLAY_MAX_LINE_CHARS).toBe(90)
    expect(UI.OVERLAY_HEIGHT_PERCENT).toBe(0.6)
    expect(UI.OVERLAY_DEFAULT_WIDTH).toBe(600)
  })

  it('should define animation timing constants', () => {
    expect(UI.ANIMATION_DURATION_MS).toBe(350)
    expect(UI.TOAST_DURATION_MS).toBe(3000)
    expect(UI.ACHIEVEMENT_POPUP_DURATION_MS).toBe(5000)
  })

  it('should define formatting constants', () => {
    expect(UI.MIN_WORDS_FOR_FORMATTING).toBe(15)
  })

  it('should define recording limits', () => {
    expect(UI.MAX_RECORDING_DURATION_MS).toBe(3600000) // 1 hour
    expect(UI.MAX_TRANSCRIPT_LENGTH).toBe(100000)
  })

  it('should have all expected properties', () => {
    // Verify all expected constants are present
    expect(UI).toHaveProperty('HISTORY_PAGE_SIZE')
    expect(UI).toHaveProperty('AUDIO_FFT_SIZE')
    expect(UI).toHaveProperty('OVERLAY_MAX_LINE_CHARS')
    expect(UI).toHaveProperty('ANIMATION_DURATION_MS')
    expect(UI).toHaveProperty('MIN_WORDS_FOR_FORMATTING')
    expect(UI).toHaveProperty('MAX_RECORDING_DURATION_MS')
  })
})
