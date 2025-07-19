"use client";

import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  width?: string;
  height?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'chart' | 'map';
  lines?: number;
  children?: React.ReactNode;
}

export default function SkeletonLoader({
  className = '',
  width = '100%',
  height = '20px',
  variant = 'text',
  lines = 1,
  children
}: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'rounded h-4';
      case 'rectangular':
        return 'rounded-lg';
      case 'circular':
        return 'rounded-full';
      case 'chart':
        return 'rounded-lg flex items-center justify-center';
      case 'map':
        return 'rounded-lg flex items-center justify-center';
      default:
        return 'rounded';
    }
  };

  const getContent = () => {
    switch (variant) {
      case 'chart':
        return (
          <div className="text-gray-400 dark:text-gray-500">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="mt-2 text-sm">Cargando gráfico...</p>
          </div>
        );
      case 'map':
        return (
          <div className="text-gray-400 dark:text-gray-500">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="mt-2 text-sm">Cargando mapa...</p>
          </div>
        );
      default:
        return children;
    }
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()}`}
            style={{ 
              width: index === lines - 1 ? '75%' : width,
              height 
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="Cargando contenido"
    >
      {getContent()}
    </div>
  );
}

// Componentes específicos para diferentes tipos de skeleton
export const TextSkeleton = ({ lines = 3, className = '' }) => (
  <SkeletonLoader variant="text" lines={lines} className={className} />
);

export const CardSkeleton = ({ className = '' }) => (
  <div className={`border border-gray-200 rounded-lg p-6 ${className}`}>
    <SkeletonLoader variant="rectangular" height="20px" className="mb-4" />
    <TextSkeleton lines={2} />
    <SkeletonLoader variant="rectangular" height="32px" width="120px" className="mt-4" />
  </div>
);

export const ChartSkeleton = ({ className = '' }) => (
  <SkeletonLoader variant="chart" height="300px" className={className} />
);

export const MapSkeleton = ({ className = '' }) => (
  <SkeletonLoader variant="map" height="400px" className={className} />
);

export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
    {/* Header */}
    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonLoader key={index} variant="text" height="16px" width="100px" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonLoader key={colIndex} variant="text" height="16px" width="120px" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);