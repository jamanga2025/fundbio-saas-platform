"use client";

import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { session, status, signOut } = useSupabaseAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard - Status:', status, 'Session:', !!session);
    
    // More lenient session check - only redirect if we're sure there's no session
    if (status === "loading") return; // Still loading
    
    // Only redirect if we've finished loading AND definitely have no session
    if (status === "unauthenticated" && !session) {
      console.log('No session found after loading, redirecting to signin');
      router.push("/auth/signin");
    } else if (session) {
      console.log('Session found:', session.user?.email);
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white px-4 py-2 z-50">
        Saltar al contenido principal
      </a>
      <header className="bg-white shadow" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Fundación Biodiversidad - Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{session.user.email}</span>
                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Usuario
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-white px-4 py-2 rounded-md text-sm font-medium"
                aria-label="Cerrar sesión de usuario"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" role="main">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Bienvenido al Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Sistema de gestión de indicadores de biodiversidad
              </p>
              
              <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8" role="navigation" aria-label="Navegación del dashboard">
                {session.user.role === "FUNDACION" ? (
                  <>
                    <a href="/dashboard/proyectos" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 block no-underline">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Gestión de Proyectos
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Administrar proyectos y sus datos
                      </p>
                    </a>
                    <a href="/dashboard/indicators" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 block no-underline">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Indicadores Globales
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Ver todos los indicadores del sistema
                      </p>
                    </a>
                    <a href="/dashboard/reports" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 block no-underline">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Reportes
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Generar reportes consolidados
                      </p>
                    </a>
                    <a href="/dashboard/visualizations" className="bg-green-50 border border-green-200 p-6 rounded-lg shadow hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 block no-underline">
                      <h3 className="text-lg font-medium text-green-900 mb-2">
                        <span role="img" aria-label="Icono de gráfico">📊</span> Visualizaciones
                      </h3>
                      <p className="text-green-700 text-sm">
                        Dashboards interactivos y gráficos
                      </p>
                    </a>
                    <a href="/dashboard/cartografia" className="bg-blue-50 border border-blue-200 p-6 rounded-lg shadow hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 block no-underline">
                      <h3 className="text-lg font-medium text-blue-900 mb-2">
                        <span role="img" aria-label="Icono de mapa">🗺️</span> Cartografía
                      </h3>
                      <p className="text-blue-700 text-sm">
                        Mapas territoriales y análisis espacial
                      </p>
                    </a>
                  </>
                ) : (
                  <>
                    <a href="/dashboard/indicators" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 block no-underline">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Mis Indicadores
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Gestionar indicadores de mi ciudad
                      </p>
                    </a>
                    <a href="/dashboard/load-data" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 block no-underline">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Cargar Datos
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Subir nuevos datos de indicadores
                      </p>
                    </a>
                    <a href="/dashboard/profile" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 block no-underline">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Mi Perfil
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Configurar datos y asociación a proyecto
                      </p>
                    </a>
                    <a href="/dashboard/visualizations" className="bg-green-50 border border-green-200 p-6 rounded-lg shadow hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 block no-underline">
                      <h3 className="text-lg font-medium text-green-900 mb-2">
                        <span role="img" aria-label="Icono de gráfico">📊</span> Visualizaciones
                      </h3>
                      <p className="text-green-700 text-sm">
                        Dashboards y gráficos de mis datos
                      </p>
                    </a>
                    <a href="/dashboard/cartografia" className="bg-blue-50 border border-blue-200 p-6 rounded-lg shadow hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 block no-underline">
                      <h3 className="text-lg font-medium text-blue-900 mb-2">
                        <span role="img" aria-label="Icono de mapa">🗺️</span> Cartografía
                      </h3>
                      <p className="text-blue-700 text-sm">
                        Mapas de mi territorio y proyectos
                      </p>
                    </a>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}