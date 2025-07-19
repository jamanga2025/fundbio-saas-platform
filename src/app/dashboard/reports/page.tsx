"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ReportData {
  indicator: {
    id: string;
    name: string;
    unit: string;
    description: string;
  };
  cities: {
    id: string;
    name: string;
    geoEntity: {
      name: string;
      type: string;
    };
    values: {
      year: number;
      value: number;
    }[];
  }[];
}

interface City {
  id: string;
  name: string;
  geoEntity: {
    name: string;
    type: string;
  };
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedIndicator, setSelectedIndicator] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/auth/signin");
    if (session?.user?.role !== "FUNDACION") router.push("/dashboard");
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.role === "FUNDACION") {
      fetchReportData();
      fetchCities();
    }
  }, [session, selectedYear]);

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/reports?year=${selectedYear}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch("/api/cities");
      if (response.ok) {
        const data = await response.json();
        setCities(data);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const exportToCSV = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const csvContent = generateCSVContent(filteredData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `reporte_indicadores_${selectedYear}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateCSVContent = (data: ReportData[]) => {
    const headers = ["Indicador", "Unidad", "Ciudad", "Comunidad Autónoma", "Año", "Valor"];
    const rows = [headers];

    data.forEach(item => {
      item.cities.forEach(city => {
        city.values.forEach(value => {
          if (value.year === selectedYear) {
            rows.push([
              item.indicator.name,
              item.indicator.unit,
              city.name,
              city.geoEntity.name,
              value.year.toString(),
              value.value.toString()
            ]);
          }
        });
      });
    });

    return rows.map(row => row.join(",")).join("\n");
  };

  const getFilteredData = () => {
    let filtered = reportData;

    if (selectedIndicator) {
      filtered = filtered.filter(item => item.indicator.id === selectedIndicator);
    }

    if (selectedCity) {
      filtered = filtered.map(item => ({
        ...item,
        cities: item.cities.filter(city => city.id === selectedCity)
      })).filter(item => item.cities.length > 0);
    }

    return filtered;
  };

  const getStatistics = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) return null;

    const stats = filteredData.map(item => {
      const allValues = item.cities.flatMap(city => 
        city.values.filter(v => v.year === selectedYear).map(v => v.value)
      );

      if (allValues.length === 0) return null;

      const min = Math.min(...allValues);
      const max = Math.max(...allValues);
      const avg = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;

      return {
        indicator: item.indicator.name,
        unit: item.indicator.unit,
        count: allValues.length,
        min,
        max,
        avg: Math.round(avg * 100) / 100
      };
    }).filter((stat): stat is NonNullable<typeof stat> => stat !== null);

    return stats;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "FUNDACION") {
    return null;
  }

  const filteredData = getFilteredData();
  const statistics = getStatistics();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Volver al Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Reportes y Análisis
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Exportar CSV
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indicador
                </label>
                <select
                  value={selectedIndicator}
                  onChange={(e) => setSelectedIndicator(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Todos los indicadores</option>
                  {reportData.map(item => (
                    <option key={item.indicator.id} value={item.indicator.id}>
                      {item.indicator.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Todas las ciudades</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedIndicator("");
                    setSelectedCity("");
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {statistics && statistics.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Estadísticas para {selectedYear}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statistics.map((stat, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{stat.indicator}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ciudades:</span>
                        <span className="font-medium">{stat.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mínimo:</span>
                        <span className="font-medium">{stat.min} {stat.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Máximo:</span>
                        <span className="font-medium">{stat.max} {stat.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Promedio:</span>
                        <span className="font-medium">{stat.avg} {stat.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Datos de Indicadores - {selectedYear}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {filteredData.length} indicador(es) mostrados
              </p>
            </div>
            
            <div className="overflow-x-auto">
              {filteredData.length > 0 ? (
                <div className="space-y-6 p-6">
                  {filteredData.map((item) => (
                    <div key={item.indicator.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {item.indicator.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {item.indicator.description}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Unidad:</span> {item.indicator.unit}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {item.cities.map((city) => {
                          const yearValue = city.values.find(v => v.year === selectedYear);
                          return (
                            <div key={city.id} className="bg-gray-50 rounded p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h5 className="font-medium text-gray-900">{city.name}</h5>
                                  <p className="text-xs text-gray-500">
                                    {city.geoEntity.name}
                                  </p>
                                </div>
                                <div className="text-right">
                                  {yearValue ? (
                                    <span className="text-lg font-semibold text-green-600">
                                      {yearValue.value}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">Sin datos</span>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    {item.indicator.unit}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No hay datos disponibles para los filtros seleccionados
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}