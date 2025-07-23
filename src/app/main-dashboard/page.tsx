"use client";

import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MainDashboard() {
  const { session, status, signOut } = useSupabaseAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('MainDashboard - Status:', status, 'Session:', !!session);
    console.log('REDIRECT DISABLED FOR DEBUGGING - Status:', status, 'HasSession:', !!session);
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">🔄 Cargando sesión...</div>
      </div>
    );
  }

  // SHOW DEBUG INFO INSTEAD OF HIDING
  const debugInfo = {
    status,
    hasSession: !!session,
    sessionId: session?.access_token ? 'present' : 'missing',
    userEmail: session?.user?.email || 'no-email',
    userId: session?.user?.id || 'no-id'
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-4">❌ No Session Found</h1>
          <div className="space-y-2 text-sm">
            <div><strong>Status:</strong> {status}</div>
            <div><strong>Has Session:</strong> {String(!!session)}</div>
            <div className="mt-4">
              <button 
                onClick={() => router.push('/auth/signin')}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  ✅ MAIN DASHBOARD - Sin Loop Railway
                </h1>
                <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded text-xs">
                  <span><strong>Status:</strong> {debugInfo.status} | </span>
                  <span><strong>Email:</strong> {debugInfo.userEmail} | </span>
                  <span><strong>Token:</strong> {debugInfo.sessionId}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{session.user.email}</span>
                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  ✅ Autenticado
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
            <h2 className="text-2xl font-bold mb-6">🎉 ¡AUTENTICACIÓN SUPABASE FUNCIONANDO!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-green-600 mb-4">✅ Funcionalidades Completadas</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Registro de usuarios con email</li>
                  <li>• Confirmación por email</li>
                  <li>• Login con email/contraseña</li>
                  <li>• Detección de sesión activa</li>
                  <li>• Dashboard protegido</li>
                  <li>• Logout funcional</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-blue-600 mb-4">📊 Estado de la Sesión</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Usuario:</strong> {session.user.email}</div>
                  <div><strong>ID:</strong> {session.user.id}</div>
                  <div><strong>Última actualización:</strong> {new Date(session.user.updated_at).toLocaleString()}</div>
                  <div><strong>Estado:</strong> <span className="text-green-600 font-semibold">Activo</span></div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Esta es la URL alternativa para evitar el loop de Railway en /dashboard. 
                Una vez solucionado ese problema técnico, se puede volver a la URL original.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}