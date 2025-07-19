"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Indicator {
  id: string;
  name: string;
  description: string;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

interface IndicatorValue {
  id: string;
  year: number;
  value: number;
  city: {
    id: string;
    name: string;
  };
  indicator: {
    id: string;
    name: string;
    unit: string;
  };
}

export default function IndicatorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [indicatorValues, setIndicatorValues] = useState<IndicatorValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit: ""
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/auth/signin");
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchIndicators();
    }
  }, [session]);

  useEffect(() => {
    if (selectedIndicator) {
      fetchIndicatorValues();
    }
  }, [selectedIndicator]);

  const fetchIndicators = async () => {
    try {
      const response = await fetch("/api/indicators");
      if (response.ok) {
        const data = await response.json();
        setIndicators(data);
        if (data.length > 0) {
          setSelectedIndicator(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching indicators:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIndicatorValues = async () => {
    try {
      const response = await fetch(`/api/indicator-values?indicatorId=${selectedIndicator}`);
      if (response.ok) {
        const data = await response.json();
        setIndicatorValues(data);
      }
    } catch (error) {
      console.error("Error fetching indicator values:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (session?.user?.role !== "FUNDACION") {
      alert("Solo la Fundación puede crear/editar indicadores");
      return;
    }

    try {
      const url = editingIndicator ? `/api/indicators/${editingIndicator.id}` : "/api/indicators";
      const method = editingIndicator ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchIndicators();
        setShowForm(false);
        setEditingIndicator(null);
        setFormData({ name: "", description: "", unit: "" });
      }
    } catch (error) {
      console.error("Error saving indicator:", error);
    }
  };

  const handleEdit = (indicator: Indicator) => {
    if (session?.user?.role !== "FUNDACION") {
      alert("Solo la Fundación puede editar indicadores");
      return;
    }
    
    setEditingIndicator(indicator);
    setFormData({
      name: indicator.name,
      description: indicator.description,
      unit: indicator.unit
    });
    setShowForm(true);
  };

  const handleDelete = async (indicatorId: string) => {
    if (session?.user?.role !== "FUNDACION") {
      alert("Solo la Fundación puede eliminar indicadores");
      return;
    }

    if (confirm("¿Está seguro de eliminar este indicador? Se perderán todos los datos asociados.")) {
      try {
        const response = await fetch(`/api/indicators/${indicatorId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          await fetchIndicators();
        }
      } catch (error) {
        console.error("Error deleting indicator:", error);
      }
    }
  };

  const getValuesByYear = () => {
    const valuesByYear: { [key: number]: IndicatorValue[] } = {};
    
    indicatorValues.forEach(value => {
      if (!valuesByYear[value.year]) {
        valuesByYear[value.year] = [];
      }
      valuesByYear[value.year].push(value);
    });
    
    return valuesByYear;
  };

  const selectedIndicatorData = indicators.find(i => i.id === selectedIndicator);
  const valuesByYear = getValuesByYear();

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

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
                {session.user.role === "FUNDACION" ? "Gestión de Indicadores" : "Mis Indicadores"}
              </h1>
            </div>
            {session.user.role === "FUNDACION" && (
              <div className="flex items-center">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  + Nuevo Indicador
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Form Modal */}
          {showForm && session.user.role === "FUNDACION" && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingIndicator ? "Editar Indicador" : "Nuevo Indicador"}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre del Indicador
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Descripción
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Unidad de Medida
                      </label>
                      <input
                        type="text"
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="ej: kg, %, m², etc."
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setEditingIndicator(null);
                          setFormData({ name: "", description: "", unit: "" });
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                      >
                        {editingIndicator ? "Actualizar" : "Crear"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Indicators List */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Lista de Indicadores
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Selecciona un indicador para ver sus datos
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <div className="max-h-96 overflow-y-auto">
                    {indicators.map((indicator) => (
                      <div
                        key={indicator.id}
                        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                          selectedIndicator === indicator.id ? 'bg-green-50 border-green-200' : ''
                        }`}
                        onClick={() => setSelectedIndicator(indicator.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {indicator.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Unidad: {indicator.unit}
                            </p>
                            {indicator.description && (
                              <p className="text-xs text-gray-600 mt-1">
                                {indicator.description}
                              </p>
                            )}
                          </div>
                          {session.user.role === "FUNDACION" && (
                            <div className="flex space-x-2 ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(indicator);
                                }}
                                className="text-indigo-600 hover:text-indigo-900 text-xs"
                              >
                                Editar
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(indicator.id);
                                }}
                                className="text-red-600 hover:text-red-900 text-xs"
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Indicator Details */}
            <div className="lg:col-span-2">
              {selectedIndicatorData ? (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedIndicatorData.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedIndicatorData.description}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Unidad:</span> {selectedIndicatorData.unit}
                    </p>
                  </div>
                  <div className="border-t border-gray-200">
                    <div className="p-4">
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Datos por Año
                      </h4>
                      
                      {Object.keys(valuesByYear).length > 0 ? (
                        <div className="space-y-6">
                          {years.map(year => (
                            <div key={year} className="border rounded-lg p-4">
                              <h5 className="text-sm font-medium text-gray-900 mb-3">
                                Año {year}
                              </h5>
                              {valuesByYear[year] ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {valuesByYear[year].map(value => (
                                    <div key={value.id} className="bg-gray-50 rounded p-3">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-900">
                                          {value.city.name}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                          {value.value} {selectedIndicatorData.unit}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  No hay datos para este año
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            No hay datos disponibles para este indicador
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg">
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      Selecciona un indicador para ver sus detalles
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}