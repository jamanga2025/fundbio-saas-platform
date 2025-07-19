"use client";

import { TrendingUp, TrendingDown, Minus, Target, Calendar, MapPin } from 'lucide-react';

interface KPIData {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  previousValue?: string | number;
  target?: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendPercentage?: number;
  category?: string;
  icon?: React.ReactNode;
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
}

interface KPICardsProps {
  data: KPIData[];
  title?: string;
  columns?: number;
}

export default function KPICards({ data, title, columns = 3 }: KPICardsProps) {
  const getColorClasses = (color: string = 'green') => {
    const colorMap = {
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        accent: 'text-green-600',
        icon: 'text-green-500'
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        accent: 'text-blue-600',
        icon: 'text-blue-500'
      },
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-900',
        accent: 'text-yellow-600',
        icon: 'text-yellow-500'
      },
      red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        accent: 'text-red-600',
        icon: 'text-red-500'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-900',
        accent: 'text-purple-600',
        icon: 'text-purple-500'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.green;
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-500" />;
      case 'stable':
        return <Minus size={16} className="text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className="w-full space-y-6">
      {title && (
        <h2 className="text-xl font-bold text-gray-900">
          {title}
        </h2>
      )}
      
      <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-6`}>
        {data.map((kpi) => {
          const colors = getColorClasses(kpi.color);
          
          return (
            <div
              key={kpi.id}
              className={`${colors.bg} ${colors.border} border rounded-lg p-6 hover:shadow-md transition-shadow`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {kpi.icon && (
                    <div className={colors.icon}>
                      {kpi.icon}
                    </div>
                  )}
                  <h3 className={`text-sm font-medium ${colors.text}`}>
                    {kpi.title}
                  </h3>
                </div>
                {kpi.category && (
                  <span className={`text-xs px-2 py-1 rounded-full ${colors.accent} bg-white`}>
                    {kpi.category}
                  </span>
                )}
              </div>

              {/* Value */}
              <div className="mb-4">
                <div className="flex items-baseline space-x-2">
                  <span className={`text-2xl font-bold ${colors.text}`}>
                    {kpi.value}
                  </span>
                  {kpi.unit && (
                    <span className={`text-sm ${colors.accent}`}>
                      {kpi.unit}
                    </span>
                  )}
                </div>
              </div>

              {/* Trend and additional info */}
              <div className="space-y-2">
                {kpi.trend && kpi.trendPercentage && (
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(kpi.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(kpi.trend)}`}>
                      {kpi.trendPercentage > 0 ? '+' : ''}{kpi.trendPercentage}%
                    </span>
                    <span className="text-sm text-gray-500">
                      vs. anterior
                    </span>
                  </div>
                )}

                {kpi.target && (
                  <div className="flex items-center space-x-2">
                    <Target size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Objetivo: {kpi.target} {kpi.unit}
                    </span>
                  </div>
                )}

                {kpi.previousValue && (
                  <div className="flex items-center space-x-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Anterior: {kpi.previousValue} {kpi.unit}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}