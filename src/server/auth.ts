import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
      proyectoId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    proyectoId?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
        role: token.role,
        proyectoId: token.proyectoId,
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.proyectoId = user.proyectoId;
      }
      return token;
    },
  },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // For development, we'll use simple email/password validation
        // In production, you should hash passwords and validate properly
        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { proyecto: true },
        });

        if (!user) {
          // Create user if doesn't exist (for development)
          const role = credentials.role === "FUNDACION" ? UserRole.FUNDACION : UserRole.AYUNTAMIENTO;
          
          // For ayuntamiento users, try to find a matching project by email domain
          let proyectoId = null;
          if (role === UserRole.AYUNTAMIENTO) {
            const emailDomain = credentials.email.split('@')[1];
            const municipio = credentials.email.split('@')[0].includes('pinto') ? 'Pinto' : null;
            
            if (municipio) {
              const proyecto = await db.proyecto.findFirst({
                where: {
                  municipio: {
                    contains: municipio,
                    mode: 'insensitive'
                  }
                }
              });
              if (proyecto) proyectoId = proyecto.id;
            }
          }
          
          const newUser = await db.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split("@")[0],
              role: role,
              proyectoId: proyectoId,
            },
            include: { proyecto: true },
          });

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            proyectoId: newUser.proyectoId,
          };
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          proyectoId: user.proyectoId,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};