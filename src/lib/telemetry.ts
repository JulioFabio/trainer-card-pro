import { AsyncLocalStorage } from 'async_hooks';
import { NextResponse } from 'next/server';
import { performance } from 'perf_hooks';
import { HttpError } from '@/lib/api/errors';

export interface TelemetryStore {
  requestId: string;
}

export const telemetryContext = new AsyncLocalStorage<TelemetryStore>();

export function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 } as const;
type LogLevel = keyof typeof LEVELS;

// Lido uma vez no carregamento do módulo; valor inválido cai no padrão `info`.
const envLevel = process.env.LOG_LEVEL?.toLowerCase();
const threshold: number = envLevel && envLevel in LEVELS ? LEVELS[envLevel as LogLevel] : LEVELS.info;

function emit(
  level: LogLevel,
  sink: (line: string) => void,
  message: string,
  extra: Record<string, unknown> = {}
) {
  // Filtra antes de montar o JSON: um log desligado não paga a serialização.
  if (LEVELS[level] < threshold) return;
  const store = telemetryContext.getStore();
  sink(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      requestId: store?.requestId || null,
      message,
      ...extra,
    })
  );
}

export const logger = {
  debug(message: string, context?: any) {
    emit('debug', console.log, message, context);
  },

  info(message: string, context?: any) {
    emit('info', console.log, message, context);
  },

  warn(message: string, context?: any) {
    emit('warn', console.warn, message, context);
  },

  error(message: string, error?: any, context?: any) {
    emit('error', console.error, message, {
      error: error instanceof Error ? error.message : String(error || 'Unknown Error'),
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    });
  },
};

function checkPerformanceAnomaly(durationMs: number, currentMemoryHeap: number) {
  const DURATION_LIMIT = 500; // 500ms limit
  const MEMORY_LIMIT = 150 * 1024 * 1024; // 150MB heap limit

  if (durationMs > DURATION_LIMIT) {
    logger.warn(`ANOMALY DETECTED: High Latency`, {
      component: 'SystemAlerts',
      anomalyType: 'LATENCY',
      value: durationMs,
      limit: DURATION_LIMIT,
      message: `Request processing took ${durationMs.toFixed(2)}ms, exceeding threshold of ${DURATION_LIMIT}ms`,
    });
  }

  if (currentMemoryHeap > MEMORY_LIMIT) {
    logger.warn(`ANOMALY DETECTED: High Memory Usage`, {
      component: 'SystemAlerts',
      anomalyType: 'MEMORY',
      value: currentMemoryHeap,
      limit: MEMORY_LIMIT,
      message: `Heap memory usage is ${Math.round(currentMemoryHeap / 1024 / 1024)}MB, exceeding threshold of ${Math.round(MEMORY_LIMIT / 1024 / 1024)}MB`,
    });
  }
}

export function withTelemetry(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any) => {
    const requestId = generateRequestId();
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    const startCpu = process.cpuUsage();

    return telemetryContext.run({ requestId }, async () => {
      logger.info(`Request started: ${request.method} ${request.url}`, {
        method: request.method,
        url: request.url,
      });

      let response: NextResponse;
      try {
        response = await handler(request, context);
      } catch (err) {
        if (err instanceof HttpError) {
          // Recusa esperada (sessão, permissão, validação): só identificadores e motivo,
          // nunca o corpo da requisição.
          logger.warn(`Requisição recusada (${err.status})`, {
            method: request.method,
            path: new URL(request.url).pathname,
            status: err.status,
            reason: err.message,
          });
          response = NextResponse.json({ error: err.message }, { status: err.status });
        } else {
          logger.error(`Request failed with unhandled error`, err, {
            method: request.method,
            url: request.url,
          });
          response = NextResponse.json(
            {
              error: 'Erro interno do servidor',
              requestId,
            },
            { status: 500 }
          );
        }
      }

      const durationMs = performance.now() - startTime;
      const endMemory = process.memoryUsage().heapUsed;
      const endCpu = process.cpuUsage(startCpu);

      // Add request ID and duration to the response headers
      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Response-Time-Ms', durationMs.toFixed(2));

      logger.info(`Request finished: ${request.method} ${request.url}`, {
        method: request.method,
        url: request.url,
        status: response.status,
        durationMs,
        memoryDeltaBytes: endMemory - startMemory,
        cpuTimeUserMs: endCpu.user / 1000,
        cpuTimeSystemMs: endCpu.system / 1000,
      });

      // Execute anomaly check
      checkPerformanceAnomaly(durationMs, endMemory);

      return response;
    });
  };
}
