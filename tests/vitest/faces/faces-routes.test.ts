// @vitest-environment node
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Cookie del "browser": next/headers legge e scrive in questa mappa
const jar = new Map<string, { value: string; options?: unknown }>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      jar.has(name) ? { name, value: jar.get(name)?.value } : undefined,
    set: (name: string, value: string, options?: unknown) => {
      jar.set(name, { value, options });
    },
    delete: (options: { name: string }) => {
      jar.delete(options.name);
    },
  }),
}));

import { GET as fileGET } from "@/app/api/faces/[file]/route";
import {
  DELETE as accessDELETE,
  GET as accessGET,
  POST as accessPOST,
} from "@/app/api/faces/access/route";
import { POST as codesPOST } from "@/app/api/faces/codes/route";
import { POST as startPOST } from "@/app/api/sessions/[id]/start/route";
import { FACES_ACCESS_COOKIE, formatFacesCode } from "@/lib/faces";
import {
  bindFacesGrant,
  FACES_ACCESS_TTL_SECONDS,
  FACES_CODE_TTL,
  getSession,
  redeemFacesCode,
  saveFacesCode,
  saveSession,
  toPublicSession,
} from "@/lib/session-store";
import type { SessionState } from "@/types/session";

const SECRET = "segreto-educatori";
const FILE = "004_o_m_h_a.jpg";
const VIDEO = "004_o_m_n_h.mp4";

const json = (body: unknown) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const post = (
  body: unknown,
  url = "http://localhost/api/faces/access",
  headers: Record<string, string> = {},
) =>
  accessPOST(
    new Request(url, {
      ...json(body),
      // IP diverso a ogni richiesta, così il limite ai tentativi non interferisce
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": crypto.randomUUID(),
        ...headers,
      },
    }),
  );

const requestCode = (body: unknown = { secret: SECRET }) =>
  codesPOST(new Request("http://localhost/api/faces/codes", json(body)));

/** Codice nuovo, come lo genera la pagina educatori. */
const newCode = async () => (await (await requestCode()).json()).code as string;

/** Dispositivo con accesso: codice usato e disclaimer accettato. */
const withAccess = async (mode: "single" | "multi" = "multi") =>
  post({ code: await newCode(), mode });

const granted = async () => (await (await accessGET()).json()).granted;

const getFile = (file: string) =>
  fileGET(new Request(`http://localhost/api/faces/${file}`), {
    params: Promise.resolve({ file }),
  });

const ENV_KEYS = [
  "BLOB_READ_WRITE_TOKEN",
  "FACES_LOCAL_DIR",
  "FACES_CODES_SECRET",
  "KV_REST_API_URL",
  "REDIS_URL",
] as const;
const savedEnv: Partial<Record<(typeof ENV_KEYS)[number], string>> = {};

beforeEach(() => {
  jar.clear();
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
  process.env.FACES_CODES_SECRET = SECRET;
});

