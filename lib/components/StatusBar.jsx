'use client'

import { LocationStatus, NetworkStatus } from './LoadingStates';

export default function StatusBar({ locationStatus, locationAccuracy, isOnline }) {
  return (
    <div className="status-bar">
      <LocationStatus status={locationStatus} accuracy={locationAccuracy} />
      <NetworkStatus isOnline={isOnline} />
      
      <style jsx>{`
        .status-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        
        @media (max-width: 640px) {
          .status-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}
