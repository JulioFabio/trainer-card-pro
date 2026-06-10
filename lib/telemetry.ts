import { AsyncLocalStorage } from 'async_hooks';
import { NextResponse } from 'next/server';
import { performance } from 'perf_hooks';

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

export const logger = {
  info(message: string, context?: any) {
    const store = telemetryContext.getStore();
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        requestId: store?.requestId || null,
        message,
        ...context,
      })
    );
  },

  warn(message: string, context?: any) {
    const store = telemetryContext.getStore();
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'WARN',
        requestId: store?.requestId || null,
        message,
        ...context,
      })
    );
  },

  error(message: string, error?: any, context?: any) {
    const store = telemetryContext.getStore();
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        requestId: store?.requestId || null,
        message,
        error: error instanceof Error ? error.message : String(error || 'Unknown Error'),
        stack: error instanceof Error ? error.stack : undefined,
        ...context,
      })
    );
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
