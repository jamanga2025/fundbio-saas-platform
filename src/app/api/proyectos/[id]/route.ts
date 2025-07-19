import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proyecto = await prisma.proyecto.findUnique({
      where: { id: params.id },
      include: {
        users: true,
        indicadores_generales: {
          include: {
            valores: true,
          },
        },
        indicadores_estrategicos: {
          include: {
            valores: true,
          },
        },
        indicadores_seguimiento: {
          include: {
            valores: true,
          },
        },
      },
    });

    if (!proyecto) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Proyecto not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: proyecto,
    });
  } catch (error) {
    console.error('Error fetching proyecto:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error fetching proyecto' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      entidad,
      nif,
      nombre,
      comunidad_autonoma,
      provincia,
      municipio,
      fecha_inicio,
      fecha_finalizacion,
      codigo_proyecto,
      presupuesto_total,
      importe_ayuda,
      coordinador,
      descripcion,
    } = body;

    const proyecto = await prisma.proyecto.update({
      where: { id: params.id },
      data: {
        entidad,
        nif,
        nombre,
        comunidad_autonoma,
        provincia,
        municipio,
        fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : null,
        fecha_finalizacion: fecha_finalizacion ? new Date(fecha_finalizacion) : null,
        codigo_proyecto,
        presupuesto_total,
        importe_ayuda,
        coordinador,
        descripcion,
      },
    });

    return NextResponse.json({
      success: true,
      data: proyecto,
      message: 'Proyecto actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error updating proyecto:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error updating proyecto' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.proyecto.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Proyecto eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting proyecto:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error deleting proyecto' 
      },
      { status: 500 }
    );
  }
}