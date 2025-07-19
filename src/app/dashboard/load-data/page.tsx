"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as XLSX from 'xlsx';

interface Indicador {
  id: string;
  codigo: string;
  indicador: string;
  categoria_prefijo?: string;
  unidad: string;
  tipo: 'general' | 'estrategico' | 'seguimiento';
}

export default function LoadDataPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndicador, setSelectedIndicador] = useState<Indicador | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Estados para carga masiva
  const [activeTab, setActiveTab] = useState<'manual' | 'masiva' | 'multi-año'>('manual');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [processingExcel, setProcessingExcel] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/auth/signin");
    if (session?.user?.role !== "AYUNTAMIENTO") {
      router.push("/dashboard");
      return;
    }
    
    fetchIndicadores();
  }, [session, status, router]);

  const fetchIndicadores = async () => {
    try {
      // Primero verificar si el usuario tiene proyecto asociado directamente en BD
      const userResponse = await fetch('/api/user/current');
      const userData = await userResponse.json();
      
      const proyectoId = userData.success ? userData.data.proyectoId : session?.user?.proyectoId;
      
      if (!proyectoId) {
        setMessage({ type: 'error', text: 'Usuario no asociado a ningún proyecto. Ve a "Mi Perfil" para asociarte a un proyecto.' });
        setLoading(false);
        return;
      }

      const [generalesRes, estrategicosRes, seguimientoRes] = await Promise.all([
        fetch(`/api/indicadores-generales?proyecto_id=${proyectoId}`),
        fetch(`/api/indicadores-estrategicos?proyecto_id=${proyectoId}`),
        fetch(`/api/indicadores-seguimiento?proyecto_id=${proyectoId}`)
      ]);

      const [generalesData, estrategicosData, seguimientoData] = await Promise.all([
        generalesRes.json(),
        estrategicosRes.json(),
        seguimientoRes.json()
      ]);

      const allIndicadores: Indicador[] = [
        ...(generalesData.success ? generalesData.data.map((ind: any) => ({ ...ind, tipo: 'general' as const })) : []),
        ...(estrategicosData.success ? estrategicosData.data.map((ind: any) => ({ ...ind, tipo: 'estrategico' as const })) : []),
        ...(seguimientoData.success ? seguimientoData.data.map((ind: any) => ({ ...ind, tipo: 'seguimiento' as const })) : [])
      ];

      setIndicadores(allIndicadores);
    } catch (error) {
      console.error('Error fetching indicadores:', error);
      setMessage({ type: 'error', text: 'Error al cargar indicadores' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIndicador = (indicador: Indicador) => {
    setSelectedIndicador(indicador);
    setFormData({});
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIndicador) return;

    setSaving(true);
    setMessage(null);

    try {
      let endpoint = '';
      let data = {};

      switch (selectedIndicador.tipo) {
        case 'general':
          endpoint = '/api/valores-generales';
          data = {
            valor_linea_base: formData.valor_linea_base ? parseFloat(formData.valor_linea_base) : null,
            valor_intermedio: formData.valor_intermedio ? parseFloat(formData.valor_intermedio) : null,
            valor_final: formData.valor_final ? parseFloat(formData.valor_final) : null,
            fecha_medicion: formData.fecha_medicion || null,
            observaciones: formData.observaciones || null,
            indicador_general_id: selectedIndicador.id,
          };
          break;

        case 'estrategico':
          endpoint = '/api/valores-estrategicos';
          data = {
            valor_si_no: formData.valor_si_no === 'true' ? true : formData.valor_si_no === 'false' ? false : null,
            valor_numerico: formData.valor_numerico ? parseFloat(formData.valor_numerico) : null,
            valor_texto: formData.valor_texto || null,
            fecha_medicion: formData.fecha_medicion || null,
            observaciones: formData.observaciones || null,
            indicador_estrategico_id: selectedIndicador.id,
          };
          break;

        case 'seguimiento':
          endpoint = '/api/valores-seguimiento';
          data = {
            valor_numerico: formData.valor_numerico ? parseFloat(formData.valor_numerico) : null,
            valor_texto: formData.valor_texto || null,
            fecha_medicion: formData.fecha_medicion,
            periodo_seguimiento: formData.periodo_seguimiento || null,
            observaciones: formData.observaciones || null,
            indicador_seguimiento_id: selectedIndicador.id,
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Datos guardados exitosamente' });
        setFormData({});
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al guardar datos' });
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setMessage({ type: 'error', text: 'Error al guardar datos' });
    } finally {
      setSaving(false);
    }
  };

  // Funciones para carga masiva Excel
  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelFile(file);
      setExcelData([]);
      setMessage(null);
    }
  };

  const processExcelFile = async () => {
    if (!excelFile) return;

    setProcessingExcel(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Procesar hoja de indicadores generales
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Procesar datos del Excel
        const processedData = processExcelData(jsonData);
        setExcelData(processedData);
        setUploadProgress(50);
        
        setMessage({ type: 'success', text: `Archivo procesado: ${processedData.length} registros encontrados` });
        setUploadProgress(100);
      };
      
      reader.readAsArrayBuffer(excelFile);
    } catch (error) {
      console.error('Error processing Excel file:', error);
      setMessage({ type: 'error', text: 'Error al procesar el archivo Excel' });
    } finally {
      setProcessingExcel(false);
    }
  };

  const processExcelData = (jsonData: any[]) => {
    const processedData: any[] = [];
    
    // Asumimos que la primera fila contiene los headers
    const headers = jsonData[0] as string[];
    
    // Mapear headers a campos conocidos
    const headerMap: { [key: string]: string } = {
      'codigo': 'codigo',
      'código': 'codigo',
      'indicador': 'indicador',
      'valor_linea_base': 'valor_linea_base',
      'valor_intermedio': 'valor_intermedio',
      'valor_final': 'valor_final',
      'fecha_medicion': 'fecha_medicion',
      'observaciones': 'observaciones',
      'tipo': 'tipo',
      'categoria': 'categoria'
    };
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (row.length === 0) continue;
      
      const processedRow: any = {};
      
      headers.forEach((header, index) => {
        const normalizedHeader = header?.toLowerCase().replace(/\s+/g, '_');
        const mappedField = headerMap[normalizedHeader] || normalizedHeader;
        processedRow[mappedField] = row[index];
      });
      
      // Validar que el registro tenga al menos código
      if (processedRow.codigo) {
        processedData.push(processedRow);
      }
    }
    
    return processedData;
  };

  const uploadExcelData = async () => {
    if (excelData.length === 0) return;

    setProcessingExcel(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const userResponse = await fetch('/api/user/current');
      const userData = await userResponse.json();
      const proyectoId = userData.success ? userData.data.proyectoId : session?.user?.proyectoId;
      
      if (!proyectoId) {
        setMessage({ type: 'error', text: 'Usuario no asociado a ningún proyecto' });
        return;
      }

      // Preparar datos para la API de carga masiva
      const recordsToUpload = excelData.map(row => {
        // Buscar el indicador por código
        const indicadorMatch = indicadores.find(ind => ind.codigo === row.codigo);
        
        return {
          ...row,
          tipo: indicadorMatch?.tipo || 'general',
          periodo_seguimiento: row.periodo_seguimiento || `${selectedYear}-Q1`,
          fecha_medicion: row.fecha_medicion || new Date().toISOString().split('T')[0]
        };
      });

      setUploadProgress(25);

      // Llamar a la API de carga masiva
      const response = await fetch('/api/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: recordsToUpload,
          proyectoId: proyectoId
        }),
      });

      const result = await response.json();
      setUploadProgress(75);

      if (result.success) {
        const { stats } = result;
        
        if (stats.success > 0 && stats.errors === 0) {
          setMessage({ 
            type: 'success', 
            text: `Carga masiva completada: ${stats.success} registros guardados exitosamente` 
          });
        } else if (stats.success > 0 && stats.errors > 0) {
          const errorExamples = result.results
            .filter((r: any) => !r.success)
            .slice(0, 3)
            .map((r: any) => `${r.codigo}: ${r.error}`)
            .join(', ');
          
          setMessage({ 
            type: 'error', 
            text: `Carga parcial: ${stats.success} éxitos, ${stats.errors} errores. Ejemplos: ${errorExamples}` 
          });
        } else {
          const errorExamples = result.results
            .filter((r: any) => !r.success)
            .slice(0, 5)
            .map((r: any) => `${r.codigo}: ${r.error}`)
            .join(', ');
          
          setMessage({ 
            type: 'error', 
            text: `Carga fallida: ${stats.errors} errores. Ejemplos: ${errorExamples}` 
          });
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Error durante la carga masiva' });
      }

      setUploadProgress(100);

      // Limpiar datos
      setExcelData([]);
      setExcelFile(null);
      
    } catch (error) {
      console.error('Error uploading Excel data:', error);
      setMessage({ type: 'error', text: 'Error durante la carga masiva' });
    } finally {
      setProcessingExcel(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  // Inicializar años disponibles
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 3; i++) {
      years.push(i);
    }
    setAvailableYears(years);
  }, []);

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
                Cargar Datos de Indicadores
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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

          {/* Pestañas de navegación */}
          <div className="mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('manual')}
                className={`${
                  activeTab === 'manual'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                📝 Carga Manual
              </button>
              <button
                onClick={() => setActiveTab('masiva')}
                className={`${
                  activeTab === 'masiva'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                📊 Carga Masiva Excel
              </button>
              <button
                onClick={() => setActiveTab('multi-año')}
                className={`${
                  activeTab === 'multi-año'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                📅 Formularios Multi-Año
              </button>
            </nav>
          </div>

          {/* Contenido según pestaña activa */}
          {activeTab === 'manual' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Indicadores */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Seleccionar Indicador
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Elige un indicador para cargar sus datos
                </p>
              </div>
              
              {indicadores.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No hay indicadores disponibles</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {indicadores.map((indicador) => (
                    <li 
                      key={indicador.id}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedIndicador?.id === indicador.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleSelectIndicador(indicador)}
                    >
                      <div className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${
                                indicador.tipo === 'general' ? 'bg-blue-100 text-blue-800' :
                                indicador.tipo === 'estrategico' ? 'bg-green-100 text-green-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {indicador.codigo}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mt-1 truncate">
                              {indicador.indicador}
                            </p>
                            <p className="text-xs text-gray-500">
                              {indicador.tipo} • {indicador.unidad}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Formulario de Carga */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {selectedIndicador ? (
                  <>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Cargar Datos: {selectedIndicador.codigo}
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      {selectedIndicador.indicador}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {selectedIndicador.tipo === 'general' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Valor Línea Base
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.valor_linea_base || ''}
                              onChange={(e) => setFormData({...formData, valor_linea_base: e.target.value})}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Valor Intermedio
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.valor_intermedio || ''}
                              onChange={(e) => setFormData({...formData, valor_intermedio: e.target.value})}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Valor Final
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.valor_final || ''}
                              onChange={(e) => setFormData({...formData, valor_final: e.target.value})}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </>
                      )}

                      {selectedIndicador.tipo === 'estrategico' && (
                        <>
                          {selectedIndicador.unidad === 'SI_NO' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Valor Si/No
                              </label>
                              <select
                                value={formData.valor_si_no || ''}
                                onChange={(e) => setFormData({...formData, valor_si_no: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                <option value="">Seleccionar</option>
                                <option value="true">Sí</option>
                                <option value="false">No</option>
                              </select>
                            </div>
                          )}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Valor Numérico
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.valor_numerico || ''}
                              onChange={(e) => setFormData({...formData, valor_numerico: e.target.value})}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Valor Texto
                            </label>
                            <textarea
                              value={formData.valor_texto || ''}
                              onChange={(e) => setFormData({...formData, valor_texto: e.target.value})}
                              rows={3}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </>
                      )}

                      {selectedIndicador.tipo === 'seguimiento' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Período de Seguimiento *
                            </label>
                            <input
                              type="text"
                              value={formData.periodo_seguimiento || ''}
                              onChange={(e) => setFormData({...formData, periodo_seguimiento: e.target.value})}
                              placeholder="ej: T1-2024, Semestre 1, etc."
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Valor Numérico
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.valor_numerico || ''}
                              onChange={(e) => setFormData({...formData, valor_numerico: e.target.value})}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Valor Texto
                            </label>
                            <textarea
                              value={formData.valor_texto || ''}
                              onChange={(e) => setFormData({...formData, valor_texto: e.target.value})}
                              rows={3}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Fecha de Medición {selectedIndicador.tipo === 'seguimiento' ? '*' : ''}
                        </label>
                        <input
                          type="date"
                          value={formData.fecha_medicion || ''}
                          onChange={(e) => setFormData({...formData, fecha_medicion: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          required={selectedIndicador.tipo === 'seguimiento'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Observaciones
                        </label>
                        <textarea
                          value={formData.observaciones || ''}
                          onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                          rows={3}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={saving}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                        >
                          {saving ? 'Guardando...' : 'Guardar Datos'}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      Selecciona un indicador de la lista para cargar sus datos
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Pestaña Carga Masiva Excel */}
          {activeTab === 'masiva' && (
            <div className="space-y-6">
              {/* Sección de carga de archivo */}
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Carga Masiva desde Excel
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sube un archivo Excel con múltiples indicadores para cargar datos en lote. 
                    El archivo debe contener columnas: codigo, valor_linea_base, valor_intermedio, valor_final, fecha_medicion, observaciones.
                  </p>
                  
                  <div className="mb-6">
                    <button
                      onClick={() => window.open('/api/download-template', '_blank')}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                    >
                      📥 Descargar Template Excel
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Descarga un archivo Excel de ejemplo con el formato correcto
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seleccionar archivo Excel
                      </label>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleExcelFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      {excelFile && (
                        <p className="mt-2 text-sm text-gray-500">
                          Archivo seleccionado: {excelFile.name}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={processExcelFile}
                        disabled={!excelFile || processingExcel}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingExcel ? 'Procesando...' : 'Procesar Archivo'}
                      </button>
                      
                      {excelData.length > 0 && (
                        <button
                          onClick={uploadExcelData}
                          disabled={processingExcel}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingExcel ? 'Cargando...' : `Cargar ${excelData.length} registros`}
                        </button>
                      )}
                    </div>

                    {uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Vista previa de datos */}
              {excelData.length > 0 && (
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Vista Previa de Datos ({excelData.length} registros)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Código
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Línea Base
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Intermedio
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Final
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {excelData.slice(0, 10).map((row, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {row.codigo}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {row.valor_linea_base || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {row.valor_intermedio || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {row.valor_final || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {row.fecha_medicion || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {excelData.length > 10 && (
                        <p className="mt-4 text-sm text-gray-500 text-center">
                          Mostrando 10 de {excelData.length} registros
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pestaña Formularios Multi-Año */}
          {activeTab === 'multi-año' && (
            <div className="space-y-6">
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Formularios Multi-Año
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Gestiona datos de indicadores para diferentes años del proyecto. 
                    Selecciona el año y carga datos específicos para ese período.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Seleccionar Año
                        </label>
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Período del Año
                        </label>
                        <select
                          value={formData.periodo_trimestre || 'Q1'}
                          onChange={(e) => setFormData({...formData, periodo_trimestre: e.target.value})}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="Q1">Q1 - Enero a Marzo</option>
                          <option value="Q2">Q2 - Abril a Junio</option>
                          <option value="Q3">Q3 - Julio a Septiembre</option>
                          <option value="Q4">Q4 - Octubre a Diciembre</option>
                          <option value="S1">Semestre 1 - Enero a Junio</option>
                          <option value="S2">Semestre 2 - Julio a Diciembre</option>
                          <option value="ANUAL">Anual - Enero a Diciembre</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            Configuración: {selectedYear} - {formData.periodo_trimestre || 'Q1'}
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              Los datos se asociarán automáticamente a este período. 
                              Fecha automática: {selectedYear}-{formData.periodo_trimestre === 'Q1' ? '01-01' : 
                                                                formData.periodo_trimestre === 'Q2' ? '04-01' : 
                                                                formData.periodo_trimestre === 'Q3' ? '07-01' : 
                                                                formData.periodo_trimestre === 'Q4' ? '10-01' : 
                                                                formData.periodo_trimestre === 'S1' ? '01-01' : 
                                                                formData.periodo_trimestre === 'S2' ? '07-01' : '01-01'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Formulario de carga rápida multi-año */}
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-800 mb-4">Carga Rápida Multi-Año</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Seleccionar Indicador
                            </label>
                            <select
                              value={formData.indicador_seleccionado || ''}
                              onChange={(e) => {
                                const selected = indicadores.find(ind => ind.id === e.target.value);
                                setFormData({...formData, indicador_seleccionado: e.target.value, tipo_indicador: selected?.tipo});
                              }}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="">Seleccionar indicador...</option>
                              {indicadores.map(ind => (
                                <option key={ind.id} value={ind.id}>
                                  {ind.codigo} - {ind.indicador}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Valor para {selectedYear}
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.valor_multi_anno || ''}
                              onChange={(e) => setFormData({...formData, valor_multi_anno: e.target.value})}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Ingresa el valor"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observaciones para {selectedYear}
                          </label>
                          <textarea
                            value={formData.observaciones_multi_anno || ''}
                            onChange={(e) => setFormData({...formData, observaciones_multi_anno: e.target.value})}
                            rows={3}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Observaciones específicas para este año..."
                          />
                        </div>

                        <button
                          onClick={async () => {
                            if (!formData.indicador_seleccionado || !formData.valor_multi_anno) {
                              setMessage({ type: 'error', text: 'Debe seleccionar un indicador y proporcionar un valor' });
                              return;
                            }

                            setSaving(true);
                            setMessage(null);

                            try {
                              const indicadorSeleccionado = indicadores.find(ind => ind.id === formData.indicador_seleccionado);
                              const periodoCompleto = `${formData.periodo_trimestre || 'Q1'}-${selectedYear}`;
                              const fechaCalculada = new Date(selectedYear, 
                                formData.periodo_trimestre === 'Q2' ? 3 : 
                                formData.periodo_trimestre === 'Q3' ? 6 : 
                                formData.periodo_trimestre === 'Q4' ? 9 : 
                                formData.periodo_trimestre === 'S2' ? 6 : 0, 1);

                              let endpoint = '';
                              let data = {};

                              if (indicadorSeleccionado?.tipo === 'seguimiento') {
                                endpoint = '/api/valores-seguimiento';
                                data = {
                                  valor_numerico: parseFloat(formData.valor_multi_anno),
                                  valor_texto: formData.observaciones_multi_anno || null,
                                  fecha_medicion: fechaCalculada.toISOString().split('T')[0],
                                  periodo_seguimiento: periodoCompleto,
                                  observaciones: `${selectedYear} - ${formData.periodo_trimestre || 'Q1'}: ${formData.observaciones_multi_anno || ''}`,
                                  indicador_seguimiento_id: formData.indicador_seleccionado,
                                };
                              } else {
                                // Para indicadores generales y estratégicos, usar valor intermedio
                                endpoint = indicadorSeleccionado?.tipo === 'general' ? '/api/valores-generales' : '/api/valores-estrategicos';
                                data = indicadorSeleccionado?.tipo === 'general' ? {
                                  valor_intermedio: parseFloat(formData.valor_multi_anno),
                                  fecha_medicion: fechaCalculada.toISOString().split('T')[0],
                                  observaciones: `${selectedYear} - ${formData.periodo_trimestre || 'Q1'}: ${formData.observaciones_multi_anno || ''}`,
                                  indicador_general_id: formData.indicador_seleccionado,
                                } : {
                                  valor_numerico: parseFloat(formData.valor_multi_anno),
                                  fecha_medicion: fechaCalculada.toISOString().split('T')[0],
                                  observaciones: `${selectedYear} - ${formData.periodo_trimestre || 'Q1'}: ${formData.observaciones_multi_anno || ''}`,
                                  indicador_estrategico_id: formData.indicador_seleccionado,
                                };
                              }

                              const response = await fetch(endpoint, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data),
                              });

                              const result = await response.json();

                              if (result.success) {
                                setMessage({ type: 'success', text: `Datos guardados para ${selectedYear} - ${formData.periodo_trimestre || 'Q1'}` });
                                setFormData({
                                  ...formData,
                                  valor_multi_anno: '',
                                  observaciones_multi_anno: '',
                                  indicador_seleccionado: ''
                                });
                              } else {
                                setMessage({ type: 'error', text: result.error || 'Error al guardar datos' });
                              }
                            } catch (error) {
                              console.error('Error:', error);
                              setMessage({ type: 'error', text: 'Error al guardar datos multi-año' });
                            } finally {
                              setSaving(false);
                            }
                          }}
                          disabled={saving || !formData.indicador_seleccionado || !formData.valor_multi_anno}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                        >
                          {saving ? 'Guardando...' : `Guardar para ${selectedYear} - ${formData.periodo_trimestre || 'Q1'}`}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-md">
                        <h4 className="font-medium text-green-800">Períodos Disponibles {selectedYear}</h4>
                        <ul className="mt-2 text-sm text-green-700">
                          <li>• Q1-{selectedYear} (Enero-Marzo)</li>
                          <li>• Q2-{selectedYear} (Abril-Junio)</li>
                          <li>• Q3-{selectedYear} (Julio-Septiembre)</li>
                          <li>• Q4-{selectedYear} (Octubre-Diciembre)</li>
                          <li>• S1-{selectedYear} (Enero-Junio)</li>
                          <li>• S2-{selectedYear} (Julio-Diciembre)</li>
                        </ul>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-md">
                        <h4 className="font-medium text-yellow-800">Formato Excel Multi-Año</h4>
                        <ul className="mt-2 text-sm text-yellow-700">
                          <li>• Columna: periodo_seguimiento</li>
                          <li>• Formato: "Q1-{selectedYear}", "S1-{selectedYear}"</li>
                          <li>• Fecha automática: {selectedYear}-01-01</li>
                          <li>• Usar template Excel para carga masiva</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}