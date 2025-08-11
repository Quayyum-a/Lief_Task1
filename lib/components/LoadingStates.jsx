'use client'

import { Loader2, Clock, MapPin, Wifi, WifiOff } from 'lucide-react';

export function LoadingSpinner({ size = 24, text = "Loading..." }) {
  return (
    <div className="loading-spinner">
      <Loader2 size={size} className="spinner" />
      {text && <span className="loading-text">{text}</span>}
      <style jsx>{`
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 20px;
        }
        
        .spinner {
          animation: spin 1s linear infinite;
          color: var(--accent-color);
        }
        
        .loading-text {
          color: var(--text-secondary);
          font-size: 14px;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header"></div>
      <div className="skeleton-lines">
        <div className="skeleton-line long"></div>
        <div className="skeleton-line medium"></div>
        <div className="skeleton-line short"></div>
      </div>
      <style jsx>{`
        .skeleton-card {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid var(--border-color);
          margin-bottom: 16px;
        }
        
        .skeleton-header {
          height: 20px;
          background: linear-gradient(90deg, var(--border-color) 25%, transparent 50%, var(--border-color) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 16px;
        }
        
        .skeleton-lines {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .skeleton-line {
          height: 16px;
          background: linear-gradient(90deg, var(--border-color) 25%, transparent 50%, var(--border-color) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }
        
        .skeleton-line.long { width: 100%; }
        .skeleton-line.medium { width: 75%; }
        .skeleton-line.short { width: 50%; }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}

export function LocationStatus({ status, accuracy }) {
  const getStatusInfo = () => {
    switch (status) {
      case 'getting':
        return { icon: MapPin, text: 'Getting location...', color: 'var(--accent-color)' };
      case 'success':
        return { icon: MapPin, text: `Location found (±${accuracy}m)`, color: 'var(--success-color)' };
      case 'error':
        return { icon: MapPin, text: 'Location unavailable', color: 'var(--error-color)' };
      default:
        return { icon: MapPin, text: 'Location unknown', color: 'var(--text-secondary)' };
    }
  };

  const { icon: Icon, text, color } = getStatusInfo();

  return (
    <div className="location-status">
      <Icon size={16} />
      <span>{text}</span>
      <style jsx>{`
        .location-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 14px;
          color: ${color};
        }
      `}</style>
    </div>
  );
}

export function NetworkStatus({ isOnline }) {
  return (
    <div className={`network-status ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
      <span>{isOnline ? 'Online' : 'Offline'}</span>
      <style jsx>{`
        .network-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .network-status.online {
          background: rgba(34, 197, 94, 0.1);
          color: var(--success-color);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        
        .network-status.offline {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error-color);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </div>
  );
}

export function ProgressBar({ progress, text }) {
  return (
    <div className="progress-container">
      {text && <div className="progress-text">{text}</div>}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <style jsx>{`
        .progress-container {
          width: 100%;
          margin: 16px 0;
        }
        
        .progress-text {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 8px;
          text-align: center;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--border-color);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: var(--accent-color);
          transition: width 0.3s ease;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
