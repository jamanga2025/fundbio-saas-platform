"use client";

import { useState } from 'react';
import IndicatorDashboard from '@/components/charts/IndicatorDashboard';
import KPICards from '@/components/charts/KPICards';
import CustomBarChart from '@/components/charts/BarChart';
import CustomLineChart from '@/components/charts/LineChart';
import CustomPieChart from '@/components/charts/PieChart';
import CustomAreaChart from '@/components/charts/AreaChart';
import { mockIndicatorData, mockKPIData, mockCategoryData, mockTimeSeriesData } from '@/lib/mockData';
import { Leaf, BarChart3, TrendingUp, Eye, Download, Filter, Map } from 'lucide-react';

export default function VisualizationsPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kpis' | 'charts' | 'comparison' | 'maps'>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard Principal', icon: <BarChart3 size={20} /> },
    { id: 'kpis', label: 'Indicadores Clave', icon: <TrendingUp size={20} /> },
    { id: 'charts', label: 'Gráficos Individuales', icon: <Eye size={20} /> },
    { id: 'comparison', label: 'Comparativas', icon: <Filter size={20} /> },
    { id: 'maps', label: 'Vista Rápida Mapas', icon: <Map size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Leaf className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Visualizaciones - Fundación Biodiversidad
                </h1>
                <p className="text-sm text-gray-600">
                  Dashboard interactivo de indicadores ambientales
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download size={16} className="mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <IndicatorDashboard
              indicators={mockIndicatorData}
              title="Dashboard Principal de Indicadores"
            />
          </div>
        )}

        {activeTab === 'kpis' && (
          <div className="space-y-8">
            <KPICards
              data={mockKPIData}
              title="Indicadores Clave de Rendimiento"
              columns={3}
            />
            
            {/* Gráfico de tendencias generales */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <CustomAreaChart
                data={mockTimeSeriesData}
                xKey="year"
                yKey={["superficie", "conectividad"]}
                title="Tendencias Generales - Superficie y Conectividad"
                colors={["#10B981", "#8B5CF6"]}
                height={350}
                stacked={false}
              />
            </div>
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gráfico de barras */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <CustomBarChart
                  data={mockTimeSeriesData}
                  xKey="year"
                  yKey="superficie"
                  title="Evolución de Superficie Verde"
                  color="#10B981"
                  height={300}
                />
              </div>

              {/* Gráfico circular */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <CustomPieChart
                  data={mockCategoryData}
                  title="Distribución por Categorías"
                  height={300}
                />
              </div>

              {/* Gráfico de líneas */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <CustomLineChart
                  data={mockTimeSeriesData}
                  xKey="year"
                  yKey={["biodiversidad", "conectividad"]}
                  title="Biodiversidad vs Conectividad"
                  colors={["#3B82F6", "#8B5CF6"]}
                  height={300}
                />
              </div>

              {/* Gráfico de área */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <CustomAreaChart
                  data={mockTimeSeriesData}
                  xKey="year"
                  yKey="resiliencia"
                  title="Capacidad de Resiliencia"
                  colors={["#06B6D4"]}
                  height={300}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-8">
            {/* Comparativa multi-indicador */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <CustomLineChart
                data={mockTimeSeriesData}
                xKey="year"
                yKey={["superficie", "biodiversidad", "conectividad", "resiliencia"]}
                title="Comparativa de Todos los Indicadores (Normalizados)"
                colors={["#10B981", "#3B82F6", "#8B5CF6", "#06B6D4"]}
                height={400}
              />
            </div>

            {/* Gráfico apilado */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <CustomAreaChart
                data={mockTimeSeriesData}
                xKey="year"
                yKey={["superficie", "conectividad"]}
                title="Evolución Acumulada - Superficie y Conectividad"
                colors={["#10B981", "#8B5CF6"]}
                height={350}
                stacked={true}
              />
            </div>

            {/* Análisis de objetivos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Progreso hacia Objetivos 2024
                </h3>
                <div className="space-y-4">
                  {mockIndicatorData.map((indicator) => {
                    const latest = indicator.values[indicator.values.length - 1];
                    const progress = latest.target ? (latest.value / latest.target) * 100 : 0;
                    
                    return (
                      <div key={indicator.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {indicator.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Resumen Estadístico
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Indicadores:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {mockIndicatorData.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Años de datos:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {mockIndicatorData[0]?.values.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Indicadores con objetivo:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {mockIndicatorData.filter(i => i.values.some(v => v.target)).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Progreso promedio:</span>
                    <span className="text-sm font-medium text-green-600">
                      {(mockIndicatorData.reduce((acc, indicator) => {
                        const latest = indicator.values[indicator.values.length - 1];
                        const progress = latest.target ? (latest.value / latest.target) * 100 : 0;
                        return acc + progress;
                      }, 0) / mockIndicatorData.length).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maps' && (
          <div className="space-y-6">
            {/* Información sobre cartografía */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Map size={24} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">
                  Análisis Territorial Avanzado
                </h3>
              </div>
              <p className="text-blue-800 mb-4">
                Para visualización completa de mapas interactivos, carga de archivos geoespaciales 
                y análisis territorial detallado, visita la sección de Cartografía.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">🗺️ Mapas Interactivos</h4>
                  <p className="text-sm text-blue-700">
                    Visualización de indicadores sobre mapas con controles de capas, 
                    leyendas dinámicas y análisis espacial.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">📁 Carga de Shapefiles</h4>
                  <p className="text-sm text-blue-700">
                    Sube archivos .zip (Shapefile) o .geojson para visualizar 
                    tus propios datos territoriales.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">🎯 Análisis Multi-escala</h4>
                  <p className="text-sm text-blue-700">
                    Desde nivel municipal hasta proyectos específicos: 
                    distritos, barrios y actuaciones concretas.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">📊 Mapas Coropléticos</h4>
                  <p className="text-sm text-blue-700">
                    Visualización de indicadores mediante gradientes de color 
                    según valores de biodiversidad y resiliencia.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.location.href = '/dashboard/cartografia'}
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Map size={20} className="mr-2" />
                  Ir a Cartografía Completa
                </button>
                
                <button
                  onClick={() => window.location.href = '/dashboard/cartografia?mode=demo'}
                  className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors"
                >
                  <Eye size={20} className="mr-2" />
                  Ver Demostración
                </button>
              </div>
            </div>

            {/* Vista previa de capacidades */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Vista Previa: Capacidades Cartográficas
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Tipos de Geometrías Soportadas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Polígonos (municipios, distritos, proyectos)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span>Puntos (proyectos específicos, equipamientos)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-2 bg-purple-500"></div>
                      <span>Líneas (corredores verdes, rutas)</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Indicadores Territoriales</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• Superficie verde por habitante (m²/hab)</div>
                    <div>• Índice de biodiversidad urbana</div>
                    <div>• Conectividad ecológica (%)</div>
                    <div>• Capacidad de retención de agua (L/m²)</div>
                    <div>• Calidad del aire por zonas (µg/m³)</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Formatos de Exportación</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• GeoJSON (datos + geometrías)</div>
                    <div>• CSV (datos tabulares)</div>
                    <div>• PNG/PDF (mapas estáticos)</div>
                    <div>• Shapefile (formato SIG estándar)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}