'use client';

import React, { useState, useEffect } from 'react';
import { CategoriaPrefijo, UnidadType } from '@prisma/client';
import { useRealTimeValidation } from '@/hooks/useIndicatorValidation';

interface ValidatedInputProps {
  name: string;
  label: string;
  value: any;
  onChange: (value: any) => void;
  categoria: CategoriaPrefijo;
  unidad: UnidadType;
  tipo: 'general' | 'estrategico' | 'seguimiento';
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  type?: 'text' | 'number' | 'date' | 'textarea' | 'select';
  options?: { value: any; label: string }[];
}

export default function ValidatedInput({
  name,
  label,
  value,
  onChange,
  categoria,
  unidad,
  tipo,
  placeholder,
  disabled = false,
  className = '',
  type = 'text',
  options = []
}: ValidatedInputProps) {
  const [touched, setTouched] = useState(false);
  const validation = useRealTimeValidation({ categoria, unidad, tipo });
  
  const fieldError = validation.fieldErrors[name] || '';
  const constraints = validation.getFieldConstraints(name);
  const hasError = touched && fieldError !== '';

  // Validar cuando el valor cambia
  useEffect(() => {
    if (touched) {
      validation.validateFieldRealTime(name, value);
    }
  }, [value, touched, name, validation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let newValue: any = e.target.value;
    
    // Convertir tipos según sea necesario
    if (type === 'number' && newValue !== '') {
      newValue = parseFloat(newValue);
      if (isNaN(newValue)) newValue = '';
    }
    
    if (name === 'valor_si_no') {
      newValue = newValue === 'true';
    }
    
    onChange(newValue);
    setTouched(true);
  };

  const handleBlur = () => {
    setTouched(true);
    validation.validateFieldRealTime(name, value);
  };

  const getInputClasses = () => {
    const baseClasses = 'block w-full border rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 transition-colors';
    const normalClasses = 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500';
    const errorClasses = 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50';
    
    return `${baseClasses} ${hasError ? errorClasses : normalClasses} ${className}`;
  };

  const getLabelClasses = () => {
    const baseClasses = 'block text-sm font-medium mb-1';
    const normalClasses = 'text-gray-700';
    const errorClasses = 'text-red-700';
    
    return `${baseClasses} ${hasError ? errorClasses : normalClasses}`;
  };

  const renderInput = () => {
    const inputProps = {
      id: name,
      name: name,
      value: value || '',
      onChange: handleChange,
      onBlur: handleBlur,
      placeholder: placeholder,
      disabled: disabled,
      className: getInputClasses(),
      ...(type === 'number' && {
        min: constraints.minValue,
        max: constraints.maxValue,
        step: 'any'
      }),
      ...(constraints.required && { required: true })
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...inputProps}
            rows={3}
            className={getInputClasses()}
          />
        );
      
      case 'select':
        return (
          <select
            {...inputProps}
            className={getInputClasses()}
          >
            <option value="">Seleccionar...</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'date':
        return (
          <input
            {...inputProps}
            type="date"
            className={getInputClasses()}
          />
        );
      
      case 'number':
        return (
          <input
            {...inputProps}
            type="number"
            className={getInputClasses()}
          />
        );
      
      default:
        return (
          <input
            {...inputProps}
            type="text"
            className={getInputClasses()}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <label htmlFor={name} className={getLabelClasses()}>
        {label}
        {constraints.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {/* Mostrar información de restricciones */}
      {!hasError && (constraints.minValue !== undefined || constraints.maxValue !== undefined) && (
        <p className="text-xs text-gray-500">
          {constraints.minValue !== undefined && constraints.maxValue !== undefined
            ? `Valor entre ${constraints.minValue} y ${constraints.maxValue}`
            : constraints.minValue !== undefined
            ? `Valor mínimo: ${constraints.minValue}`
            : `Valor máximo: ${constraints.maxValue}`
          }
        </p>
      )}
      
      {/* Mostrar patrón para campos de texto */}
      {!hasError && type === 'text' && (
        <p className="text-xs text-gray-500">
          {name === 'periodo_seguimiento' && 'Formato: Q1-2024, S1-2024, o ANUAL-2024'}
        </p>
      )}
      
      {/* Mostrar error de validación */}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {fieldError}
        </p>
      )}
    </div>
  );
}

// Componente específico para campos Si/No
export function ValidatedBooleanInput(props: Omit<ValidatedInputProps, 'type' | 'options'>) {
  return (
    <ValidatedInput
      {...props}
      type="select"
      options={[
        { value: 'true', label: 'Sí' },
        { value: 'false', label: 'No' }
      ]}
    />
  );
}

// Componente específico para período de seguimiento
export function ValidatedPeriodInput(props: Omit<ValidatedInputProps, 'type' | 'placeholder'>) {
  return (
    <ValidatedInput
      {...props}
      type="text"
      placeholder="Ej: Q1-2024, S1-2024, ANUAL-2024"
    />
  );
}