import { describe, expect, it } from "vitest";
import { createLoginLimiter, WINDOW_MS } from "@/lib/loginLimiter";

function setup() {
  let t = 1_000_000;
  const limiter = createLoginLimiter(() => t);
  return { limiter, advance: (ms: number) => (t += ms) };
}

describe("loginLimiter (Unit)", () => {
  it("Quinta falha seguida: bloqueia o perfil", () => {
    const { limiter } = setup();
    for (let i = 0; i < 4; i++) limiter.recordFailure("p1");
    expect(limiter.isBlocked("p1")).toBe(false);
    limiter.recordFailure("p1");
    expect(limiter.isBlocked("p1")).toBe(true);
  });

  it("Fim do bloqueio: volta a aceitar após 15 minutos", () => {
    const { limiter, advance } = setup();
    for (let i = 0; i < 5; i++) limiter.recordFailure("p1");
    advance(WINDOW_MS - 1);
    expect(limiter.isBlocked("p1")).toBe(true);
    advance(1);
    expect(limiter.isBlocked("p1")).toBe(false);
  });

  it("Sucesso zera a contagem", () => {
    const { limiter } = setup();
    for (let i = 0; i < 4; i++) limiter.recordFailure("p1");
    limiter.reset("p1");
    limiter.recordFailure("p1");
    expect(limiter.isBlocked("p1")).toBe(false);
  });

  it("falhas fora da janela não se acumulam", () => {
    const { limiter, advance } = setup();
    for (let i = 0; i < 4; i++) limiter.recordFailure("p1");
    advance(WINDOW_MS);
    limiter.recordFailure("p1");
    expect(limiter.isBlocked("p1")).toBe(false);
  });

  it("cada perfil tem a própria contagem", () => {
    const { limiter } = setup();
    for (let i = 0; i < 5; i++) limiter.recordFailure("p1");
    expect(limiter.isBlocked("p1")).toBe(true);
    expect(limiter.isBlocked("p2")).toBe(false);
  });
});
