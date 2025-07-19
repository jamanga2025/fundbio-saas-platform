import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/server/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "AYUNTAMIENTO") {
      return NextResponse.json(
        { 
          success: false, 
          error: "Unauthorized" 
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { proyectoId } = body;

    // Buscar el usuario por email
    if (!session.user.email) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Email de usuario no disponible" 
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Usuario no encontrado" 
        },
        { status: 404 }
      );
    }

    // Verificar que el proyecto existe
    const proyecto = await prisma.proyecto.findUnique({
      where: { id: proyectoId }
    });

    if (!proyecto) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Proyecto no encontrado" 
        },
        { status: 404 }
      );
    }

    // Actualizar la asociación del usuario
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { proyectoId: proyectoId },
      include: { proyecto: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        proyectoId: updatedUser.proyectoId,
        proyecto: updatedUser.proyecto
      },
      message: 'Usuario asociado al proyecto exitosamente',
    });

  } catch (error) {
    console.error('Error associating user to project:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}