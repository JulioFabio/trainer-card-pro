import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { withTelemetry } from "../../../lib/telemetry";

export const POST = withTelemetry(async function POST(request: Request) {
  const formData = await request.formData();
  
  const file = formData.get("file") as File | null;
  const characterId = formData.get("characterId") as string | null;

  if (!file || !characterId) {
    return NextResponse.json(
      { error: "Arquivo ou characterId ausente na requisição." },
      { status: 400 }
    );
  }

  // Lendo o arquivo como um buffer binário
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Sanitizando o nome do arquivo para evitar injeções ou caracteres inválidos
  const safeFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
  
  // Definindo o diretório de destino físico: public/uploads/{characterId}
  const uploadDir = path.join(process.cwd(), "public", "uploads", characterId);
  
  // Criando a pasta recursivamente (se não existir)
  await fs.mkdir(uploadDir, { recursive: true });
  
  // Caminho absoluto final do arquivo no disco
  const filePath = path.join(uploadDir, safeFilename);
  
  // Salvando fisicamente
  await fs.writeFile(filePath, buffer);
  
  // Caminho relativo para ser servido estaticamente pelo Next.js
  const relativeUrl = `/uploads/${characterId}/${safeFilename}`;
  
  return NextResponse.json({ url: relativeUrl }, { status: 201 });
});

