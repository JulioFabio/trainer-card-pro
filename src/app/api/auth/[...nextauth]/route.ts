import { handlers } from "@/auth";

// Exporta apenas os métodos HTTP necessários para evitar erros de compilação do Next.js App Router
export const { GET, POST } = handlers;
