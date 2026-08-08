import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/telemetry";

// Configuração centralizada do NextAuth v5 (Auth.js)
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "development-fallback-secret-key-1234567890-abcdef",
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Mock Dev Login",
      credentials: {
        username: { label: "Nome do Treinador", type: "text", placeholder: "Ash Ketchum" },
        email: { label: "E-mail", type: "email", placeholder: "ash@ketchum.com" },
        role: { label: "Cargo (PLAYER ou GM)", type: "text", placeholder: "PLAYER" },
      },
      async authorize(credentials) {
        if (!credentials?.username) return null;
        
        const username = credentials.username as string;
        const email = (credentials.email as string) || `${username.toLowerCase().replace(/\s+/g, '')}@dev.com`;
        const role = (credentials.role as string) || "PLAYER";

        // Busca ou cria o usuário correspondente no banco SQLite local
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: username,
              email,
              role,
            },
          });
        } else if (user.role !== role) {
          user = await prisma.user.update({
            where: { email },
            data: { role },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 3 * 60 * 60, // 3 horas de janela de sessão (Segurança contra roubo de sessão)
    updateAge: 15 * 60,  // Atualiza o token a cada 15 minutos de atividade
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  // Integração com o ecossistema de observabilidade e telemetria (DevOps Telemetry Skill)
  logger: {
    error(code, ...message) {
      logger.error(`NextAuth Error: ${code}`, { details: message });
    },
    warn(code, ...message) {
      logger.warn(`NextAuth Warn: ${code}`, { details: message });
    },
  },
  events: {
    async createUser(message) {
      const { user } = message;
      try {
        // Lógica "O Primeiro a Chegar é o Rei" para auto-atribuição de GM
        const userCount = await prisma.user.count();
        if (userCount === 1) {
          logger.info(`Primeiro usuário registrado no banco de dados. Atribuindo cargo de GM (Mestre) ao usuário: ${user.id}`);
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "GM" },
          });
        }
      } catch (err) {
        logger.error(`Erro ao verificar total de usuários ou atribuir cargo de GM`, err);
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "PLAYER";
      }
      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        // Suporta tanto estratégia JWT quanto Database de forma híbrida e resiliente
        if (token) {
          session.user.id = token.id as string;
          (session.user as any).role = (token.role as string) || "PLAYER";
        } else if (user) {
          session.user.id = user.id;
          (session.user as any).role = (user as any).role || "PLAYER";
        }
      }
      return session;
    },
  },
});
