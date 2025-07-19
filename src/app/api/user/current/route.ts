import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/server/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          error: "No session found" 
        },
        { status: 401 }
      );
    }

    // Buscar el usuario actual en la base de datos
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
      where: { email: session.user.email },
      include: { proyecto: true }
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

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        proyectoId: user.proyectoId,
        proyecto: user.proyecto
      }
    });

  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}