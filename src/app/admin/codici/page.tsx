"use client";

import { useEffect, useState } from "react";
import { FACES_CODES_API } from "@/lib/faces";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const SECRET_KEY = "facesCodesSecret";
const CODES_KEY = "facesCodesGenerated";

interface GeneratedCode {
  code: string;
  expiresAt: number;
}

const readCodes = (): GeneratedCode[] => {
  try {
    return JSON.parse(sessionStorage.getItem(CODES_KEY) ?? "[]");
  } catch {
    return [];
  }
};

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleString("it-IT", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Pagina degli educatori: genera i codici monouso per le partite con le
 * fotografie FACES. Ogni codice vale per una sola partita e scade dopo
 * 24 ore se non viene usato. Protetta dal segreto FACES_CODES_SECRET.
 */
export default function FacesCodesPage() {
  const [secret, setSecret] = useState("");
  const [codes, setCodes] = useState<GeneratedCode[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      setSecret(sessionStorage.getItem(SECRET_KEY) ?? "");
      setCodes(readCodes());
    } catch {
      // sessionStorage non disponibile: si riparte vuoti
    }
  }, []);

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(FACES_CODES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      if (res.status === 401) {
        setError("Codice di accesso non valido.");
        sessionStorage.removeItem(SECRET_KEY);
        return;
      }
      if (!res.ok) throw new Error();
      const generated: GeneratedCode = await res.json();
      const next = [generated, ...codes];
      setCodes(next);
      sessionStorage.setItem(SECRET_KEY, secret);
      sessionStorage.setItem(CODES_KEY, JSON.stringify(next));
    } catch {
      setError("Errore nella generazione del codice.");
    } finally {
      setLoading(false);
    }
  };

  const [latest, ...previous] = codes;

  return (
    <div className="ui-text-dark my-8 flex flex-col items-center justify-center p-4">
      <h1 className="ui-text-title m-2">Codici FACES</h1>
      <p className="ui-text-normal m-2 max-w-md text-center">
        Ogni codice permette una sola partita con le fotografie FACES nella
        sfida &quot;Indovina l&apos;emozione&quot;. Consegnalo solo a chi gioca
        in presenza. Se non viene usato, scade dopo 24 ore.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void generate();
        }}
        className="m-2 w-full max-w-sm"
      >
        <Label htmlFor="secret" className="font-light">
          Codice di accesso educatori
        </Label>
        <Input
          type="password"
          id="secret"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="mt-2"
        />
        {error && (
          <p className="mt-2 text-red-600 text-sm" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          color="blue"
          className="mx-0 mt-4"
          disabled={loading || !secret}
        >
          {loading ? "Generazione..." : "Genera un codice"}
        </Button>
      </form>

      {latest && (
        <div className="ui-border-dark m-4 w-full max-w-sm bg-gray-100 p-4 text-center">
          <p className="ui-text-normal">Nuovo codice</p>
          <p
            className="my-2 font-bold font-mono text-4xl tracking-widest"
            data-testid="faces-code"
          >
            {latest.code}
          </p>
          <p className="text-gray-600 text-sm">
            Valido fino al {formatTime(latest.expiresAt)}, se non usato
          </p>
        </div>
      )}

      {previous.length > 0 && (
        <div className="m-2 w-full max-w-sm">
          <p className="ui-text-normal mb-1">Generati prima</p>
          <ul className="font-mono text-sm">
            {previous.map(({ code, expiresAt }) => (
              <li key={code}>
                {code} · scade il {formatTime(expiresAt)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
