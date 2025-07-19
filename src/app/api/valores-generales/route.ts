import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const indicador_id = searchParams.get('indicador_id');

    const where: any = {};
    if (indicador_id) {
      where.indicador_general_id = indicador_id;
    }

    const valores = await prisma.valorIndicadorGeneral.findMany({
      where,
      include: {
        indicador_general: true,
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
    console.error('Error fetching valores generales:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error fetching valores generales' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      valor_linea_base,
      valor_intermedio,
      valor_final,
      fecha_medicion,
      observaciones,
      indicador_general_id,
    } = body;

    const valorGeneral = await prisma.valorIndicadorGeneral.create({
      data: {
        valor_linea_base,
        valor_intermedio,
        valor_final,
        fecha_medicion: fecha_medicion ? new Date(fecha_medicion) : null,
        observaciones,
        indicador_general_id,
      },
    });

    return NextResponse.json({
      success: true,
      data: valorGeneral,
      message: 'Valor general creado exitosamente',
    });
  } catch (error) {
    console.error('Error creating valor general:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error creating valor general' 
      },
      { status: 500 }
    );
  }
}