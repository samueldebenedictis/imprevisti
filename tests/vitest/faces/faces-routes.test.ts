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
  }),
}));

import { GET as fileGET } from "@/app/api/faces/[file]/route";
import {
  GET as accessGET,
  POST as accessPOST,
} from "@/app/api/faces/access/route";
import { FACES_ACCESS_COOKIE } from "@/lib/faces";

const post = (url = "http://localhost/api/faces/access", headers = {}) =>
  accessPOST(new Request(url, { method: "POST", headers }));

const FILE = "004_o_m_h_a.jpg";

const getFile = (file: string) =>
  fileGET(new Request(`http://localhost/api/faces/${file}`), {
    params: Promise.resolve({ file }),
  });

const ENV_KEYS = [
  "BLOB_READ_WRITE_TOKEN",
  "FACES_LOCAL_DIR",
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
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

describe("/api/faces/access", () => {
  test("senza cookie l'accesso non è concesso", async () => {
    const res = await accessGET();
    expect(await res.json()).toEqual({ granted: false });
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });

  test("POST rilascia un cookie httpOnly limitato a /api/faces", async () => {
    const res = await post();
    expect(await res.json()).toEqual({ granted: true });
    const cookie = jar.get(FACES_ACCESS_COOKIE);
    expect(cookie?.value).toMatch(/^[0-9a-f-]{36}$/);
    expect(cookie?.options).toMatchObject({
      httpOnly: true,
      path: "/api/faces",
      sameSite: "strict",
    });
    expect(await (await accessGET()).json()).toEqual({ granted: true });
  });

  test("cookie Secure solo in https", async () => {
    await post();
    expect(jar.get(FACES_ACCESS_COOKIE)?.options).toMatchObject({
      secure: false,
    });
    await post("http://localhost/api/faces/access", {
      "x-forwarded-proto": "https",
    });
    expect(jar.get(FACES_ACCESS_COOKIE)?.options).toMatchObject({
      secure: true,
    });
    await post("https://imprevisti.app/api/faces/access");
    expect(jar.get(FACES_ACCESS_COOKIE)?.options).toMatchObject({
      secure: true,
    });
  });

  test("un token inventato non vale", async () => {
    jar.set(FACES_ACCESS_COOKIE, { value: "token-inventato" });
    expect(await (await accessGET()).json()).toEqual({ granted: false });
  });
});

describe("/api/faces/[file]", () => {
  test("rifiuta i file che non sono carte del mazzo", async () => {
    await post();
    for (const file of ["004_o_m_n_a.jpg", "../package.json", "altro.jpg"]) {
      expect((await getFile(file)).status).toBe(404);
    }
  });

  test("senza disclaimer accettato risponde 403", async () => {
    expect((await getFile(FILE)).status).toBe(403);
    jar.set(FACES_ACCESS_COOKIE, { value: "token-inventato" });
    expect((await getFile(FILE)).status).toBe(403);
  });

  test("senza archivio configurato rimanda al segnaposto", async () => {
    await post();
    const res = await getFile(FILE);
    expect(res.status).toBe(307);
    expect(res.headers.get("Location")).toBe(
      "http://localhost/images/face-placeholder.svg",
    );
  });

  describe("con FACES_LOCAL_DIR", () => {
    let dir: string;

    beforeEach(async () => {
      dir = await mkdtemp(path.join(tmpdir(), "faces-"));
      await writeFile(path.join(dir, FILE), "jpeg");
      process.env.FACES_LOCAL_DIR = dir;
    });

    afterEach(async () => {
      await rm(dir, { recursive: true, force: true });
    });

    test("restituisce la foto senza cache", async () => {
      await post();
      const res = await getFile(FILE);
      expect(res.status).toBe(200);
      expect(await res.text()).toBe("jpeg");
      expect(res.headers.get("Content-Type")).toBe("image/jpeg");
      expect(res.headers.get("Cache-Control")).toBe(
        "private, no-store, max-age=0",
      );
    });

    test("un file del mazzo assente dalla cartella dà 404", async () => {
      await post();
      expect((await getFile("066_y_m_h_a.jpg")).status).toBe(404);
    });
  });
});
