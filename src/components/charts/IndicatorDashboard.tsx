"use client";

import { useState } from 'react';
import CustomBarChart from './BarChart';
import CustomLineChart from './LineChart';
import CustomPieChart from './PieChart';
import CustomAreaChart from './AreaChart';
import { BarChart3, LineChart, PieChart, AreaChart } from 'lucide-react';

interface IndicatorData {
  id: string;
  name: string;
  category: string;
  unit: string;
  values: {
    year: number;
    value: number;
    target?: number;
  }[];
}

interface IndicatorDashboardProps {
  indicators: IndicatorData[];
  title?: string;
}

type ChartType = 'bar' | 'line' | 'pie' | 'area';

export default function IndicatorDashboard({ indicators, title }: IndicatorDashboardProps) {
  const [selectedIndicator, setSelectedIndicator] = useState<string>(indicators[0]?.id || '');
  const [chartType, setChartType] = useState<ChartType>('line');

  const currentIndicator = indicators.find(ind => ind.id === selectedIndicator);

  // Preparar datos para gráficos temporales
  const temporalData = currentIndicator?.values.map(v => ({
    year: v.year.toString(),
    valor: v.value,
    objetivo: v.target || null
  })) || [];

  // Preparar datos para gráfico de categorías
  const categoryData = indicators.reduce((acc, ind) => {
    const category = ind.category;
    const latestValue = ind.values[ind.values.length - 1]?.value || 0;
    
    const existing = acc.find(item => item.name === category);
    if (existing) {
      existing.value += latestValue;
    } else {
      acc.push({
        name: category,
        value: latestValue
      });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Preparar datos comparativos entre indicadores
  const comparisonData = indicators.slice(0, 5).map(ind => ({
    name: ind.name.substring(0, 20) + (ind.name.length > 20 ? '...' : ''),
    valor: ind.values[ind.values.length - 1]?.value || 0
  }));

  const renderChart = () => {
    if (!currentIndicator) return null;

    switch (chartType) {
      case 'bar':
        return (
          <CustomBarChart
            data={temporalData}
            xKey="year"
            yKey="valor"
            title={`${currentIndicator.name} (${currentIndicator.unit})`}
            height={400}
          />
        );
      
      case 'line':
        return (
          <CustomLineChart
            data={temporalData}
            xKey="year"
            yKey={currentIndicator.values.some(v => v.target) ? ["valor", "objetivo"] : "valor"}
            title={`Evolución: ${currentIndicator.name}`}
            height={400}
          />
        );
      
      case 'pie':
        return (
          <CustomPieChart
            data={categoryData}
            title="Distribución por Categorías"
            height={400}
          />
        );
      
      case 'area':
        return (
          <CustomAreaChart
            data={temporalData}
            xKey="year"
            yKey={currentIndicator.values.some(v => v.target) ? ["valor", "objetivo"] : "valor"}
            title={`Área de Evolución: ${currentIndicator.name}`}
            height={400}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-6">
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          {title}
        </h2>
      )}
      
      {/* Controles */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selector de indicador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Indicador
            </label>
            <select
              value={selectedIndicator}
              onChange={(e) => setSelectedIndicator(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              {indicators.map(indicator => (
                <option key={indicator.id} value={indicator.id}>
                  {indicator.name} ({indicator.category})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de tipo de gráfico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Visualización
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded-md ${chartType === 'line' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                title="Gráfico de Líneas"
              >
                <LineChart size={20} />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded-md ${chartType === 'bar' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                title="Gráfico de Barras"
              >
                <BarChart3 size={20} />
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`p-2 rounded-md ${chartType === 'area' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                title="Gráfico de Área"
              >
                <AreaChart size={20} />
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`p-2 rounded-md ${chartType === 'pie' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                title="Gráfico Circular"
              >
                <PieChart size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Información del indicador actual */}
      {currentIndicator && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">{currentIndicator.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-green-700 font-medium">Categoría:</span>
              <p className="text-green-900">{currentIndicator.category}</p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Unidad:</span>
              <p className="text-green-900">{currentIndicator.unit}</p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Último Valor:</span>
              <p className="text-green-900 font-bold">
                {currentIndicator.values[currentIndicator.values.length - 1]?.value || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Datos Disponibles:</span>
              <p className="text-green-900">{currentIndicator.values.length} años</p>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico principal */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {renderChart()}
      </div>

      {/* Gráfico de comparación */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <CustomBarChart
          data={comparisonData}
          xKey="name"
          yKey="valor"
          title="Comparación entre Indicadores (Últimos Valores)"
          height={300}
          color="#059669"
        />
      </div>
    </div>
  );
}