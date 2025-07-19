"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, Pause, SkipBack, SkipForward, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { monitoring } from '@/lib/monitoring';

interface TemporalDataPoint {
  timestamp: string;
  date: Date;
  value: number;
  indicator: string;
  category: string;
  trend?: number;
  prediction?: number;
}

interface TemporalAnalysisProps {
  data: TemporalDataPoint[];
  timeRange: {
    start: Date;
    end: Date;
  };
  onTimeChange?: (timestamp: string) => void;
  onTrendAnalysis?: (trends: any) => void;
  indicators?: string[];
  autoPlay?: boolean;
  playbackSpeed?: number;
}

interface TimeSliderProps {
  currentTime: Date;
  timeRange: { start: Date; end: Date };
  onTimeChange: (time: Date) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

// Advanced time slider component
function TimeSlider({
  currentTime,
  timeRange,
  onTimeChange,
  isPlaying,
  onPlayPause,
  playbackSpeed,
  onSpeedChange
}: TimeSliderProps) {
  const totalDuration = timeRange.end.getTime() - timeRange.start.getTime();
  const currentPosition = ((currentTime.getTime() - timeRange.start.getTime()) / totalDuration) * 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const position = parseFloat(e.target.value);
    const newTime = new Date(timeRange.start.getTime() + (totalDuration * position / 100));
    onTimeChange(newTime);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const speedOptions = [0.5, 1, 2, 4, 8];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => onTimeChange(timeRange.start)}
            size="sm"
            variant="outline"
            className="p-2"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={onPlayPause}
            size="sm"
            className="p-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            onClick={() => onTimeChange(timeRange.end)}
            size="sm"
            variant="outline"
            className="p-2"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">{formatDate(currentTime)}</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Velocidad:</span>
          <select
            value={playbackSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="text-xs border rounded px-2 py-1"
          >
            {speedOptions.map(speed => (
              <option key={speed} value={speed}>{speed}x</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={currentPosition}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div 
            className="absolute top-0 left-0 h-2 bg-green-500 rounded-lg pointer-events-none"
            style={{ width: `${currentPosition}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatDate(timeRange.start)}</span>
          <span>{formatDate(timeRange.end)}</span>
        </div>
      </div>
    </div>
  );
}

// Trend analysis utilities
class TrendAnalyzer {
  // Calculate linear trend
  static calculateLinearTrend(data: number[]): { slope: number; intercept: number; correlation: number } {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: 0, correlation: 0 };

    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * data[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumYY = data.reduce((acc, yi) => acc + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Correlation coefficient
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return { slope, intercept, correlation };
  }

  // Detect seasonal patterns
  static detectSeasonality(data: TemporalDataPoint[], period: number = 12): number[] {
    const seasonalAverages = new Array(period).fill(0);
    const seasonalCounts = new Array(period).fill(0);

    data.forEach(point => {
      const month = point.date.getMonth();
      const seasonIndex = month % period;
      seasonalAverages[seasonIndex] += point.value;
      seasonalCounts[seasonIndex]++;
    });

    return seasonalAverages.map((sum, i) => 
      seasonalCounts[i] > 0 ? sum / seasonalCounts[i] : 0
    );
  }

  // Simple moving average
  static movingAverage(data: number[], window: number): number[] {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const subset = data.slice(start, i + 1);
      const average = subset.reduce((a, b) => a + b, 0) / subset.length;
      result.push(average);
    }
    return result;
  }

  // Predict future values using linear regression
  static predictValues(data: number[], steps: number): number[] {
    const trend = this.calculateLinearTrend(data);
    const predictions = [];
    const baseIndex = data.length;
    
    for (let i = 0; i < steps; i++) {
      const predicted = trend.slope * (baseIndex + i) + trend.intercept;
      predictions.push(Math.max(0, predicted)); // Ensure non-negative values
    }
    
    return predictions;
  }
}

export default function TemporalAnalysis({
  data,
  timeRange,
  onTimeChange,
  onTrendAnalysis,
  indicators = [],
  autoPlay = false,
  playbackSpeed = 1
}: TemporalAnalysisProps) {
  const [currentTime, setCurrentTime] = useState<Date>(timeRange.start);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(playbackSpeed);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(indicators);
  const [showPredictions, setShowPredictions] = useState(false);
  const [analysisType, setAnalysisType] = useState<'trend' | 'seasonal' | 'comparative'>('trend');

  // Filter and process data
  const processedData = useMemo(() => {
    const filtered = data.filter(point => 
      point.date >= timeRange.start && 
      point.date <= currentTime &&
      (selectedIndicators.length === 0 || selectedIndicators.includes(point.indicator))
    );

    // Group by time period for aggregation
    const grouped = filtered.reduce((acc, point) => {
      const key = point.timestamp;
      if (!acc[key]) {
        acc[key] = {
          timestamp: key,
          date: point.date,
          values: {},
          trends: {},
          predictions: {}
        };
      }
      acc[key].values[point.indicator] = point.value;
      return acc;
    }, {} as any);

    return Object.values(grouped).sort((a: any, b: any) => 
      a.date.getTime() - b.date.getTime()
    );
  }, [data, timeRange, currentTime, selectedIndicators]);

  // Calculate trends and predictions
  const trendAnalysis = useMemo(() => {
    const trends: any = {};
    const predictions: any = {};
    
    selectedIndicators.forEach(indicator => {
      const values = data
        .filter(d => d.indicator === indicator && d.date <= currentTime)
        .map(d => d.value);
      
      if (values.length > 1) {
        trends[indicator] = TrendAnalyzer.calculateLinearTrend(values);
        
        if (showPredictions) {
          predictions[indicator] = TrendAnalyzer.predictValues(values, 6);
        }
      }
    });

    return { trends, predictions };
  }, [data, selectedIndicators, currentTime, showPredictions]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const nextTime = new Date(prev.getTime() + (24 * 60 * 60 * 1000 * speed)); // Add days based on speed
        
        if (nextTime >= timeRange.end) {
          setIsPlaying(false);
          return timeRange.end;
        }
        
        return nextTime;
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, timeRange.end]);

  // Notify parent components of changes
  useEffect(() => {
    onTimeChange?.(currentTime.toISOString());
  }, [currentTime, onTimeChange]);

  useEffect(() => {
    onTrendAnalysis?.(trendAnalysis);
  }, [trendAnalysis, onTrendAnalysis]);

  // Performance monitoring
  useEffect(() => {
    monitoring.recordMetric('temporal_data_points', processedData.length);
    monitoring.recordMetric('temporal_indicators', selectedIndicators.length);
  }, [processedData.length, selectedIndicators.length]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
    monitoring.recordMetric('temporal_play_pause', 1);
  }, [isPlaying]);

  const getTrendIcon = (trend: number) => {
    if (trend > 0.1) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < -0.1) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendLabel = (trend: number) => {
    if (trend > 0.1) return 'Mejorando';
    if (trend < -0.1) return 'Empeorando';
    return 'Estable';
  };

  // Chart data preparation
  const chartData = useMemo(() => {
    return processedData.map((point: any) => {
      const chartPoint: any = {
        date: point.date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        timestamp: point.timestamp
      };
      
      selectedIndicators.forEach(indicator => {
        chartPoint[indicator] = point.values[indicator] || 0;
      });
      
      return chartPoint;
    });
  }, [processedData, selectedIndicators]);

  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Time Control */}
      <TimeSlider
        currentTime={currentTime}
        timeRange={timeRange}
        onTimeChange={setCurrentTime}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        playbackSpeed={speed}
        onSpeedChange={setSpeed}
      />

      {/* Analysis Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Indicadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {indicators.map(indicator => (
                <label key={indicator} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedIndicators.includes(indicator)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIndicators([...selectedIndicators, indicator]);
                      } else {
                        setSelectedIndicators(selectedIndicators.filter(i => i !== indicator));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="truncate">{indicator}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tipo de Análisis</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value as any)}
              className="w-full text-sm border rounded px-2 py-1"
            >
              <option value="trend">Tendencias</option>
              <option value="seasonal">Estacional</option>
              <option value="comparative">Comparativo</option>
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Predicciones</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showPredictions}
                onChange={(e) => setShowPredictions(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Mostrar predicciones</span>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1">
              <div>Datos: {processedData.length} puntos</div>
              <div>Período: {Math.ceil((currentTime.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24))} días</div>
              <div>Indicadores: {selectedIndicators.length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Summary */}
      {selectedIndicators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Tendencias</CardTitle>
            <CardDescription>Estado actual de los indicadores seleccionados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedIndicators.map(indicator => {
                const trend = trendAnalysis.trends[indicator];
                return (
                  <div key={indicator} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm truncate">{indicator}</div>
                      <div className="text-xs text-gray-500">
                        {trend ? getTrendLabel(trend.slope) : 'Sin datos'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {trend && getTrendIcon(trend.slope)}
                      {trend && (
                        <span className="text-xs font-mono">
                          {(trend.correlation * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución Temporal</CardTitle>
          <CardDescription>
            Datos desde {timeRange.start.toLocaleDateString()} hasta {currentTime.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {analysisType === 'trend' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedIndicators.map((indicator, index) => (
                    <Line
                      key={indicator}
                      type="monotone"
                      dataKey={indicator}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              ) : (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedIndicators.map((indicator, index) => (
                    <Area
                      key={indicator}
                      type="monotone"
                      dataKey={indicator}
                      stackId="1"
                      stroke={colors[index % colors.length]}
                      fill={colors[index % colors.length]}
                      fillOpacity={0.6}
                    />
                  ))}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}