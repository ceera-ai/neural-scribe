export interface VoiceCommands {
  send: string[]
  clear: string[]
  cancel: string[]
}

export function detectVoiceCommand(
  text: string,
  voiceCommands: VoiceCommands
): { command: 'send' | 'clear' | 'cancel' | null; cleanedText: string } {
  const normalizedText = text
    .toLowerCase()
    .trim()
    .replace(/[.,!?]+$/, '')

  console.log('[VoiceCommand] Checking text:', `"${text}"`, '-> normalized:', `"${normalizedText}"`)

  // Check for send commands
  for (const phrase of voiceCommands.send) {
    if (normalizedText.endsWith(phrase)) {
      const phraseStart = normalizedText.lastIndexOf(phrase)
      const cleanedText = text
        .slice(0, phraseStart)
        .trim()
        .replace(/[.,!?]+$/, '')
        .trim()
      console.log('[VoiceCommand] DETECTED "send" command, cleaned text:', `"${cleanedText}"`)
      return { command: 'send', cleanedText }
    }
  }

  // Check for clear commands
  for (const phrase of voiceCommands.clear) {
    if (normalizedText.endsWith(phrase) || normalizedText === phrase) {
      console.log('[VoiceCommand] DETECTED "clear" command')
      return { command: 'clear', cleanedText: '' }
    }
  }

  // Check for cancel commands
  for (const phrase of voiceCommands.cancel) {
    if (normalizedText.endsWith(phrase) || normalizedText === phrase) {
      console.log('[VoiceCommand] DETECTED "cancel" command')
      return { command: 'cancel', cleanedText: '' }
    }
  }

  return { command: null, cleanedText: text }
}
