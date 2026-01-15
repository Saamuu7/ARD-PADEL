import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  hideTotal?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, label, hideTotal }) => {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const isFull = current >= total;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{label}</span>
          <span className={`text-lg font-black uppercase tracking-tighter ${isFull ? 'text-primary' : 'text-white'}`}>
            {current} {!hideTotal && <><span className="text-white/20">/</span> {total}</>}
          </span>
        </div>
      )}
      <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
        <div
          className={`h-full progress-bar-fill relative ${isFull ? 'shadow-[0_0_20px_rgba(25,231,142,0.5)]' : ''}`}
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))'
          }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse opacity-30" />
        </div>
      </div>
      {isFull && (
        <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-2 flex items-center gap-2 animate-fade-in">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
          Capacidad máxima alcanzada
        </p>
      )}
    </div>
  );
};

export default ProgressBar;
