"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface IndicadorGeneral {
  id: string;
  codigo: string;
  categoria_prefijo: string;
  indicador: string;
  escala: string;
  unidad: string;
  valores: any[];
}

interface IndicadorEstrategico {
  id: string;
  codigo: string;
  indicador: string;
  escala: string;
  unidad: string;
  valores: any[];
}

interface IndicadorSeguimiento {
  id: string;
  codigo: string;
  indicador: string;
  escala: string;
  unidad: string;
  valores: any[];
}

export default function IndicadoresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [indicadoresGenerales, setIndicadoresGenerales] = useState<IndicadorGeneral[]>([]);
  const [indicadoresEstrategicos, setIndicadoresEstrategicos] = useState<IndicadorEstrategico[]>([]);
  const [indicadoresSeguimiento, setIndicadoresSeguimiento] = useState<IndicadorSeguimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generales' | 'estrategicos' | 'seguimiento'>('generales');

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/auth/signin");
    
    fetchIndicadores();
  }, [session, status, router]);

  const fetchIndicadores = async () => {
    try {
      // Para ayuntamientos, filtrar por su proyecto
      const proyectoParam = session?.user?.role === "AYUNTAMIENTO" && session?.user?.proyectoId 
        ? `?proyecto_id=${session.user.proyectoId}` 
        : '';

      const [generalesRes, estrategicosRes, seguimientoRes] = await Promise.all([
        fetch(`/api/indicadores-generales${proyectoParam}`),
        fetch(`/api/indicadores-estrategicos${proyectoParam}`),
        fetch(`/api/indicadores-seguimiento${proyectoParam}`)
      ]);

      const [generalesData, estrategicosData, seguimientoData] = await Promise.all([
        generalesRes.json(),
        estrategicosRes.json(),
        seguimientoRes.json()
      ]);

      if (generalesData.success) setIndicadoresGenerales(generalesData.data);
      if (estrategicosData.success) setIndicadoresEstrategicos(estrategicosData.data);
      if (seguimientoData.success) setIndicadoresSeguimiento(seguimientoData.data);
      
    } catch (error) {
      console.error('Error fetching indicadores:', error);
      setError('Error al cargar indicadores');
    } finally {
      setLoading(false);
    }
  };

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

  const renderIndicadorList = (indicadores: any[], tipo: string) => (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {tipo} ({indicadores.length})
        </h3>
      </div>
      
      {indicadores.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay indicadores de este tipo</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {indicadores.map((indicador) => (
            <li key={indicador.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">
                        {indicador.codigo}
                      </span>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {indicador.indicador}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="mr-4">
                        Escala: {indicador.escala || 'N/A'}
                      </span>
                      <span className="mr-4">
                        Unidad: {indicador.unidad || 'N/A'}
                      </span>
                      <span>
                        Valores: {indicador.valores?.length || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/dashboard/indicadores/${indicador.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-500 hover:text-gray-700 mr-4"
              >
                ← Volver
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {session?.user?.role === "FUNDACION" ? "Indicadores Globales" : "Mis Indicadores"}
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('generales')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'generales'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Generales
              </button>
              <button
                onClick={() => setActiveTab('estrategicos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'estrategicos'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Estratégicos
              </button>
              <button
                onClick={() => setActiveTab('seguimiento')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'seguimiento'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Seguimiento
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'generales' && renderIndicadorList(indicadoresGenerales, 'Indicadores Generales')}
          {activeTab === 'estrategicos' && renderIndicadorList(indicadoresEstrategicos, 'Indicadores Estratégicos')}
          {activeTab === 'seguimiento' && renderIndicadorList(indicadoresSeguimiento, 'Indicadores de Seguimiento')}
        </div>
      </main>
    </div>
  );
}