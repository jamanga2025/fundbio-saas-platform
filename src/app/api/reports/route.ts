import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/server/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "FUNDACION") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const proyecto_id = searchParams.get("proyecto_id");

    // Get all projects with their indicators
    const proyectos = await prisma.proyecto.findMany({
      where: proyecto_id ? { id: proyecto_id } : undefined,
      include: {
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
      orderBy: {
        nombre: "asc",
      },
    });

    // Transform data for the report
    const reportData = proyectos.map(proyecto => ({
      proyecto: {
        id: proyecto.id,
        nombre: proyecto.nombre,
        entidad: proyecto.entidad,
        municipio: proyecto.municipio,
        codigo_proyecto: proyecto.codigo_proyecto,
      },
      resumen: {
        indicadores_generales: proyecto.indicadores_generales.length,
        indicadores_estrategicos: proyecto.indicadores_estrategicos.length,
        indicadores_seguimiento: proyecto.indicadores_seguimiento.length,
        total_valores_generales: proyecto.indicadores_generales.reduce((acc, ind) => acc + ind.valores.length, 0),
        total_valores_estrategicos: proyecto.indicadores_estrategicos.reduce((acc, ind) => acc + ind.valores.length, 0),
        total_valores_seguimiento: proyecto.indicadores_seguimiento.reduce((acc, ind) => acc + ind.valores.length, 0),
      },
      indicadores_generales: proyecto.indicadores_generales.map(ind => ({
        codigo: ind.codigo,
        indicador: ind.indicador,
        categoria: ind.categoria_prefijo,
        valores: ind.valores.length,
        ultimo_valor: ind.valores[0] ? {
          linea_base: ind.valores[0].valor_linea_base,
          intermedio: ind.valores[0].valor_intermedio,
          final: ind.valores[0].valor_final,
          fecha: ind.valores[0].fecha_medicion,
        } : null,
      })),
      indicadores_estrategicos: proyecto.indicadores_estrategicos.map(ind => ({
        codigo: ind.codigo,
        indicador: ind.indicador,
        valores: ind.valores.length,
        ultimo_valor: ind.valores[0] ? {
          si_no: ind.valores[0].valor_si_no,
          numerico: ind.valores[0].valor_numerico,
          texto: ind.valores[0].valor_texto,
          fecha: ind.valores[0].fecha_medicion,
        } : null,
      })),
      indicadores_seguimiento: proyecto.indicadores_seguimiento.map(ind => ({
        codigo: ind.codigo,
        indicador: ind.indicador,
        valores: ind.valores.length,
        ultimos_valores: ind.valores.slice(0, 3).map(val => ({
          periodo: val.periodo_seguimiento,
          numerico: val.valor_numerico,
          texto: val.valor_texto,
          fecha: val.fecha_medicion,
        })),
      })),
    }));

    return NextResponse.json({
      success: true,
      data: reportData,
      total_proyectos: proyectos.length,
    });
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 });
  }
}