"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if user is already authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Session found, but not auto-redirecting to prevent loop');
        // Temporarily disabled to debug loop
        // router.push('/dashboard');
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Use app-dashboard to access the real FundBio dashboard
        router.push("/app-dashboard");
      }
    } catch (error) {
      setError("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        setError(""); // Clear any previous errors
        alert("¡Registro exitoso! Revisa tu email para confirmar tu cuenta.");
        setMode('signin'); // Switch back to sign in mode
      }
    } catch (error) {
      setError("An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = mode === 'signin' ? handleSignIn : handleSignUp;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'signin' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Fundación Biodiversidad - Portal de Indicadores
          </p>
        </div>

        {/* Toggle between Sign In and Sign Up */}
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              mode === 'signin'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              mode === 'signup'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña {mode === 'signup' && '(mínimo 6 caracteres)'}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={mode === 'signup' ? 6 : undefined}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 
                (mode === 'signin' ? "Iniciando sesión..." : "Creando cuenta...") : 
                (mode === 'signin' ? "Iniciar Sesión" : "Crear Cuenta")
              }
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p className="mt-4">
              {mode === 'signin' ? (
                <>
                  <strong>¿No tienes cuenta?</strong> Haz clic en "Crear Cuenta" arriba.
                </>
              ) : (
                <>
                  <strong>Crear nueva cuenta:</strong> Se enviará un email de confirmación.
                  <br />
                  <strong>¿Ya tienes cuenta?</strong> Haz clic en "Iniciar Sesión" arriba.
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}