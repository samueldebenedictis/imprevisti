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

describe("POST /api/feedback", () => {
  test("salva solo i campi previsti", async () => {
    const res = await POST(
      postRequest({
        name: "Mario",
        ageGroup: "alunno",
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

  test("ignora submittedAt e id inviati dal client", async () => {
    await POST(postRequest({ submittedAt: "x", id: "y" }));
    const entry = savedEntry();
    expect(entry.submittedAt).not.toBe("x");
    expect(entry.id).not.toBe("y");
  });

  test("salva solo la data, senza ora", async () => {
    await POST(postRequest({ ageGroup: "alunno" }));
    expect(savedEntry().submittedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("usa un id casuale, non un timestamp", async () => {
    await POST(postRequest({}));
    await POST(postRequest({}));
    const calls = vi.mocked(sessionStore.pushFeedback).mock.calls;
    const ids = calls.map((c) => JSON.parse(c[0]).id);
    for (const id of ids) {
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    }
    expect(ids[0]).not.toBe(ids[1]);
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

  test("scarta valori che non sono stringhe o numeri e tronca i testi lunghi", async () => {
    await POST(
      postRequest({
        ageGroup: { nested: true },
        sus1: [4],
        sus2: 3,
        challenges: "a".repeat(5000),
      }),
    );
    const entry = savedEntry();
    expect(entry.ageGroup).toBeUndefined();
    expect(entry.sus1).toBeUndefined();
    expect(entry.sus2).toBe(3);
    expect(entry.challenges).toHaveLength(2000);
  });

  test("scarta i punteggi fuori dalla scala 1-5 o non interi", async () => {
    await POST(
      postRequest({
        sus1: 0,
        sus2: 6,
        sus3: 2.5,
        sus4: "3",
        sus5: 1,
        sus6: 5,
        graphics: 9,
        funLevel: 4,
      }),
    );
    const entry = savedEntry();
    for (const key of ["sus1", "sus2", "sus3", "sus4", "graphics"])
      expect(entry[key]).toBeUndefined();
    expect(entry.sus5).toBe(1);
    expect(entry.sus6).toBe(5);
    expect(entry.funLevel).toBe(4);
  });

  test("usa la data italiana, non quella UTC", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-04T23:30:00Z")); // 00:30 a Roma
    await POST(postRequest({}));
    vi.useRealTimers();
    expect(savedEntry().submittedAt).toBe("2026-11-05");
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
  });
});
