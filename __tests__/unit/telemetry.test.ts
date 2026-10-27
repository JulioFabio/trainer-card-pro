import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// LOG_LEVEL é lido no carregamento do módulo, então cada teste reimporta.
async function loadTelemetry(level?: string) {
  vi.resetModules();
  if (level === undefined) vi.stubEnv("LOG_LEVEL", "");
  else vi.stubEnv("LOG_LEVEL", level);
  return import("@/lib/telemetry");
}

function emitAll(logger: Awaited<ReturnType<typeof loadTelemetry>>["logger"]) {
  logger.debug("d");
  logger.info("i");
  logger.warn("w");
  logger.error("e", new Error("boom"));
}

describe("logger (Unit)", () => {
  let log: ReturnType<typeof vi.spyOn>;
  let warn: ReturnType<typeof vi.spyOn>;
  let error: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    log = vi.spyOn(console, "log").mockImplementation(() => {});
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    error = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  const messages = () =>
    [...log.mock.calls, ...warn.mock.calls, ...error.mock.calls].map(
      (c) => JSON.parse(c[0] as string).message
    );

  it("Nível padrão: emite info, warn e error, mas não debug", async () => {
    const { logger } = await loadTelemetry();
    emitAll(logger);
    expect(messages().sort()).toEqual(["e", "i", "w"]);
  });

  it("Nível restrito: LOG_LEVEL=warn emite apenas warn e error", async () => {
    const { logger } = await loadTelemetry("warn");
    emitAll(logger);
    expect(messages().sort()).toEqual(["e", "w"]);
  });

  it("LOG_LEVEL=debug emite todos os níveis", async () => {
    const { logger } = await loadTelemetry("debug");
    emitAll(logger);
    expect(messages().sort()).toEqual(["d", "e", "i", "w"]);
  });

  it("valor inválido de LOG_LEVEL cai no padrão info", async () => {
    const { logger } = await loadTelemetry("verboso");
    emitAll(logger);
    expect(messages().sort()).toEqual(["e", "i", "w"]);
  });

  it("não serializa o registro quando o nível está desligado", async () => {
    const { logger } = await loadTelemetry("error");
    const stringify = vi.spyOn(JSON, "stringify");
    logger.debug("d", { a: 1 });
    logger.info("i", { a: 1 });
    expect(stringify).not.toHaveBeenCalled();
  });

  it("Registro dentro de uma requisição: inclui o requestId do contexto", async () => {
    const { logger, telemetryContext } = await loadTelemetry();
    telemetryContext.run({ requestId: "req-123" }, () => logger.info("dentro"));
    logger.info("fora");

    const [dentro, fora] = log.mock.calls.map((c: unknown[]) => JSON.parse(c[0] as string));
    expect(dentro).toMatchObject({ level: "INFO", message: "dentro", requestId: "req-123" });
    expect(typeof dentro.timestamp).toBe("string");
    expect(fora.requestId).toBeNull();
  });
});
