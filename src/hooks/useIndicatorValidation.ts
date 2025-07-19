import { useState, useCallback } from 'react';
import { CategoriaPrefijo, UnidadType } from '@prisma/client';
import { 
  validateIndicatorData, 
  getValidationRulesForIndicator, 
  formatValidationErrors,
  IndicatorValidationRules 
} from '@/lib/indicator-validation';

interface UseIndicatorValidationProps {
  categoria: CategoriaPrefijo;
  unidad: UnidadType;
  tipo: 'general' | 'estrategico' | 'seguimiento';
}

export function useIndicatorValidation({ categoria, unidad, tipo }: UseIndicatorValidationProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Obtener reglas de validación para este indicador
  const validationRules = getValidationRulesForIndicator(categoria || 'default');

  // Función para validar datos
  const validateData = useCallback((data: any) => {
    setIsValidating(true);
    
    try {
      const validation = validateIndicatorData(data);
      setValidationErrors([]);
      setIsValidating(false);
      return true;
    } catch (error: any) {
      setValidationErrors([error.message || 'Validation error']);
      setIsValidating(false);
      return false;
    }
  }, [categoria, unidad, tipo]);

  // Función para validar un campo específico
  const validateField = useCallback((fieldName: string, value: any) => {
    // Simple validation for required fields
    if (validationRules.required && (value === null || value === undefined || value === '')) {
      return false;
    }
    
    // Check min/max values for numeric fields
    if (typeof value === 'number') {
      if (validationRules.minValue !== undefined && value < validationRules.minValue) {
        return false;
      }
      if (validationRules.maxValue !== undefined && value > validationRules.maxValue) {
        return false;
      }
    }
    
    return true;
  }, [validationRules]);

  // Función para obtener el mensaje de error de un campo
  const getFieldErrorMessage = useCallback((fieldName: string) => {
    return `${fieldName} no es válido`;
  }, []);

  // Función para obtener restricciones de un campo
  const getFieldConstraints = useCallback((fieldName: string) => {
    return {
      required: validationRules.required || false,
      minValue: validationRules.minValue,
      maxValue: validationRules.maxValue,
      allowedValues: validationRules.allowedValues
    };
  }, [validationRules]);

  // Función para limpiar errores
  const clearErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  // Función para formatear errores
  const getFormattedErrors = useCallback(() => {
    return formatValidationErrors(validationErrors);
  }, [validationErrors]);

  return {
    // Estados
    validationErrors,
    isValidating,
    hasErrors: validationErrors.length > 0,
    
    // Funciones
    validateData,
    validateField,
    getFieldErrorMessage,
    getFieldConstraints,
    clearErrors,
    getFormattedErrors,
    
    // Reglas
    validationRules
  };
}

// Hook específico para validación en tiempo real
export function useRealTimeValidation({ categoria, unidad, tipo }: UseIndicatorValidationProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const validation = useIndicatorValidation({ categoria, unidad, tipo });

  const validateFieldRealTime = useCallback((fieldName: string, value: any) => {
    const isValid = validation.validateField(fieldName, value);
    
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: isValid ? '' : validation.getFieldErrorMessage(fieldName)
    }));
    
    return isValid;
  }, [validation]);

  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  }, []);

  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  return {
    ...validation,
    fieldErrors,
    validateFieldRealTime,
    clearFieldError,
    clearAllFieldErrors,
    hasFieldErrors: Object.values(fieldErrors).some(error => error !== '')
  };
}