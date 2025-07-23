"use client";

// TEMPORARY: Dashboard without authentication checks for testing
export default function DashboardTest() {
  const handleGoBack = () => {
    window.location.href = '/auth/signin';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🧪 Dashboard Test - Sin Autenticación
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Esta es una versión de prueba para verificar que el dashboard funciona
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Volver a Login
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">✓</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Estado de la Aplicación
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          ✅ Funcionando
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">🔧</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Autenticación Supabase
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          🔄 En Desarrollo
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">⚠</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Redirect Loop
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          🚧 Solucionando
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Navegación del Dashboard
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-gray-200 rounded p-4 text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm font-medium">Indicadores</div>
                </div>
                <div className="border border-gray-200 rounded p-4 text-center">
                  <div className="text-2xl mb-2">🗺️</div>
                  <div className="text-sm font-medium">Cartografía</div>
                </div>
                <div className="border border-gray-200 rounded p-4 text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="text-sm font-medium">Reportes</div>
                </div>
                <div className="border border-gray-200 rounded p-4 text-center">
                  <div className="text-2xl mb-2">⚙️</div>
                  <div className="text-sm font-medium">Configuración</div>
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Resultados de las Pruebas
              </h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  <span className="text-sm">Aplicación Next.js carga correctamente</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  <span className="text-sm">Estilos CSS y Tailwind funcionan</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  <span className="text-sm">Registro de usuario Supabase funciona</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  <span className="text-sm">Email de confirmación se envía</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  <span className="text-sm">Login con Supabase funciona</span>
                </div>
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">❌</span>
                  <span className="text-sm">Redirect loop entre /auth/signin y /dashboard</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}