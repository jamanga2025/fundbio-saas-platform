"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AreaChartProps {
  data: any[];
  xKey: string;
  yKey: string | string[];
  title?: string;
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  stacked?: boolean;
}

export default function CustomAreaChart({ 
  data, 
  xKey, 
  yKey, 
  title, 
  colors = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"], 
  height = 300,
  showLegend = true,
  stacked = false
}: AreaChartProps) {
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600">
              <span 
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}: <span className="font-semibold text-green-600">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            {yKeys.map((key, index) => (
              <linearGradient key={key} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[index]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors[index]} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xKey} 
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {yKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId={stacked ? "1" : undefined}
              stroke={colors[index]}
              strokeWidth={2}
              fill={`url(#gradient-${index})`}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}