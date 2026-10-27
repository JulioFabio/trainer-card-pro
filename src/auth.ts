import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { logger } from "@/lib/telemetry";
import { resolveAuthSecret } from "@/lib/authSecret";
import { authorizeLocalGm, authorizeProfile } from "@/lib/authorize";

// Configuração do NextAuth v5 (Auth.js). Dois caminhos de entrada, ambos com papel
// lido do banco: `profile` (jogadores, caixa de seleção com senha opcional) e
// `local-gm` (Mestre, apenas por acesso local direto ao computador).
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: resolveAuthSecret(),
  trustHost: true,
  providers: [
    CredentialsProvider({
      id: "profile",
      name: "Perfil",
      credentials: {
        profileId: { label: "Perfil", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        return authorizeProfile(credentials);
      },
    }),
    CredentialsProvider({
      id: "local-gm",
      name: "Mestre (computador local)",
      credentials: {},
      async authorize(_credentials, request) {
        return authorizeLocalGm(request.headers);
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 3 * 60 * 60, // 3 horas de janela de sessão
    updateAge: 15 * 60,  // Atualiza o token a cada 15 minutos de atividade
  },
  pages: {
    signIn: "/login",
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
  logger: {
    error(code, ...message) {
      logger.error(`NextAuth Error: ${code}`, undefined, { details: message.map(String) });
    },
    warn(code) {
      logger.warn(`NextAuth Warn: ${code}`);
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role === "GM" ? "GM" : "PLAYER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = (token.role as string) || "PLAYER";
      }
      return session;
    },
  },
});