afterEach(() => {
  vi.useRealTimers();
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

describe("/api/faces/codes", () => {
  test("genera un codice di 8 caratteri valido 24 ore", async () => {
    const before = Date.now();
    const res = await requestCode();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("no-store");
    const { code, expiresAt } = await res.json();
    expect(code).toMatch(/^[A-HJKMNP-Z2-9]{8}$/);
    expect(expiresAt).toBeGreaterThanOrEqual(before + FACES_CODE_TTL * 1000);
  });

  test("mostrato in due gruppi, accettato anche così", async () => {
    const code = await newCode();
    expect(formatFacesCode(code)).toBe(`${code.slice(0, 4)}-${code.slice(4)}`);
    expect((await post({ code: formatFacesCode(code) })).status).toBe(200);
  });

  test("codici diversi a ogni richiesta", async () => {
    const codes = new Set(
      await Promise.all(Array.from({ length: 20 }, () => newCode())),
    );
    expect(codes.size).toBe(20);
  });

  test("segreto sbagliato o mancante: 401", async () => {
    expect((await requestCode({ secret: "sbagliato" })).status).toBe(401);
    expect((await requestCode({})).status).toBe(401);
    expect((await requestCode({ secret: 42 })).status).toBe(401);
    const noBody = await codesPOST(
      new Request("http://localhost/api/faces/codes", { method: "POST" }),
    );
    expect(noBody.status).toBe(401);
  });

  test("senza FACES_CODES_SECRET nessuno genera codici", async () => {
    delete process.env.FACES_CODES_SECRET;
    expect((await requestCode({ secret: "" })).status).toBe(401);
    expect((await requestCode({})).status).toBe(401);
  });
});

describe("/api/faces/access con il codice dell'educatore", () => {
  test("senza cookie l'accesso non è concesso", async () => {
    const res = await accessGET();
    expect(await res.json()).toEqual({ granted: false });
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });

  test("codice valido: cookie httpOnly per le API e accesso concesso", async () => {
    const res = await withAccess();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ granted: true });
    const cookie = jar.get(FACES_ACCESS_COOKIE);
    expect(cookie?.value).toMatch(/^[0-9a-f-]{36}$/);
    expect(cookie?.options).toMatchObject({
      httpOnly: true,
      path: "/api",
      sameSite: "strict",
      maxAge: FACES_ACCESS_TTL_SECONDS,
    });
    expect(await granted()).toBe(true);
  });

  test("un codice vale una sola volta", async () => {
    const code = await newCode();
    expect((await post({ code })).status).toBe(200);
    jar.clear();
    const again = await post({ code });
    expect(again.status).toBe(403);
    expect(await again.json()).toMatchObject({ error: "invalid-code" });
    expect(jar.has(FACES_ACCESS_COOKIE)).toBe(false);
  });

  test("accetta minuscole, spazi e trattini", async () => {
    const code = await newCode();
    const typed = ` ${code.slice(0, 3).toLowerCase()}-${code.slice(3)} `;
    expect((await post({ code: typed })).status).toBe(200);
  });

  test("codice inventato o di formato sbagliato: 403", async () => {
    for (const code of ["AAAAAAAA", "AAAAAA", "ABC", "0O1IL0AA", ""]) {
      const res = await post({ code });
      expect(res.status).toBe(403);
      expect(await res.json()).toMatchObject({ error: "invalid-code" });
    }
  });

  test("senza codice né partita: 400", async () => {
    expect((await post({})).status).toBe(400);
    const noBody = await accessPOST(
      new Request("http://localhost/api/faces/access", { method: "POST" }),
    );
    expect(noBody.status).toBe(400);
  });

  test("un codice non usato scade dopo 24 ore", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const code = await newCode();
    vi.setSystemTime(Date.now() + FACES_CODE_TTL * 1000 + 1000);
    expect((await post({ code })).status).toBe(403);
  });

  test("l'accesso finisce dopo la durata di una partita", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    await withAccess();
    expect(await granted()).toBe(true);
    vi.setSystemTime(Date.now() + FACES_ACCESS_TTL_SECONDS * 1000 + 1000);
    expect(await granted()).toBe(false);
  });

  test("cookie Secure solo in https", async () => {
    await withAccess();
    expect(jar.get(FACES_ACCESS_COOKIE)?.options).toMatchObject({
      secure: false,
    });
    await post({ code: await newCode() }, "http://localhost/api/faces/access", {
      "x-forwarded-proto": "https",
    });
    expect(jar.get(FACES_ACCESS_COOKIE)?.options).toMatchObject({
      secure: true,
    });
    await post(
      { code: await newCode() },
      "https://imprevisti.app/api/faces/access",
    );
    expect(jar.get(FACES_ACCESS_COOKIE)?.options).toMatchObject({
      secure: true,
    });
  });

  test("un token inventato non vale", async () => {
    jar.set(FACES_ACCESS_COOKIE, { value: "token-inventato" });
    expect(await granted()).toBe(false);
  });

  test("DELETE toglie l'accesso al dispositivo", async () => {
    await withAccess();
    const res = await accessDELETE();
    expect(await res.json()).toEqual({ granted: false });
    expect(await granted()).toBe(false);
  });
});

