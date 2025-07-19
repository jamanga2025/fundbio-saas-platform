"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LineChartProps {
  data: any[];
  xKey: string;
  yKey: string | string[];
  title?: string;
  colors?: string[];
  height?: number;
  showLegend?: boolean;
}

export default function CustomLineChart({ 
  data, 
  xKey, 
  yKey, 
  title, 
  colors = ["#10B981", "#3B82F6", "#F59E0B"], 
  height = 300,
  showLegend = true 
}: LineChartProps) {
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];
  
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          {showLegend && <Legend />}
          {yKeys.map((key, index) => (
            <Line 
              key={key}
              type="monotone" 
              dataKey={key} 
              stroke={colors[index] || colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[index] || colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}