'use client'

import { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const pullThreshold = 80;
  const maxPull = 120;

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (window.scrollY === 0 && !isRefreshing) {
        currentY.current = e.touches[0].clientY;
        const distance = currentY.current - startY.current;
        
        if (distance > 0) {
          e.preventDefault();
          const pullDist = Math.min(distance * 0.5, maxPull);
          setPullDistance(pullDist);
          setCanRefresh(pullDist >= pullThreshold);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (canRefresh && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
          setCanRefresh(false);
        }
      } else {
        setPullDistance(0);
        setCanRefresh(false);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canRefresh, isRefreshing, onRefresh]);

  const refreshIconRotation = isRefreshing ? 'infinite' : (pullDistance / pullThreshold) * 360;
  const opacity = Math.min(pullDistance / pullThreshold, 1);

  return (
    <div className="pull-to-refresh-container">
      <div 
        className="pull-indicator"
        style={{
          transform: `translateY(${pullDistance}px)`,
          opacity: opacity
        }}
      >
        <div className="refresh-icon-container">
          <RefreshCw 
            size={24} 
            style={{
              transform: isRefreshing 
                ? 'rotate(0deg)' 
                : `rotate(${refreshIconRotation}deg)`,
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
            }}
          />
        </div>
        <span className="refresh-text">
          {isRefreshing 
            ? 'Refreshing...' 
            : canRefresh 
              ? 'Release to refresh' 
              : 'Pull to refresh'
          }
        </span>
      </div>
      
      <div 
        className="content"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease' : 'none'
        }}
      >
        {children}
      </div>

      <style jsx>{`
        .pull-to-refresh-container {
          position: relative;
          min-height: 100vh;
        }
        
        .pull-indicator {
          position: fixed;
          top: -80px;
          left: 0;
          right: 0;
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          z-index: 999;
          transition: opacity 0.2s ease;
        }
        
        .refresh-icon-container {
          margin-bottom: 8px;
          color: var(--accent-color);
        }
        
        .refresh-text {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .content {
          will-change: transform;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @media (min-width: 769px) {
          .pull-indicator {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
