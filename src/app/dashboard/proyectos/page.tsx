"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Proyecto {
  id: string;
  entidad: string;
  nombre: string;
  municipio: string;
  codigo_proyecto: string;
  presupuesto_total: number;
  fecha_inicio: string;
  fecha_finalizacion: string;
  createdAt: string;
}

export default function ProyectosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/auth/signin");
    if (session?.user?.role !== "FUNDACION") {
      router.push("/dashboard");
      return;
    }
    
    fetchProyectos();
  }, [session, status, router]);

  const fetchProyectos = async () => {
    try {
      const response = await fetch('/api/proyectos');
      const data = await response.json();
      
      if (data.success) {
        setProyectos(data.data);
      } else {
        setError(data.error || 'Error al cargar proyectos');
      }
    } catch (error) {
      console.error('Error fetching proyectos:', error);
      setError('Error al cargar proyectos');
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

  if (!session || session.user.role !== "FUNDACION") {
    return null;
  }

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
                Gestión de Proyectos
              </h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard/proyectos/nuevo')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Nuevo Proyecto
              </button>
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

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Proyectos Registrados
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Lista de todos los proyectos en el sistema
              </p>
            </div>
            
            {proyectos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay proyectos registrados</p>
                <button
                  onClick={() => router.push('/dashboard/proyectos/nuevo')}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Crear primer proyecto
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {proyectos.map((proyecto) => (
                  <li key={proyecto.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {proyecto.nombre}
                          </p>
                          <p className="text-sm text-gray-500">
                            {proyecto.entidad} - {proyecto.municipio}
                          </p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="mr-4">
                              Código: {proyecto.codigo_proyecto || 'N/A'}
                            </span>
                            <span className="mr-4">
                              Presupuesto: €{proyecto.presupuesto_total?.toLocaleString() || 'N/A'}
                            </span>
                            <span>
                              Inicio: {proyecto.fecha_inicio ? new Date(proyecto.fecha_inicio).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/dashboard/proyectos/${proyecto.id}`)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            Ver detalles
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/proyectos/${proyecto.id}/edit`)}
                            className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}