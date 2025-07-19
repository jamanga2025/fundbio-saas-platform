"use client";

import { useState, useRef } from 'react';
import { Upload, FileText, MapPin, AlertCircle, CheckCircle, X } from 'lucide-react';
// @ts-ignore
import shpjs from 'shpjs';

interface ShapefileUploadProps {
  onDataLoaded: (geoJsonData: any, fileName: string) => void;
  onError?: (error: string) => void;
  acceptedFormats?: string[];
  maxFileSize?: number; // en MB
}

interface UploadedFile {
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  geoJsonData?: any;
}

export default function ShapefileUpload({
  onDataLoaded,
  onError,
  acceptedFormats = ['.zip', '.geojson', '.json'],
  maxFileSize = 50
}: ShapefileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validar tamaño
    if (file.size > maxFileSize * 1024 * 1024) {
      return `El archivo excede el tamaño máximo de ${maxFileSize}MB`;
    }

    // Validar formato
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(extension)) {
      return `Formato no soportado. Formatos aceptados: ${acceptedFormats.join(', ')}`;
    }

    return null;
  };

  const processShapefileZip = async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const geoJson = await shpjs(arrayBuffer);
          resolve(geoJson);
        } catch (error) {
          reject(new Error('Error procesando archivo Shapefile: ' + (error as Error).message));
        }
      };
      reader.onerror = () => reject(new Error('Error leyendo el archivo'));
      reader.readAsArrayBuffer(file);
    });
  };

  const processGeoJsonFile = async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const geoJson = JSON.parse(text);
          
          // Validar que sea un GeoJSON válido
          if (!geoJson.type || (geoJson.type !== 'FeatureCollection' && geoJson.type !== 'Feature')) {
            reject(new Error('El archivo no es un GeoJSON válido'));
            return;
          }
          
          resolve(geoJson);
        } catch (error) {
          reject(new Error('Error parseando JSON: ' + (error as Error).message));
        }
      };
      reader.onerror = () => reject(new Error('Error leyendo el archivo'));
      reader.readAsText(file);
    });
  };

  const processFile = async (file: File) => {
    const fileId = Date.now() + '_' + file.name;
    
    // Agregar archivo a la lista
    setUploadedFiles(prev => [...prev, {
      file,
      status: 'processing'
    }]);

    try {
      let geoJsonData;
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();

      if (extension === '.zip') {
        geoJsonData = await processShapefileZip(file);
      } else if (['.geojson', '.json'].includes(extension)) {
        geoJsonData = await processGeoJsonFile(file);
      } else {
        throw new Error('Formato de archivo no soportado');
      }

      // Actualizar estado del archivo
      setUploadedFiles(prev => prev.map(f => 
        f.file.name === file.name ? { ...f, status: 'success', geoJsonData } : f
      ));

      // Notificar al componente padre
      onDataLoaded(geoJsonData, file.name);

    } catch (error) {
      const errorMessage = (error as Error).message;
      
      // Actualizar estado del archivo
      setUploadedFiles(prev => prev.map(f => 
        f.file.name === file.name ? { ...f, status: 'error', error: errorMessage } : f
      ));

      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const validation = validateFile(file);
      if (validation) {
        if (onError) {
          onError(validation);
        }
        return;
      }

      processFile(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.file.name !== fileName));
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'processing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <FileText size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Área de carga */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload size={48} className="text-gray-400" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Subir Archivos Geoespaciales
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>Formatos soportados: {acceptedFormats.join(', ')}</p>
              <p>Tamaño máximo: {maxFileSize}MB por archivo</p>
            </div>
          </div>
          
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Seleccionar Archivos
          </button>
        </div>
      </div>

      {/* Lista de archivos subidos */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Archivos procesados:</h4>
          
          {uploadedFiles.map((uploadedFile, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(uploadedFile.status)}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(uploadedFile.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  {uploadedFile.status === 'error' && uploadedFile.error && (
                    <p className="text-xs text-red-600 mt-1">
                      {uploadedFile.error}
                    </p>
                  )}
                  {uploadedFile.status === 'success' && uploadedFile.geoJsonData && (
                    <p className="text-xs text-green-600 mt-1">
                      {uploadedFile.geoJsonData.features?.length || 1} geometría(s) cargada(s)
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => removeFile(uploadedFile.file.name)}
                className="text-gray-400 hover:text-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <MapPin size={16} className="text-blue-600 mt-0.5" />
          <div className="text-sm">
            <h5 className="font-medium text-blue-900 mb-1">
              Información sobre formatos soportados:
            </h5>
            <ul className="text-blue-800 space-y-1">
              <li><strong>.zip:</strong> Archivos Shapefile comprimidos (debe incluir .shp, .shx, .dbf)</li>
              <li><strong>.geojson/.json:</strong> Archivos GeoJSON estándar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}