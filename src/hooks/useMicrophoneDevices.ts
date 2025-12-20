import { useState, useEffect, useCallback } from 'react'

interface UseMicrophoneDevicesReturn {
  devices: MediaDeviceInfo[]
  selectedDeviceId: string | null
  setSelectedDeviceId: (deviceId: string | null) => void
  permissionGranted: boolean
  permissionError: string | null
  refreshDevices: () => Promise<void>
}

export const useMicrophoneDevices = (): UseMicrophoneDevicesReturn => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceIdState] = useState<string | null>(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)

  const enumerateDevices = useCallback(async () => {
    try {
      // Request permission first (required to get device labels)
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setPermissionGranted(true)
      setPermissionError(null)

      // Get all devices
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = allDevices.filter((d) => d.kind === 'audioinput')
      setDevices(audioInputs)

      // Load saved selection from settings
      try {
        const settings = await window.electronAPI.getSettings()
        if (settings.selectedMicrophoneId) {
          // Verify the saved device still exists
          const deviceExists = audioInputs.some((d) => d.deviceId === settings.selectedMicrophoneId)
          if (deviceExists) {
            setSelectedDeviceIdState(settings.selectedMicrophoneId)
          }
        }
      } catch (err) {
        console.error('Failed to load saved microphone selection:', err)
      }
    } catch (err) {
      console.error('Failed to enumerate microphone devices:', err)
      setPermissionGranted(false)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setPermissionError(
            'Microphone permission denied. Please allow access in System Preferences.'
          )
        } else {
          setPermissionError(err.message)
        }
      }
    }
  }, [])

  const setSelectedDeviceId = useCallback(async (deviceId: string | null) => {
    setSelectedDeviceIdState(deviceId)
    // Save to settings
    try {
      await window.electronAPI.setSettings({ selectedMicrophoneId: deviceId })
    } catch (err) {
      console.error('Failed to save microphone selection:', err)
    }
  }, [])

  const refreshDevices = useCallback(async () => {
    await enumerateDevices()
  }, [enumerateDevices])

  // Initial enumeration
  useEffect(() => {
    enumerateDevices()

    // Listen for device changes
    const handleDeviceChange = () => {
      enumerateDevices()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [enumerateDevices])

  return {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    permissionGranted,
    permissionError,
    refreshDevices,
  }
}
