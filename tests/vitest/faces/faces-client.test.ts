import { afterEach, describe, expect, test, vi } from "vitest";
import { FACES_ACCESS_API } from "@/lib/faces";
import {
  acceptFacesAccess,
  fetchFacesAccess,
  loadSessionSecret,
  revokeFacesAccess,
  savePlayerSecret,
} from "@/lib/faces-client";

const respond = (ok: boolean, body: unknown = {}) =>
  vi.fn(async () => ({ ok, json: async () => body }));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchFacesAccess", () => {
  test("vero se il server conferma l'accesso", async () => {
    const fetchMock = respond(true, { granted: true });
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchFacesAccess()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(FACES_ACCESS_API, {
      cache: "no-store",
    });
  });

  test("falso se l'accesso non è stato concesso", async () => {
    vi.stubGlobal("fetch", respond(true, { granted: false }));
    await expect(fetchFacesAccess()).resolves.toBe(false);
    vi.stubGlobal("fetch", respond(true, {}));
    await expect(fetchFacesAccess()).resolves.toBe(false);
  });

  test("falso se il server risponde con un errore", async () => {
    vi.stubGlobal("fetch", respond(false, { granted: true }));
    await expect(fetchFacesAccess()).resolves.toBe(false);
  });

  test("falso se la richiesta fallisce", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    await expect(fetchFacesAccess()).resolves.toBe(false);
  });
});

describe("acceptFacesAccess", () => {
  test("invia codice o partita con POST", async () => {
    const fetchMock = respond(true);
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      acceptFacesAccess({ code: "K7PM3XQ2", mode: "single" }),
    ).resolves.toBe("granted");
    expect(fetchMock).toHaveBeenCalledWith(FACES_ACCESS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "K7PM3XQ2", mode: "single" }),
    });
    await acceptFacesAccess({ sessionId: "ABC123", secret: "s" });
    expect(fetchMock).toHaveBeenLastCalledWith(
      FACES_ACCESS_API,
      expect.objectContaining({
        body: JSON.stringify({ sessionId: "ABC123", secret: "s" }),
      }),
    );
  });

  test.each([
    ["invalid-code", "invalid-code"],
    ["no-session-access", "no-session-access"],
    ["missing-code", "error"],
  ])("errore %s dal server: %s", async (error, expected) => {
    vi.stubGlobal("fetch", respond(false, { error }));
    await expect(
      acceptFacesAccess({ code: "X", mode: "single" }),
    ).resolves.toBe(expected);
  });

  test("risposta d'errore senza JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        json: async () => {
          throw new Error("not json");
        },
      })),
    );
    await expect(
      acceptFacesAccess({ code: "X", mode: "single" }),
    ).resolves.toBe("error");
  });

  test("errore se la richiesta fallisce", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    await expect(
      acceptFacesAccess({ code: "X", mode: "single" }),
    ).resolves.toBe("error");
  });
});

describe("revokeFacesAccess", () => {
  test("chiede al server di togliere l'accesso", async () => {
    const fetchMock = respond(true);
    vi.stubGlobal("fetch", fetchMock);
    await revokeFacesAccess();
    expect(fetchMock).toHaveBeenCalledWith(FACES_ACCESS_API, {
      method: "DELETE",
    });
  });

  test("senza rete non si rompe", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    await expect(revokeFacesAccess()).resolves.toBeUndefined();
  });
});

describe("segreto della partita multigiocatore", () => {
  afterEach(() => localStorage.clear());

  test("telefono: il segreto del giocatore", () => {
    localStorage.setItem("hostToken", "host-tok");
    savePlayerSecret("ABC123", "segreto-alice");
    expect(loadSessionSecret("ABC123")).toBe("segreto-alice");
  });

  test("tabellone: il token dell'host", () => {
    localStorage.setItem("hostToken", "host-tok");
    expect(loadSessionSecret("ABC123")).toBe("host-tok");
  });

  test("nessun segreto: null", () => {
    expect(loadSessionSecret("ABC123")).toBeNull();
  });

  test("storage non disponibile: nessun errore", () => {
    const fail = () => {
      throw new Error("blocked");
    };
    const spies = [
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(fail),
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(fail),
    ];
    expect(() => savePlayerSecret("ABC123", "s")).not.toThrow();
    expect(loadSessionSecret("ABC123")).toBeNull();
    for (const spy of spies) spy.mockRestore();
  });
});
