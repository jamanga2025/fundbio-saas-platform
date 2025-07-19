import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const indicador_id = searchParams.get('indicador_id');
    const periodo = searchParams.get('periodo');

    const where: any = {};
    if (indicador_id) {
      where.indicador_seguimiento_id = indicador_id;
    }
    if (periodo) {
      where.periodo_seguimiento = periodo;
    }

    const valores = await prisma.valorSeguimiento.findMany({
      where,
      include: {
        indicador_seguimiento: true,
      },
      orderBy: {
        fecha_medicion: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: valores,
    });
  } catch (error) {
    console.error('Error fetching valores de seguimiento:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error fetching valores de seguimiento' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      valor_numerico,
      valor_texto,
      fecha_medicion,
      periodo_seguimiento,
      observaciones,
      indicador_seguimiento_id,
    } = body;

    const valorSeguimiento = await prisma.valorSeguimiento.create({
      data: {
        valor_numerico,
        valor_texto,
        fecha_medicion: new Date(fecha_medicion),
        periodo_seguimiento,
        observaciones,
        indicador_seguimiento_id,
      },
    });

    return NextResponse.json({
      success: true,
      data: valorSeguimiento,
      message: 'Valor de seguimiento creado exitosamente',
    });
  } catch (error) {
    console.error('Error creating valor de seguimiento:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error creating valor de seguimiento' 
      },
      { status: 500 }
    );
  }
}