import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/server/auth';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'AYUNTAMIENTO') {
      return NextResponse.json({ success: false, error: 'Rol no autorizado' }, { status: 403 });
    }

    // Crear datos de ejemplo para el template
    const templateData = [
      // Headers
      ['codigo', 'valor_linea_base', 'valor_intermedio', 'valor_final', 'fecha_medicion', 'observaciones', 'tipo'],
      // Ejemplos de datos
      ['SUP-001', '1000', '1500', '2000', '2024-01-15', 'Superficie naturalizada inicial', 'general'],
      ['SUP-002', '500', '750', '1000', '2024-01-15', 'Superficie peatonalizada', 'general'],
      ['BDU-001', '15', '20', '25', '2024-01-15', 'Número de especies identificadas', 'general'],
      ['CON-001', '0.5', '0.7', '0.9', '2024-01-15', 'Índice de conectividad', 'general'],
      ['A-001', 'true', '', '', '2024-01-15', 'Documento estratégico completado', 'estrategico'],
      ['A-002', '1', '', '', '2024-01-15', 'Número de planes aprobados', 'estrategico'],
      ['SEG-001', '100', '', '', '2024-01-15', 'Indicador de seguimiento Q1', 'seguimiento'],
      ['', '', '', '', '', 'Añadir más filas según sea necesario...', '']
    ];

    // Crear workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // Configurar anchos de columna
    ws['!cols'] = [
      { width: 12 }, // codigo
      { width: 15 }, // valor_linea_base
      { width: 15 }, // valor_intermedio  
      { width: 15 }, // valor_final
      { width: 15 }, // fecha_medicion
      { width: 30 }, // observaciones
      { width: 12 }  // tipo
    ];

    // Añadir hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Indicadores');

    // Crear segunda hoja with instructions
    const instructionsData = [
      ['INSTRUCCIONES DE USO - TEMPLATE CARGA MASIVA'],
      [''],
      ['1. CAMPOS OBLIGATORIOS:'],
      ['   - codigo: Código del indicador (ej: SUP-001, BDU-001, etc.)'],
      ['   - tipo: Tipo de indicador (general, estrategico, seguimiento)'],
      [''],
      ['2. CAMPOS OPCIONALES:'],
      ['   - valor_linea_base: Valor inicial del indicador'],
      ['   - valor_intermedio: Valor intermedio del proyecto'],
      ['   - valor_final: Valor final del proyecto'],
      ['   - fecha_medicion: Fecha de medición (formato: YYYY-MM-DD)'],
      ['   - observaciones: Comentarios adicionales'],
      [''],
      ['3. TIPOS DE INDICADORES:'],
      ['   - general: Indicadores SUP, BDU, CON, RES, CBA, CBS, GEN, C'],
      ['   - estrategico: Indicadores A (A-001, A-002, etc.)'],
      ['   - seguimiento: Indicadores SEG (SEG-001, SEG-002, etc.)'],
      [''],
      ['4. NOTAS IMPORTANTES:'],
      ['   - No modificar los nombres de las columnas'],
      ['   - Los códigos deben existir en el sistema'],
      ['   - Fechas en formato YYYY-MM-DD'],
      ['   - Valores numéricos sin caracteres especiales'],
      ['   - Para indicadores estratégicos Si/No usar: true/false'],
      [''],
      ['5. EJEMPLO DE USO:'],
      ['   - Completar las filas con datos reales'],
      ['   - Guardar el archivo como Excel (.xlsx)'],
      ['   - Usar la función "Carga Masiva Excel" en el dashboard'],
      ['   - Revisar los resultados y errores reportados']
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    wsInstructions['!cols'] = [{ width: 80 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instrucciones');

    // Generar buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Crear respuesta con el archivo
    const response = new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="template_carga_masiva_indicadores.xlsx"`,
        'Content-Length': buffer.length.toString()
      }
    });

    return response;

  } catch (error) {
    console.error('Error generando template:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}