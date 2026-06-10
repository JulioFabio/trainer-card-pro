---
name: devops-nextjs-telemetry
description: >-
  Orienta a implantação de um sistema robusto de observabilidade, telemetria e monitoramento de produção (Request IDs, JSON logs, Health Check e alertas) em Next.js App Router.
---

# Telemetria e Observabilidade em Next.js

## Overview

Esta habilidade orienta agentes no processo de implantação de um sistema completo de telemetria e observabilidade para produção em aplicações Next.js (App Router), garantindo rastreabilidade fim-a-fim de requisições, medição de latência física do banco de dados, alertas de anomalias de performance e monitoramento automatizado de deploys.

## Quick Start

Para habilitar a telemetria em uma rota de API:
1. Importe o helper `withTelemetry`.
2. Envolva seus handlers de rota exportados:

```typescript
import { withTelemetry } from '@/lib/telemetry';
import { NextResponse } from 'next/server';

export const GET = withTelemetry(async function GET(request: Request) {
  return NextResponse.json({ message: 'Success' });
});
```

---

## Modelos de Código (Templates)

### 1. Módulo de Telemetria (`lib/telemetry.ts`)
Este arquivo centraliza o contexto assíncrono do Request ID, define o formatador JSON e cria o wrapper de rotas HTTP.

```typescript
import { AsyncLocalStorage } from 'async_hooks';
import { NextResponse } from 'next/server';
import { performance } from 'perf_hooks';

export interface TelemetryStore {
  requestId: string;
}

export const telemetryContext = new AsyncLocalStorage<TelemetryStore>();

export function generateRequestId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
}

export const logger = {
  info(message: string, context?: any) {
    const store = telemetryContext.getStore();
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      requestId: store?.requestId || null,
      message,
      ...context
    }));
  },
  warn(message: string, context?: any) {
    const store = telemetryContext.getStore();
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      requestId: store?.requestId || null,
      message,
      ...context
    }));
  },
  error(message: string, error?: any, context?: any) {
    const store = telemetryContext.getStore();
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      requestId: store?.requestId || null,
      message,
      error: error instanceof Error ? error.message : String(error || 'Unknown'),
      stack: error instanceof Error ? error.stack : undefined,
      ...context
    }));
  }
};

function checkPerformanceAnomaly(durationMs: number, heapUsed: number) {
  const DURATION_LIMIT = 500;
  const MEMORY_LIMIT = 150 * 1024 * 1024; // 150MB

  if (durationMs > DURATION_LIMIT) {
    logger.warn(`ANOMALY: High Latency`, {
      anomalyType: 'LATENCY',
      value: durationMs,
      limit: DURATION_LIMIT
    });
  }
  if (heapUsed > MEMORY_LIMIT) {
    logger.warn(`ANOMALY: High Memory Usage`, {
      anomalyType: 'MEMORY',
      value: heapUsed,
      limit: MEMORY_LIMIT
    });
  }
}

export function withTelemetry(handler: (req: Request, context?: any) => Promise<NextResponse>) {
  return async (req: Request, context?: any) => {
    const requestId = generateRequestId();
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    const startCpu = process.cpuUsage();

    return telemetryContext.run({ requestId }, async () => {
      logger.info(`Request started: ${req.method} ${req.url}`);

      let response: NextResponse;
      try {
        response = await handler(req, context);
      } catch (err) {
        logger.error(`Request failed with unhandled error`, err);
        response = NextResponse.json({ error: 'Erro interno', requestId }, { status: 500 });
      }

      const durationMs = performance.now() - startTime;
      const endMemory = process.memoryUsage().heapUsed;
      const endCpu = process.cpuUsage(startCpu);

      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Response-Time-Ms', durationMs.toFixed(2));

      logger.info(`Request finished`, {
        status: response.status,
        durationMs,
        memoryDeltaBytes: endMemory - startMemory,
        cpuTimeUserMs: endCpu.user / 1000,
        cpuTimeSystemMs: endCpu.system / 1000
      });

      checkPerformanceAnomaly(durationMs, endMemory);
      return response;
    });
  };
}
```

### 2. Endpoint de Health Check (`app/api/health/route.ts`)
Medição de integridade do banco relacional, uptime e consumo físico de recursos de CPU e RAM.

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withTelemetry } from '@/lib/telemetry';
import { performance } from 'perf_hooks';

export const GET = withTelemetry(async function GET() {
  let dbStatus = 'unhealthy';
  let dbTimingMs = 0;

  try {
    const start = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    dbTimingMs = performance.now() - start;
    dbStatus = 'healthy';
  } catch {
    dbStatus = 'unhealthy';
  }

  const memory = process.memoryUsage();
  const cpu = process.cpuUsage();
  const uptime = process.uptime();

  const isHealthy = dbStatus === 'healthy';

  return NextResponse.json({
    status: isHealthy ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString(),
    services: { database: { status: dbStatus, latencyMs: dbTimingMs } },
    metrics: {
      uptimeSeconds: uptime,
      memory: { heapUsedBytes: memory.heapUsed, heapTotalBytes: memory.heapTotal, rssBytes: memory.rss },
      cpu: { userMicroseconds: cpu.user, systemMicroseconds: cpu.system }
    }
  }, { status: isHealthy ? 200 : 503 });
});
```

---

## Common Mistakes

- **Logs mistos**: Misturar saídas `console.log("texto livre")` que quebram parsers de ingestão de logs em produção. Use sempre o `logger.info` estruturado.
- **Acoplamento no Contexto**: Tentar extrair o Request ID de forma manual repassando-o por múltiplos sub-parâmetros ao invés de usar `telemetryContext.getStore()`.
- **Falta de Invalidação de Cache**: Cachear dados mutáveis e esquecer de disparar o `memoryCache.delete(key)` em rotas POST/PUT/DELETE.
