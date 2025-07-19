"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  title?: string;
  color?: string;
  height?: number;
  showLegend?: boolean;
}

export default function CustomBarChart({ 
  data, 
  xKey, 
  yKey, 
  title, 
  color = "#10B981", 
  height = 300,
  showLegend = false 
}: BarChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
          <Bar 
            dataKey={yKey} 
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}