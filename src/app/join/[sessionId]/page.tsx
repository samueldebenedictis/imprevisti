"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

export default function JoinPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const join = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/sessions/${sessionId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName: name.trim() }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Errore sconosciuto");
      setLoading(false);
      return;
    }
    const { playerId } = await res.json();
    router.push(`/player/${sessionId}/${playerId}`);
  };

  return (
    <div className="ui-text-dark my-8 flex flex-col items-center justify-center p-4">
      <h1 className="ui-text-title m-2">La Città degli Imprevisti</h1>
      <p className="ui-text-normal mb-4">
        Sessione: <strong>{sessionId}</strong>
      </p>
      <div className="w-full max-w-sm">
        <Label htmlFor="playerName">Il tuo nome</Label>
        <Input
          id="playerName"
          type="text"
          placeholder="Inserisci il tuo nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      {error && <p className="ui-text-normal mt-2 text-red-600">{error}</p>}
      <Button
        color="blue"
        onClick={join}
        disabled={loading || !name.trim()}
        className="mx-0 mt-4 w-full max-w-sm"
      >
        {loading ? "Connessione..." : "Entra nel gioco"}
      </Button>
    </div>
  );
}
