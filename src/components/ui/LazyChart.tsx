"use client";

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { ChartSkeleton } from './SkeletonLoader';

// Lazy load chart components
const AreaChart = lazy(() => import('../charts/AreaChart'));
const BarChart = lazy(() => import('../charts/BarChart'));
const LineChart = lazy(() => import('../charts/LineChart'));
const PieChart = lazy(() => import('../charts/PieChart'));

interface LazyChartProps {
  type: 'area' | 'bar' | 'line' | 'pie';
  data: any[];
  title?: string;
  className?: string;
  height?: number;
  width?: number;
  options?: any;
  loading?: boolean;
  error?: string | null;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  xKey?: string;
  yKey?: string | string[];
  colors?: string[];
  showLegend?: boolean;
  stacked?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export default function LazyChart({
  type,
  data,
  title,
  className = '',
  xKey = 'x',
  yKey = 'y',
  colors,
  showLegend = true,
  stacked = false,
  innerRadius = 0,
  outerRadius = 100,
  height = 300,
  width,
  options = {},
  loading = false,
  error = null,
  onLoad,
  onError
}: LazyChartProps) {
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`chart-${type}-${Math.random()}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [type]);

  const handleChartLoad = () => {
    if (onLoad) {
      onLoad();
    }
  };

  const handleChartError = (error: Error) => {
    setHasError(true);
    if (onError) {
      onError(error);
    }
  };

  const renderChart = () => {
    const commonProps = {
      data,
      title,
      height,
      width,
      options,
      className,
      onLoad: handleChartLoad,
      onError: handleChartError,
      xKey,
      yKey,
      colors,
      showLegend,
      stacked,
      innerRadius,
      outerRadius
    };

    switch (type) {
      case 'area':
        return <AreaChart {...commonProps} />;
      case 'bar':
        return <BarChart {...commonProps} yKey={Array.isArray(yKey) ? yKey[0] : yKey} />;
      case 'line':
        return <LineChart {...commonProps} />;
      case 'pie':
        return <PieChart {...commonProps} />;
      default:
        return null;
    }
  };

  const ErrorState = () => (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}>
      <div className="text-red-400 mb-2">
        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-red-900 mb-2">Error al cargar el gráfico</h3>
      <p className="text-sm text-red-700 mb-4">
        {error || 'No se pudo cargar el gráfico. Por favor, intenta de nuevo.'}
      </p>
      <button
        onClick={() => {
          setHasError(false);
          setIsInView(false);
          setTimeout(() => setIsInView(true), 100);
        }}
        className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Reintentar
      </button>
    </div>
  );

  const EmptyState = () => (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
      <div className="text-gray-400 mb-2">
        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos disponibles</h3>
      <p className="text-sm text-gray-600">
        No hay datos para mostrar en este gráfico en este momento.
      </p>
    </div>
  );

  // Si hay error, mostrar estado de error
  if (hasError || error) {
    return <ErrorState />;
  }

  // Si no hay datos, mostrar estado vacío
  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div 
      id={`chart-${type}-${Math.random()}`}
      className={`relative ${className}`}
      style={{ height: `${height}px` }}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 px-4">
          {title}
        </h3>
      )}
      
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <ChartSkeleton />
        </div>
      )}

      {!isInView ? (
        <ChartSkeleton />
      ) : (
        <Suspense fallback={<ChartSkeleton />}>
          {renderChart()}
        </Suspense>
      )}
    </div>
  );
}

// Hook personalizado para manejar datos de gráficos
export const useChartData = (initialData: any[] = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateData = async (newData: any[] | (() => Promise<any[]>)) => {
    setLoading(true);
    setError(null);

    try {
      const result = typeof newData === 'function' ? await newData() : newData;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, updateData };
};

// Componente wrapper para múltiples gráficos
export const ChartGrid = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`grid gap-6 ${className}`}>
    {children}
  </div>
);

// Preset de gráficos comunes para el dashboard de biodiversidad
export const BiodiversityCharts = {
  SpeciesDistribution: (props: Omit<LazyChartProps, 'type'>) => (
    <LazyChart type="pie" title="Distribución de Especies" {...props} />
  ),
  
  ConservationTrends: (props: Omit<LazyChartProps, 'type'>) => (
    <LazyChart type="line" title="Tendencias de Conservación" {...props} />
  ),
  
  HabitatCoverage: (props: Omit<LazyChartProps, 'type'>) => (
    <LazyChart type="area" title="Cobertura de Hábitats" {...props} />
  ),
  
  IndicatorComparison: (props: Omit<LazyChartProps, 'type'>) => (
    <LazyChart type="bar" title="Comparación de Indicadores" {...props} />
  )
};