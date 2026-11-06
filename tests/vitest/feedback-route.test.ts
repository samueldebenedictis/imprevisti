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
