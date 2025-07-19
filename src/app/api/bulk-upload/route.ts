import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/server/auth';
import { db } from '@/server/db';
import { sanitizeInput } from '@/lib/validation';
import { validateIndicatorData } from '@/lib/indicator-validation';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'AYUNTAMIENTO') {
      return NextResponse.json({ success: false, error: 'Rol no autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { records, proyectoId } = body;

    if (!records || !Array.isArray(records)) {
      return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 });
    }

    if (!proyectoId) {
      return NextResponse.json({ success: false, error: 'Proyecto no especificado' }, { status: 400 });
    }

    // Verificar que el usuario tiene acceso al proyecto
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { proyecto: true }
    });

    if (!user?.proyecto || user.proyecto.id !== proyectoId) {
      return NextResponse.json({ success: false, error: 'Acceso denegado al proyecto' }, { status: 403 });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const record of records) {
      try {
        // Sanitizar datos de entrada
        const sanitizedRecord = {
          codigo: sanitizeInput(record.codigo),
          valor_linea_base: record.valor_linea_base ? parseFloat(record.valor_linea_base) : null,
          valor_intermedio: record.valor_intermedio ? parseFloat(record.valor_intermedio) : null,
          valor_final: record.valor_final ? parseFloat(record.valor_final) : null,
          valor_si_no: record.valor_si_no,
          valor_numerico: record.valor_numerico ? parseFloat(record.valor_numerico) : null,
          valor_texto: sanitizeInput(record.valor_texto),
          fecha_medicion: record.fecha_medicion,
          periodo_seguimiento: sanitizeInput(record.periodo_seguimiento),
          observaciones: sanitizeInput(record.observaciones),
          tipo: record.tipo
        };

        // Buscar el indicador correspondiente
        let indicador = null;
        let indicadorId = null;
        
        if (sanitizedRecord.tipo === 'general') {
          indicador = await db.indicadorGeneral.findFirst({
            where: { 
              codigo: sanitizedRecord.codigo,
              proyecto_id: proyectoId
            }
          });
          indicadorId = indicador?.id;
        } else if (sanitizedRecord.tipo === 'estrategico') {
          indicador = await db.indicadorEstrategico.findFirst({
            where: { 
              codigo: sanitizedRecord.codigo,
              proyecto_id: proyectoId
            }
          });
          indicadorId = indicador?.id;
        } else if (sanitizedRecord.tipo === 'seguimiento') {
          indicador = await db.indicadorSeguimiento.findFirst({
            where: { 
              codigo: sanitizedRecord.codigo,
              proyecto_id: proyectoId
            }
          });
          indicadorId = indicador?.id;
        }

        if (!indicador) {
          results.push({
            codigo: sanitizedRecord.codigo,
            success: false,
            error: 'Indicador no encontrado'
          });
          errorCount++;
          continue;
        }

        // Validar datos usando el sistema de validación
        try {
          const validationResult = validateIndicatorData({
            name: sanitizedRecord.codigo || 'Unknown',
            value: parseFloat(sanitizedRecord.valor_numerico?.toString() || '') || parseFloat(sanitizedRecord.valor_linea_base?.toString() || '') || 0,
            unit: indicador.unidad || 'NUMERO',
            category: 'SUP',
            project_id: 'default-project',
            date: new Date().toISOString(),
            metadata: sanitizedRecord
          });
        } catch (validationError: any) {
          results.push({
            codigo: sanitizedRecord.codigo,
            success: false,
            error: `Datos inválidos: ${validationError?.message || 'Error de validación'}`
          });
          errorCount++;
          continue;
        }

        // Crear el valor según el tipo
        let createResult = null;
        
        if (sanitizedRecord.tipo === 'general') {
          createResult = await db.valorIndicadorGeneral.create({
            data: {
              valor_linea_base: sanitizedRecord.valor_linea_base,
              valor_intermedio: sanitizedRecord.valor_intermedio,
              valor_final: sanitizedRecord.valor_final,
              fecha_medicion: sanitizedRecord.fecha_medicion ? new Date(sanitizedRecord.fecha_medicion) : null,
              observaciones: sanitizedRecord.observaciones,
              indicador_general_id: indicadorId!
            }
          });
        } else if (sanitizedRecord.tipo === 'estrategico') {
          createResult = await db.valorIndicadorEstrategico.create({
            data: {
              valor_si_no: sanitizedRecord.valor_si_no === 'true' || sanitizedRecord.valor_si_no === true ? true : 
                          sanitizedRecord.valor_si_no === 'false' || sanitizedRecord.valor_si_no === false ? false : null,
              valor_numerico: sanitizedRecord.valor_numerico,
              valor_texto: sanitizedRecord.valor_texto,
              fecha_medicion: sanitizedRecord.fecha_medicion ? new Date(sanitizedRecord.fecha_medicion) : null,
              observaciones: sanitizedRecord.observaciones,
              indicador_estrategico_id: indicadorId!
            }
          });
        } else if (sanitizedRecord.tipo === 'seguimiento') {
          createResult = await db.valorSeguimiento.create({
            data: {
              valor_numerico: sanitizedRecord.valor_numerico,
              valor_texto: sanitizedRecord.valor_texto,
              fecha_medicion: sanitizedRecord.fecha_medicion ? new Date(sanitizedRecord.fecha_medicion) : new Date(),
              periodo_seguimiento: sanitizedRecord.periodo_seguimiento,
              observaciones: sanitizedRecord.observaciones,
              indicador_seguimiento_id: indicadorId!
            }
          });
        }

        results.push({
          codigo: sanitizedRecord.codigo,
          success: true,
          id: createResult?.id
        });
        successCount++;

      } catch (error) {
        console.error(`Error procesando ${record.codigo}:`, error);
        results.push({
          codigo: record.codigo,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Procesamiento completado: ${successCount} éxitos, ${errorCount} errores`,
      results,
      stats: {
        total: records.length,
        success: successCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('Error en bulk upload:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}