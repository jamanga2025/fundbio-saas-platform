import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const indicador_id = searchParams.get('indicador_id');

    const where: any = {};
    if (indicador_id) {
      where.indicador_estrategico_id = indicador_id;
    }

    const valores = await prisma.valorIndicadorEstrategico.findMany({
      where,
      include: {
        indicador_estrategico: true,
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
    console.error('Error fetching valores estratégicos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error fetching valores estratégicos' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      valor_si_no,
      valor_numerico,
      valor_texto,
      fecha_medicion,
      observaciones,
      indicador_estrategico_id,
    } = body;

    const valorEstrategico = await prisma.valorIndicadorEstrategico.create({
      data: {
        valor_si_no,
        valor_numerico,
        valor_texto,
        fecha_medicion: fecha_medicion ? new Date(fecha_medicion) : null,
        observaciones,
        indicador_estrategico_id,
      },
    });

    return NextResponse.json({
      success: true,
      data: valorEstrategico,
      message: 'Valor estratégico creado exitosamente',
    });
  } catch (error) {
    console.error('Error creating valor estratégico:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error creating valor estratégico' 
      },
      { status: 500 }
    );
  }
}