function session(overrides: Partial<SessionState> = {}): SessionState {
  return {
    sessionId: "FACE01",
    hostToken: "host-tok",
    players: [
      { id: "0", name: "Alice" },
      { id: "1", name: "Bob" },
    ],
    started: false,
    gameState: null,
    currentPlayerId: null,
    pendingAction: null,
    diceResult: null,
    lastMoveInfo: null,
    gameOver: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("/api/faces/access dai telefoni di una partita multigiocatore", () => {
  test("partita avviata con un codice: accesso dopo il disclaimer", async () => {
    await saveFacesCode("K7PM3XQ2");
    const grantId = (await redeemFacesCode("K7PM3XQ2")) as string;
    await saveSession("FACE01", session({ facesGrantId: grantId }));

    const res = await post({ sessionId: "FACE01", secret: "host-tok" });
    expect(res.status).toBe(200);
    expect(await granted()).toBe(true);
  });

  test("serve il segreto dell'host o di un giocatore della partita", async () => {
    await saveFacesCode("K7PM3WQ2");
    const grantId = (await redeemFacesCode("K7PM3WQ2", "multi")) as string;
    await saveSession(
      "FACE04",
      session({
        sessionId: "FACE04",
        facesGrantId: grantId,
        playerSecrets: ["segreto-alice"],
      }),
    );
    for (const secret of [undefined, "", "inventato", 42]) {
      const res = await post({ sessionId: "FACE04", secret });
      expect(res.status).toBe(403);
      expect(jar.has(FACES_ACCESS_COOKIE)).toBe(false);
    }
    expect(
      (await post({ sessionId: "FACE04", secret: "segreto-alice" })).status,
    ).toBe(200);
  });

  test("partita senza codice o inesistente: 403", async () => {
    await saveSession("FACE02", session({ sessionId: "FACE02" }));
    for (const sessionId of ["FACE02", "NOPE99"]) {
      const res = await post({ sessionId, secret: "host-tok" });
      expect(res.status).toBe(403);
      expect(await res.json()).toMatchObject({ error: "no-session-access" });
    }
  });

  test("permesso scaduto: 403", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    await saveFacesCode("K7PM3YQ2");
    const grantId = (await redeemFacesCode("K7PM3YQ2")) as string;
    await saveSession("FACE03", session({ facesGrantId: grantId }));
    vi.setSystemTime(Date.now() + FACES_ACCESS_TTL_SECONDS * 1000 + 1000);
    expect(
      (await post({ sessionId: "FACE03", secret: "host-tok" })).status,
    ).toBe(403);
  });

  test("il permesso non compare nello stato pubblico della partita", () => {
    const pub = toPublicSession(
      session({ facesGrantId: "segreto", playerSecrets: ["s"] }),
    );
    expect(pub).not.toHaveProperty("facesGrantId");
    expect(pub).not.toHaveProperty("playerSecrets");
    expect(pub).not.toHaveProperty("hostToken");
  });
});

describe("avvio di una partita multigiocatore", () => {
  const boardConfig = {
    numPlayers: 2,
    playerNames: ["Alice", "Bob"],
    numSquares: 20,
    squareTypes: {
      mime: false,
      quiz: false,
      move: false,
      backwrite: false,
      "face-emotion": true,
      "emotion-video": false,
      "music-emotion": false,
      "physical-test": false,
      "what-would-you-do": false,
      "dictation-draw": false,
    },
    specialPercentage: 50,
    customSquares: null,
    battlesEnabled: true,
  };

  const start = async (id: string, faceSet?: string) => {
    await saveSession(id, session({ sessionId: id }));
    const res = await startPOST(
      new Request(
        `http://localhost/api/sessions/${id}/start`,
        json({ hostToken: "host-tok", boardConfig, faceSet }),
      ),
      { params: Promise.resolve({ id }) },
    );
    expect(res.status).toBe(200);
    return (await getSession(id)) as SessionState;
  };

  test("host con codice: foto FACES e permesso legato alla partita", async () => {
    await withAccess();
    const started = await start("HOST01", "faces");
    expect(started.gameState?.faceSet).toBe("faces");
    expect(started.facesGrantId).toBeDefined();

    // Un telefono della partita ottiene l'accesso
    jar.clear();
    expect(
      (await post({ sessionId: "HOST01", secret: "host-tok" })).status,
    ).toBe(200);
  });

  test("un codice vale per una sola partita", async () => {
    await withAccess();
    const first = await start("HOST05", "faces");
    expect(first.gameState?.faceSet).toBe("faces");
    const second = await start("HOST06", "faces");
    expect(second.gameState?.faceSet).toBe("ai");
    expect(second.facesGrantId).toBeUndefined();
    // Il telefono di un giocatore della prima partita ha ancora accesso
    jar.clear();
    expect(
      (await post({ sessionId: "HOST05", secret: "host-tok" })).status,
    ).toBe(200);
  });

  test("codice usato su schermo singolo: non vale per una multigiocatore", async () => {
    await withAccess("single");
    const started = await start("HOST08", "faces");
    expect(started.gameState?.faceSet).toBe("ai");
    expect(started.facesGrantId).toBeUndefined();
  });

  test("modalità sconosciuta: trattata come schermo singolo", async () => {
    await post({ code: await newCode(), mode: "altro" });
    expect((await start("HOST09", "faces")).gameState?.faceSet).toBe("ai");
  });

  test("permesso scaduto all'avvio: volti illustrati", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    await withAccess();
    const token = jar.get(FACES_ACCESS_COOKIE)?.value as string;
    vi.setSystemTime(Date.now() + FACES_ACCESS_TTL_SECONDS * 1000 + 1000);
    jar.set(FACES_ACCESS_COOKIE, { value: token });
    expect((await start("HOST07", "faces")).gameState?.faceSet).toBe("ai");
  });

  test("host senza codice: volti illustrati, nessun permesso", async () => {
    const started = await start("HOST02", "faces");
    expect(started.gameState?.faceSet).toBe("ai");
    expect(started.facesGrantId).toBeUndefined();
  });

  test("senza codice le clip diventano Indovina l'emozione", async () => {
    const squares = Array.from({ length: 10 }, (_, number) => ({
      number,
      type: number === 3 ? "emotion-video" : "normal",
    }));
    const custom = { ...boardConfig, numSquares: 10, customSquares: squares };
    const types = async (id: string) => {
      await saveSession(id, session({ sessionId: id }));
      await startPOST(
        new Request(
          `http://localhost/api/sessions/${id}/start`,
          json({
            hostToken: "host-tok",
            boardConfig: custom,
            faceSet: "faces",
          }),
        ),
        { params: Promise.resolve({ id }) },
      );
      const started = (await getSession(id)) as SessionState;
      return started.gameState?.board.squares[3].type;
    };
    expect(await types("VID01")).toBe("face-emotion");
    await withAccess();
    expect(await types("VID02")).toBe("emotion-video");
  });

  test("host con cookie ma partita senza codice: volti illustrati", async () => {
    await withAccess();
    const started = await start("HOST03", "ai");
    expect(started.gameState?.faceSet).toBe("ai");
    expect(started.facesGrantId).toBeUndefined();
    expect((await start("HOST04")).gameState?.faceSet).toBe("ai");
  });
});

