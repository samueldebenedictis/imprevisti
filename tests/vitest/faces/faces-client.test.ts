import { afterEach, describe, expect, test, vi } from "vitest";
import { FACES_ACCESS_API } from "@/lib/faces";
import { acceptFacesAccess, fetchFacesAccess } from "@/lib/faces-client";

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
  test("invia l'accettazione con POST", async () => {
    const fetchMock = respond(true);
    vi.stubGlobal("fetch", fetchMock);
    await expect(acceptFacesAccess()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(FACES_ACCESS_API, {
      method: "POST",
    });
  });

  test("falso se il server rifiuta", async () => {
    vi.stubGlobal("fetch", respond(false));
    await expect(acceptFacesAccess()).resolves.toBe(false);
  });

  test("falso se la richiesta fallisce", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    await expect(acceptFacesAccess()).resolves.toBe(false);
  });
});
