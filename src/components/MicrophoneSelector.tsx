import { useMicrophoneDevices } from '../hooks/useMicrophoneDevices';
import './MicrophoneSelector.css';

interface MicrophoneSelectorProps {
  disabled?: boolean;
}

export function MicrophoneSelector({ disabled }: MicrophoneSelectorProps) {
  const {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    permissionGranted,
    permissionError,
    refreshDevices
  } = useMicrophoneDevices();

  if (permissionError) {
    return (
      <div className="mic-selector-container">
        <label className="mic-label">Microphone</label>
        <div className="mic-error">{permissionError}</div>
        <button onClick={refreshDevices} className="mic-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!permissionGranted) {
    return (
      <div className="mic-selector-container">
        <label className="mic-label">Microphone</label>
        <div className="mic-loading">Requesting microphone access...</div>
      </div>
    );
  }

  return (
    <div className="mic-selector-container">
      <label className="mic-label" htmlFor="mic-select">Microphone</label>
      <select
        id="mic-select"
        value={selectedDeviceId || ''}
        onChange={(e) => setSelectedDeviceId(e.target.value || null)}
        className="mic-select"
        disabled={disabled}
      >
        <option value="">Default Microphone</option>
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
          </option>
        ))}
      </select>
    </div>
  );
}
