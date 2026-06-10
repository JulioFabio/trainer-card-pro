import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { withTelemetry } from '../../../lib/telemetry';
import { performance } from 'perf_hooks';

export const GET = withTelemetry(async function GET() {
  let dbStatus = 'unhealthy';
  let dbTimingMs = 0;

  try {
    const start = performance.now();
    // Fast test query to verify SQLite connectivity
    await prisma.$queryRaw`SELECT 1`;
    dbTimingMs = performance.now() - start;
    dbStatus = 'healthy';
  } catch (err) {
    dbStatus = 'unhealthy';
  }

  const memory = process.memoryUsage();
  const cpu = process.cpuUsage();
  const uptime = process.uptime();

  const isHealthy = dbStatus === 'healthy';

  return NextResponse.json(
    {
      status: isHealthy ? 'UP' : 'DOWN',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          latencyMs: parseFloat(dbTimingMs.toFixed(2)),
        },
      },
      metrics: {
        uptimeSeconds: parseFloat(uptime.toFixed(2)),
        memory: {
          heapTotalBytes: memory.heapTotal,
          heapUsedBytes: memory.heapUsed,
          rssBytes: memory.rss,
          externalBytes: memory.external,
        },
        cpu: {
          userMicroseconds: cpu.user,
          systemMicroseconds: cpu.system,
        },
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
});
