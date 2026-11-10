// @vitest-environment node
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/session-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/session-store")>();
  return { ...actual, pushFeedback: vi.fn(), getFeedback: vi.fn() };
});

import { GET, POST } from "@/app/api/feedback/route";
import * as sessionStore from "@/lib/session-store";

function postRequest(body: unknown) {
  return new Request("http://localhost/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function savedEntry() {
  const call = vi.mocked(sessionStore.pushFeedback).mock.calls[0];
  return JSON.parse(call[0]);
}

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

// Risposta completa: tutti i campi obbligatori del modulo
function validBody(): Record<string, unknown> {
  return {
    ageGroup: "alunno",
    gameExperience: "digitale",
    screenMode: "multi",
    ...Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [`sus${i + 1}`, 3]),
    ),
    gameplayClarity: 4,
    graphics: 4,
    enjoyment: 5,
    funLevel: 4,
  };
}

describe("POST /api/feedback", () => {
  test("salva solo i campi previsti", async () => {
    const res = await POST(
      postRequest({
        ...validBody(),
        name: "Mario",
        sus1: 4,
        whatWorkedWell: "Tutto",
        email: "mario@example.com",
        ip: "1.2.3.4",
      }),
    );

    expect(res.status).toBe(200);
    const entry = savedEntry();
    expect(entry).toMatchObject({
      ageGroup: "alunno",
      sus1: 4,
      whatWorkedWell: "Tutto",
    });
    expect(entry.name).toBeUndefined();
    expect(entry.email).toBeUndefined();
    expect(entry.ip).toBeUndefined();
  });

  test("accetta i campi facoltativi vuoti o assenti", async () => {
    const res = await POST(
      postRequest({
        ...validBody(),
        autismIdentification: "",
        challenges: "",
      }),
    );
    expect(res.status).toBe(200);
    expect(savedEntry().digitalVsPhysical).toBeUndefined();
  });

  test("ignora submittedAt e id inviati dal client", async () => {
    await POST(postRequest({ ...validBody(), submittedAt: "x", id: "y" }));
    const entry = savedEntry();
    expect(entry.submittedAt).not.toBe("x");
    expect(entry.id).not.toBe("y");
  });

  test("salva solo la data, senza ora", async () => {
    await POST(postRequest(validBody()));
    expect(savedEntry().submittedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("usa un id casuale, non un timestamp", async () => {
    await POST(postRequest(validBody()));
    await POST(postRequest(validBody()));
    const calls = vi.mocked(sessionStore.pushFeedback).mock.calls;
    const ids = calls.map((c) => JSON.parse(c[0]).id);
    for (const id of ids) {
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    }
    expect(ids[0]).not.toBe(ids[1]);
  });

  test("tronca i testi lunghi", async () => {
    await POST(postRequest({ ...validBody(), challenges: "a".repeat(5000) }));
    expect(savedEntry().challenges).toHaveLength(2000);
  });

  test("usa la data italiana, non quella UTC", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-04T23:30:00Z")); // 00:30 a Roma
    await POST(postRequest(validBody()));
    vi.useRealTimers();
    expect(savedEntry().submittedAt).toBe("2026-11-05");
  });
});

describe("POST /api/feedback — input non valido", () => {
  test("rifiuta un corpo che non è un oggetto", async () => {
    for (const body of [null, 5, "x", [1, 2]]) {
      const res = await POST(postRequest(body));
      expect(res.status).toBe(400);
    }
    expect(sessionStore.pushFeedback).not.toHaveBeenCalled();
  });

  test("rifiuta JSON non valido", async () => {
    const res = await POST(
      new Request("http://localhost/api/feedback", {
        method: "POST",
        body: "{non json",
      }),
    );
    expect(res.status).toBe(400);
    expect(sessionStore.pushFeedback).not.toHaveBeenCalled();
  });

  test.each([
    ["sus1", 0],
    ["sus2", 6],
    ["sus3", 2.5],
    ["sus4", "3"],
    ["graphics", 9],
    ["digitalVsPhysical", 0],
  ])("rifiuta %s = %j (non è un intero da 1 a 5)", async (key, value) => {
    const res = await POST(postRequest({ ...validBody(), [key]: value }));
    expect(res.status).toBe(400);
    expect(sessionStore.pushFeedback).not.toHaveBeenCalled();
  });

  test.each([
    ["ageGroup", { nested: true }],
    ["challenges", 42],
  ])("rifiuta %s non testuale", async (key, value) => {
    const res = await POST(postRequest({ ...validBody(), [key]: value }));
    expect(res.status).toBe(400);
  });

  test.each(["ageGroup", "gameExperience", "screenMode", "sus7", "funLevel"])(
    "rifiuta una risposta senza %s",
    async (key) => {
      const body = validBody();
      delete body[key];
      const res = await POST(postRequest(body));
      expect(res.status).toBe(400);
      expect(sessionStore.pushFeedback).not.toHaveBeenCalled();
    },
  );

  test("rifiuta un campo obbligatorio vuoto", async () => {
    const res = await POST(postRequest({ ...validBody(), screenMode: "  " }));
    expect(res.status).toBe(400);
  });

  test("rifiuta una risposta vuota", async () => {
    const res = await POST(postRequest({}));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/feedback", () => {
  test("rifiuta le richieste senza chiave corretta", async () => {
    vi.stubEnv("FEEDBACK_SECRET", "segreto");
    const res = await GET(
      new Request("http://localhost/api/feedback?secret=sbagliato"),
    );
    expect(res.status).toBe(401);
    expect(sessionStore.getFeedback).not.toHaveBeenCalled();
  });

  test("restituisce le risposte con la chiave corretta", async () => {
    vi.stubEnv("FEEDBACK_SECRET", "segreto");
    vi.mocked(sessionStore.getFeedback).mockResolvedValue([
      JSON.stringify({ id: "a", submittedAt: "2026-11-05" }),
    ]);
    const res = await GET(
      new Request("http://localhost/api/feedback?secret=segreto"),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: "a", submittedAt: "2026-11-05" }]);
    // Tutte le risposte, non solo le ultime 100
    expect(sessionStore.getFeedback).toHaveBeenCalledWith();
  });
});