describe("/api/faces/[file]", () => {
  test("rifiuta i file che non sono carte del mazzo", async () => {
    await withAccess();
    for (const file of ["004_o_m_n_a.jpg", "../package.json", "altro.jpg"]) {
      expect((await getFile(file)).status).toBe(404);
    }
  });

  test("senza accesso risponde 403", async () => {
    expect((await getFile(FILE)).status).toBe(403);
    jar.set(FACES_ACCESS_COOKIE, { value: "token-inventato" });
    expect((await getFile(FILE)).status).toBe(403);
  });

  test("ad accesso scaduto risponde 403", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    await withAccess();
    vi.setSystemTime(Date.now() + FACES_ACCESS_TTL_SECONDS * 1000 + 1000);
    expect((await getFile(FILE)).status).toBe(403);
  });

  test("senza archivio configurato rimanda al segnaposto", async () => {
    await withAccess();
    const res = await getFile(FILE);
    expect(res.status).toBe(307);
    expect(res.headers.get("Location")).toBe(
      "http://localhost/images/face-placeholder.svg",
    );
  });

  test("le clip senza archivio rimandano al video segnaposto", async () => {
    await withAccess();
    const res = await getFile(VIDEO);
    expect(res.status).toBe(307);
    expect(res.headers.get("Location")).toBe(
      "http://localhost/videos/emotion-video-placeholder.mp4",
    );
  });

  test("solo le clip dei soggetti del mazzo, senza accesso 403", async () => {
    expect((await getFile(VIDEO)).status).toBe(403);
    await withAccess();
    // Clip neutra e soggetto non usato dal gioco
    for (const file of ["004_o_m_n_n.mp4", "082_m_m_n_n.mp4"]) {
      expect((await getFile(file)).status).toBe(404);
    }
  });

  describe("con FACES_LOCAL_DIR", () => {
    let dir: string;

    beforeEach(async () => {
      dir = await mkdtemp(path.join(tmpdir(), "faces-"));
      await writeFile(path.join(dir, FILE), "jpeg");
      await writeFile(path.join(dir, VIDEO), "mp4");
      process.env.FACES_LOCAL_DIR = dir;
    });

    afterEach(async () => {
      await rm(dir, { recursive: true, force: true });
    });

    test("restituisce la foto senza cache", async () => {
      await withAccess();
      const res = await getFile(FILE);
      expect(res.status).toBe(200);
      expect(await res.text()).toBe("jpeg");
      expect(res.headers.get("Content-Type")).toBe("image/jpeg");
      expect(res.headers.get("Cache-Control")).toBe(
        "private, no-store, max-age=0",
      );
    });

    test("restituisce la clip come video/mp4 senza cache", async () => {
      await withAccess();
      const res = await getFile(VIDEO);
      expect(res.status).toBe(200);
      expect(await res.text()).toBe("mp4");
      expect(res.headers.get("Content-Type")).toBe("video/mp4");
      expect(res.headers.get("Cache-Control")).toBe(
        "private, no-store, max-age=0",
      );
    });

    test("un file del mazzo assente dalla cartella dà 404", async () => {
      await withAccess();
      expect((await getFile("066_y_m_h_a.jpg")).status).toBe(404);
    });
  });
});

