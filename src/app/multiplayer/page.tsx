"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MultiplayerPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/sessions", { method: "POST" })
      .then((r) => r.json())
      .then(
        ({
          sessionId,
          hostToken,
        }: {
          sessionId: string;
          hostToken: string;
        }) => {
          if (cancelled) return;
          localStorage.setItem("hostToken", hostToken);
          router.replace(`/multiplayer/${sessionId}`);
        },
      )
      .catch(() => {
        if (!cancelled) setError("Errore nella creazione della sessione.");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="ui-text-dark flex min-h-screen items-center justify-center">
      {error ? (
        <p className="ui-text-normal text-red-600">{error}</p>
      ) : (
        <p className="ui-text-normal">Creazione sessione...</p>
      )}
    </div>
  );
}
