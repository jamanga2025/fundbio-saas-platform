'use client';

import React, { useState } from 'react';
import { CategoriaPrefijo, UnidadType } from '@prisma/client';
import ValidatedInput, { ValidatedBooleanInput, ValidatedPeriodInput } from '@/components/ui/ValidatedInput';
import { useIndicatorValidation } from '@/hooks/useIndicatorValidation';

interface Indicador {
  id: string;
  codigo: string;
  indicador: string;
  categoria_prefijo?: CategoriaPrefijo;
  unidad: UnidadType;
  tipo: 'general' | 'estrategico' | 'seguimiento';
}

interface ValidatedIndicatorFormProps {
  indicador: Indicador;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  initialData?: any;
}

export default function ValidatedIndicatorForm({
  indicador,
  onSubmit,
  onCancel,
  initialData = {}
}: ValidatedIndicatorFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validation = useIndicatorValidation({
    categoria: indicador.categoria_prefijo || 'SUP',
    unidad: indicador.unidad,
    tipo: indicador.tipo
  });

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Limpiar errores de submit si los hay
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos los datos
    const isValid = validation.validateData(formData);
    
    if (!isValid) {
      setSubmitError(validation.getFormattedErrors().join(', '));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(formData);
      // Limpiar formulario después de envío exitoso
      setFormData({});
      validation.clearErrors();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Error al guardar datos');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormFields = () => {
    const categoria = indicador.categoria_prefijo || 'SUP';
    const unidad = indicador.unidad;
    const tipo = indicador.tipo;

    switch (tipo) {
      case 'general':
        return (
          <>
            <ValidatedInput
              name="valor_linea_base"
              label="Valor Línea Base"
              value={formData.valor_linea_base}
              onChange={(value) => handleFieldChange('valor_linea_base', value)}
              categoria={categoria}
              unidad={unidad}
              tipo={tipo}
              type="number"
              placeholder="Ingrese el valor inicial"
            />
            
            <ValidatedInput
              name="valor_intermedio"
              label="Valor Intermedio"
              value={formData.valor_intermedio}
              onChange={(value) => handleFieldChange('valor_intermedio', value)}
              categoria={categoria}
              unidad={unidad}
              tipo={tipo}
              type="number"
              placeholder="Ingrese el valor intermedio"
            />
            
            <ValidatedInput
              name="valor_final"
              label="Valor Final"
              value={formData.valor_final}
              onChange={(value) => handleFieldChange('valor_final', value)}
              categoria={categoria}
              unidad={unidad}
              tipo={tipo}
              type="number"
              placeholder="Ingrese el valor final"
            />
          </>
        );
      
      case 'estrategico':
        return (
          <>
            {unidad === 'SI_NO' && (
              <ValidatedBooleanInput
                name="valor_si_no"
                label="Valor Si/No"
                value={formData.valor_si_no}
                onChange={(value) => handleFieldChange('valor_si_no', value)}
                categoria={categoria}
                unidad={unidad}
                tipo={tipo}
              />
            )}
            
            <ValidatedInput
              name="valor_numerico"
              label="Valor Numérico"
              value={formData.valor_numerico}
              onChange={(value) => handleFieldChange('valor_numerico', value)}
              categoria={categoria}
              unidad={unidad}
              tipo={tipo}
              type="number"
              placeholder="Ingrese el valor numérico"
            />
            
            <ValidatedInput
              name="valor_texto"
              label="Valor Texto"
              value={formData.valor_texto}
              onChange={(value) => handleFieldChange('valor_texto', value)}
              categoria={categoria}
              unidad={unidad}
              tipo={tipo}
              type="textarea"
              placeholder="Ingrese descripción detallada"
            />
          </>
        );
      
      case 'seguimiento':
        return (
          <>
            <ValidatedPeriodInput
              name="periodo_seguimiento"
              label="Período de Seguimiento"
              value={formData.periodo_seguimiento}
              onChange={(value) => handleFieldChange('periodo_seguimiento', value)}
              categoria={categoria}
              unidad={unidad}
              tipo={tipo}
            />
            
            <ValidatedInput
              name="valor_numerico"
              label="Valor Numérico"
              value={formData.valor_numerico}
              onChange={(value) => handleFieldChange('valor_numerico', value)}
              categoria={categoria}
              unidad={unidad}
              tipo={tipo}
              type="number"
              placeholder="Ingrese el valor numérico"
            />
            
            <ValidatedInput
              name="valor_texto"
              label="Valor Texto"
              value={formData.valor_texto}
              onChange={(value) => handleFieldChange('valor_texto', value)}
              categoria={categoria}
              unidad={unidad}
              tipo={tipo}
              type="textarea"
              placeholder="Ingrese descripción del seguimiento"
            />
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {indicador.codigo} - {indicador.indicador}
          </h3>
          <div className="mt-2 flex items-center space-x-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              indicador.tipo === 'general' ? 'bg-blue-100 text-blue-800' :
              indicador.tipo === 'estrategico' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {indicador.tipo}
            </span>
            <span className="text-sm text-gray-500">
              Categoría: {indicador.categoria_prefijo || 'N/A'}
            </span>
            <span className="text-sm text-gray-500">
              Unidad: {indicador.unidad}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderFormFields()}
          
          {/* Campos comunes */}
          <ValidatedInput
            name="fecha_medicion"
            label="Fecha de Medición"
            value={formData.fecha_medicion}
            onChange={(value) => handleFieldChange('fecha_medicion', value)}
            categoria={indicador.categoria_prefijo || 'SUP'}
            unidad={indicador.unidad}
            tipo={indicador.tipo}
            type="date"
          />
          
          <ValidatedInput
            name="observaciones"
            label="Observaciones"
            value={formData.observaciones}
            onChange={(value) => handleFieldChange('observaciones', value)}
            categoria={indicador.categoria_prefijo || 'SUP'}
            unidad={indicador.unidad}
            tipo={indicador.tipo}
            type="textarea"
            placeholder="Observaciones adicionales (opcional)"
          />
          
          {/* Mostrar errores de validación */}
          {validation.hasErrors && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Se encontraron errores de validación
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <pre className="whitespace-pre-wrap">{validation.getFormattedErrors()}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Mostrar errores de submit */}
          {submitError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error al enviar
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <pre className="whitespace-pre-wrap">{submitError}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Botones de acción */}
          <div className="flex justify-end space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || validation.hasErrors}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Datos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}