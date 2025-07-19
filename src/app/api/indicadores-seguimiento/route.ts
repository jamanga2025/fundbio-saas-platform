import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const proyecto_id = searchParams.get('proyecto_id');

    const where: any = {};
    if (proyecto_id) {
      where.proyecto_id = proyecto_id;
    }

    const indicadores = await prisma.indicadorSeguimiento.findMany({
      where,
      include: {
        proyecto: true,
        valores: true,
      },
      orderBy: {
        codigo: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: indicadores,
    });
  } catch (error) {
    console.error('Error fetching indicadores de seguimiento:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error fetching indicadores de seguimiento' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      codigo,
      indicador,
      escala,
      unidad,
      origen_calculo,
      objetivos_2025,
      observaciones,
      proyecto_id,
    } = body;

    const indicadorSeguimiento = await prisma.indicadorSeguimiento.create({
      data: {
        codigo,
        indicador,
        escala,
        unidad,
        origen_calculo,
        objetivos_2025,
        observaciones,
        proyecto_id,
      },
    });

    return NextResponse.json({
      success: true,
      data: indicadorSeguimiento,
      message: 'Indicador de seguimiento creado exitosamente',
    });
  } catch (error) {
    console.error('Error creating indicador de seguimiento:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error creating indicador de seguimiento' 
      },
      { status: 500 }
    );
  }
}