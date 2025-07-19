"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Proyecto {
  id: string;
  nombre: string;
  entidad: string;
  municipio: string;
  codigo_proyecto: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [selectedProyecto, setSelectedProyecto] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/auth/signin");
    if (session?.user?.role !== "AYUNTAMIENTO") {
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
        // Si el usuario ya tiene un proyecto, pre-seleccionarlo
        if (session?.user?.proyectoId) {
          setSelectedProyecto(session.user.proyectoId);
        }
      } else {
        setMessage({ type: 'error', text: 'Error al cargar proyectos' });
      }
    } catch (error) {
      console.error('Error fetching proyectos:', error);
      setMessage({ type: 'error', text: 'Error al cargar proyectos' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssociation = async () => {
    if (!selectedProyecto) {
      setMessage({ type: 'error', text: 'Selecciona un proyecto' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/associate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: session?.user?.id,
          proyectoId: selectedProyecto 
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Asociación guardada exitosamente. Redirigiendo...' });
        // Forzar actualización de la sesión redirigiendo al login
        setTimeout(() => {
          window.location.href = '/auth/signin?message=Vuelve a loguearte para actualizar tu sesión';
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al guardar asociación' });
      }
    } catch (error) {
      console.error('Error saving association:', error);
      setMessage({ type: 'error', text: 'Error al guardar asociación' });
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "AYUNTAMIENTO") {
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
                Mi Perfil
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                Información del Usuario
              </h3>
              
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd className="mt-1 text-sm text-gray-900">{session.user.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{session.user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rol</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Ayuntamiento
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estado del Proyecto</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {session.user.proyectoId ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Asociado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Sin asociar
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                Asociación a Proyecto
              </h3>
              
              {!session.user.proyectoId && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-700">
                    ⚠️ No tienes un proyecto asociado. Selecciona tu proyecto para acceder a los indicadores y poder cargar datos.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Proyecto
                  </label>
                  <select
                    value={selectedProyecto}
                    onChange={(e) => setSelectedProyecto(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Selecciona un proyecto...</option>
                    {proyectos.map((proyecto) => (
                      <option key={proyecto.id} value={proyecto.id}>
                        {proyecto.entidad} - {proyecto.nombre} ({proyecto.municipio})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProyecto && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    {(() => {
                      const proyecto = proyectos.find(p => p.id === selectedProyecto);
                      return proyecto ? (
                        <div>
                          <h4 className="font-medium text-blue-900">Proyecto Seleccionado:</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            <strong>Entidad:</strong> {proyecto.entidad}
                          </p>
                          <p className="text-sm text-blue-700">
                            <strong>Nombre:</strong> {proyecto.nombre}
                          </p>
                          <p className="text-sm text-blue-700">
                            <strong>Municipio:</strong> {proyecto.municipio}
                          </p>
                          {proyecto.codigo_proyecto && (
                            <p className="text-sm text-blue-700">
                              <strong>Código:</strong> {proyecto.codigo_proyecto}
                            </p>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={handleSaveAssociation}
                    disabled={saving || !selectedProyecto}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Guardando...' : 'Guardar Asociación'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {session.user.proyectoId && (
            <div className="mt-6 bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Acciones Disponibles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => router.push('/dashboard/indicadores')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Ver Mis Indicadores
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/load-data')}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Cargar Datos
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}