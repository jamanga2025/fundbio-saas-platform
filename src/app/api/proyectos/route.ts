import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const proyectos = await prisma.proyecto.findMany({
      include: {
        users: true,
        indicadores_generales: true,
        indicadores_estrategicos: true,
        indicadores_seguimiento: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: proyectos,
    });
  } catch (error) {
    console.error('Error fetching proyectos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error fetching proyectos' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const proyecto = await prisma.proyecto.create({
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
      message: 'Proyecto creado exitosamente',
    });
  } catch (error) {
    console.error('Error creating proyecto:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error creating proyecto' 
      },
      { status: 500 }
    );
  }
}