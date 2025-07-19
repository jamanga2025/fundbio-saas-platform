import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');
    const proyecto_id = searchParams.get('proyecto_id');

    const where: any = {};
    if (categoria) {
      where.categoria_prefijo = categoria;
    }
    if (proyecto_id) {
      where.proyecto_id = proyecto_id;
    }

    const indicadores = await prisma.indicadorGeneral.findMany({
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
    console.error('Error fetching indicadores generales:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error fetching indicadores generales' 
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
      categoria_prefijo,
      indicador,
      escala,
      unidad,
      origen_calculo,
      objetivos_2025,
      observaciones,
      proyecto_id,
    } = body;

    const indicadorGeneral = await prisma.indicadorGeneral.create({
      data: {
        codigo,
        categoria_prefijo,
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
      data: indicadorGeneral,
      message: 'Indicador general creado exitosamente',
    });
  } catch (error) {
    console.error('Error creating indicador general:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error creating indicador general' 
      },
      { status: 500 }
    );
  }
}