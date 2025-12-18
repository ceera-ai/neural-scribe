import './ScanLines.css';

interface ScanLinesProps {
  opacity?: number;
  animate?: boolean;
}

export function ScanLines({ opacity = 0.05, animate = true }: ScanLinesProps) {
  return (
    <div
      className={`scan-lines ${animate ? 'scan-lines--animated' : ''}`}
      style={{ '--scan-opacity': opacity } as React.CSSProperties}
      aria-hidden="true"
    />
  );
}
