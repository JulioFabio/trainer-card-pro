import { vi, type Mock } from "vitest";

// Ids no formato de UUID v4, como os que o servidor gera.
export const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

export const IDS = {
  gm: "user_gm",
  tulio: "user_tulio",
  robert: "user_robert",
  charTulio: uuid(1),
  charRobert: uuid(2),
  itemRobert: uuid(11),
  noteRobert: uuid(21),
  pokemonRobert: uuid(31),
  tradeId: uuid(41),
};

export type TestUser = { id: string; role: "GM" | "PLAYER" } | null;

export const USERS = {
  gm: { id: IDS.gm, role: "GM" } as const,
  tulio: { id: IDS.tulio, role: "PLAYER" } as const,
  robert: { id: IDS.robert, role: "PLAYER" } as const,
};

// Simula a sessão e o usuário correspondente no banco (o `requireUser` confere os dois).
export function signInAs(auth: Mock, findUser: Mock, user: TestUser) {
  if (!user) {
    auth.mockResolvedValue(null);
    findUser.mockResolvedValue(null);
    return;
  }
  auth.mockResolvedValue({ user: { id: user.id, role: user.role } });
  findUser.mockResolvedValue({ id: user.id, role: user.role });
}

export function silenceConsole() {
  for (const method of ["log", "info", "warn", "error"] as const) {
    vi.spyOn(console, method).mockImplementation(() => {});
  }
}

export function consoleOutput(): string {
  return (["log", "info", "warn", "error"] as const)
    .flatMap((m) => (console[m] as unknown as Mock).mock.calls)
    .map((call) => call.map(String).join(" "))
    .join("\n");
}

export function req(method: string, url: string, body?: unknown) {
  return new Request(`http://localhost${url}`, {
    method,
    ...(body !== undefined && { body: typeof body === "string" ? body : JSON.stringify(body) }),
  });
}