describe("bindFacesGrant", () => {
  test("permesso inesistente: rifiutato", async () => {
    expect(await bindFacesGrant("inesistente", "S1")).toBe(false);
  });

  test("stessa partita: sempre accettato; altra partita: rifiutato", async () => {
    await saveFacesCode("K7PM3ZQ2");
    const grantId = (await redeemFacesCode("K7PM3ZQ2", "multi")) as string;
    expect(await bindFacesGrant(grantId, "S1")).toBe(true);
    expect(await bindFacesGrant(grantId, "S1")).toBe(true);
    expect(await bindFacesGrant(grantId, "S2")).toBe(false);
  });

  test("permesso da schermo singolo: mai legato", async () => {
    await saveFacesCode("K7PM3VQ2");
    const grantId = (await redeemFacesCode("K7PM3VQ2")) as string;
    expect(await bindFacesGrant(grantId, "S1")).toBe(false);
  });

  test("id di partita numerico: nessuna confusione con il permesso libero", async () => {
    await saveFacesCode("K7PM3UQ2");
    const grantId = (await redeemFacesCode("K7PM3UQ2", "multi")) as string;
    expect(await bindFacesGrant(grantId, "123456")).toBe(true);
    expect(await bindFacesGrant(grantId, "123456")).toBe(true);
    expect(await bindFacesGrant(grantId, "1")).toBe(false);
  });

  test("due avvii contemporanei di partite diverse: ne vince uno", async () => {
    await saveFacesCode("K7PM3TQ2");
    const grantId = (await redeemFacesCode("K7PM3TQ2", "multi")) as string;
    const results = await Promise.all([
      bindFacesGrant(grantId, "S1"),
      bindFacesGrant(grantId, "S2"),
    ]);
    expect(results.filter(Boolean)).toHaveLength(1);
  });
});
