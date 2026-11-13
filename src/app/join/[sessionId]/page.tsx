"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PawnPicker from "@/app/components/pawn-picker";
import Button from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { savePlayerSecret } from "@/lib/faces-client";
import { defaultPawn, type PawnStyle } from "@/model/pawn";

export default function JoinPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Finché il giocatore non sceglie, la pedina è quella predefinita per il
  // suo posto nella partita (la decide il server, all'ingresso)
  const [pawn, setPawn] = useState<PawnStyle>(defaultPawn(0));
  const [pawnChosen, setPawnChosen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/sessions/${sessionId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((session: { players?: unknown[] } | null) => {
        if (cancelled || !Array.isArray(session?.players)) return;
        const index = session.players.length;
        setPawn((current) => (pawnChosen ? current : defaultPawn(index)));
      })
      .catch(() => {
        // Senza risposta resta l'anteprima predefinita
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, pawnChosen]);

  const join = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/sessions/${sessionId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerName: name.trim(),
        ...(pawnChosen ? { pawn } : {}),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Errore sconosciuto");
      setLoading(false);
      return;
    }
    const { playerId, playerSecret } = await res.json();
    if (typeof playerSecret === "string")
      savePlayerSecret(sessionId, playerSecret);
    router.push(`/player/${sessionId}/${playerId}`);
  };

  return (
    <div className="ui-text-dark my-8 flex flex-col items-center justify-center p-4">
      <h1 className="ui-text-title m-2">La Città degli Imprevisti</h1>
      <p className="ui-text-normal mb-4">
        Sessione: <strong>{sessionId}</strong>
      </p>
      <div className="w-full max-w-sm">
        <Label htmlFor="playerName" className="block text-center">
          Il tuo nome
        </Label>
        <Input
          id="playerName"
          type="text"
          placeholder="Inserisci il tuo nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="mt-6">
          <PawnPicker
            centered
            name={name}
            value={pawn}
            onChange={(next) => {
              setPawn(next);
              setPawnChosen(true);
            }}
          />
        </div>
      </div>
      {error && <p className="ui-text-normal mt-2 text-red-600">{error}</p>}
      <Button
        color="blue"
        onClick={join}
        disabled={loading || !name.trim()}
        className="mx-0 mt-8 w-full max-w-sm"
      >
        {loading ? "Connessione..." : "Entra nel gioco"}
      </Button>
    </div>
  );
}
