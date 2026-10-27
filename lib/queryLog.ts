import { logger } from './telemetry';

const SLOW_QUERY_MS = Number(process.env.SLOW_QUERY_MS) || 100;

// Só queries lentas são logadas, e nunca com `params` (podem conter dados de ficha).
export function handleQueryEvent(e: { query: string; duration: number }) {
  if (e.duration > SLOW_QUERY_MS) {
    logger.warn(`Slow DB Query`, {
      component: 'Database',
      query: e.query,
      durationMs: e.duration,
    });
  } else {
    logger.debug(`DB Query Executed`, {
      component: 'Database',
      query: e.query,
      durationMs: e.duration,
    });
  }
}
