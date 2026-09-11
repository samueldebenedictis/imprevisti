"use client";

import { useCallback, useEffect, useState } from "react";
import {
  computeSusScore,
  SUS_GRADE_COLOR,
  SUS_GRADE_LABEL,
  susGrade,
} from "@/lib/sus";
import type { FeedbackEntry } from "@/types/feedback";
import BarChart from "../../components/charts/bar-chart";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const STORAGE_KEY = "feedbackDashboardSecret";

const RATING_LABELS: Record<string, string> = {
  digitalVsPhysical: "Digitale vs fisico",
  gameplayClarity: "Chiarezza meccaniche",
  graphics: "Grafica",
  enjoyment: "Mi è piaciuto",
  funLevel: "Mi sono divertito",
};

const AGE_GROUP_LABELS: Record<string, string> = {
  docente: "Docente",
  alunno: "Alunno",
  none: "Altro",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  fisico: "Solo versione fisica",
  digitale: "Solo versione digitale",
  esperto: "Entrambe le versioni",
};

const AUTISM_LABELS: Record<string, string> = {
  si_diagnosi: "Diagnosi confermata",
  si_non_diagnosticato: "Senza diagnosi formale",
  no: "No",
  preferisco_non_rispondere: "Preferisce non rispondere",
};

function countBy(
  entries: FeedbackEntry[],
  key: keyof FeedbackEntry,
  labels: Record<string, string>,
) {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const raw = entry[key];
    if (!raw) continue;
    const label = labels[String(raw)] ?? String(raw);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([label, value]) => ({
    label,
    value,
  }));
}

export default function FeedbackDashboardPage() {
  const [secret, setSecret] = useState("");
  const [entries, setEntries] = useState<FeedbackEntry[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (candidateSecret: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/feedback?secret=${encodeURIComponent(candidateSecret)}`,
      );
      if (!res.ok) {
        setError("Codice non valido.");
        setEntries(null);
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }
      const data: FeedbackEntry[] = await res.json();
      setEntries(data);
      sessionStorage.setItem(STORAGE_KEY, candidateSecret);
    } catch {
      setError("Errore nel caricamento dei dati.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSecret(stored);
      loadData(stored);
    }
  }, [loadData]);

  if (!entries) {
    return (
      <div className="ui-text-dark my-8 flex flex-col items-center justify-center p-4">
        <h1 className="ui-text-title m-2">Dashboard feedback</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadData(secret);
          }}
          className="m-2 w-full max-w-sm"
        >
          <Label htmlFor="secret" className="font-light">
            Codice di accesso
          </Label>
          <Input
            type="password"
            id="secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="mt-2"
          />
          {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
          <Button
            type="submit"
            color="blue"
            className="mx-0 mt-4"
            disabled={loading}
          >
            {loading ? "Verifica..." : "Accedi"}
          </Button>
        </form>
      </div>
    );
  }

  const susScores = entries
    .map((entry) => computeSusScore(entry))
    .filter((score): score is number => score !== null);
  const avgSus = susScores.length
    ? susScores.reduce((a, b) => a + b, 0) / susScores.length
    : null;
  const grade = avgSus !== null ? susGrade(avgSus) : null;

  const ratingKeys = Object.keys(RATING_LABELS);
  const ratingAverages = ratingKeys.map((key) => {
    const values = entries
      .map((entry) => entry[key as keyof FeedbackEntry])
      .filter((v): v is number => typeof v === "number" && v > 0);
    const avg = values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;
    return { label: RATING_LABELS[key], value: Number(avg.toFixed(2)) };
  });

  const ageGroupCounts = countBy(entries, "ageGroup", AGE_GROUP_LABELS);
  const experienceCounts = countBy(
    entries,
    "gameExperience",
    EXPERIENCE_LABELS,
  );
  const autismCounts = countBy(entries, "autismIdentification", AUTISM_LABELS);

  const textEntries = entries.filter(
    (entry) => entry.whatWorkedWell || entry.challenges || entry.suggestions,
  );

  return (
    <div className="ui-text-dark my-8 flex w-full flex-col items-center p-4">
      <h1 className="ui-text-title m-2">Dashboard feedback</h1>
      <p className="ui-text-normal mb-6 text-base">{entries.length} risposte</p>

      <div className="w-full max-w-3xl">
        <section className="mb-8 flex flex-col items-center">
          <h2 className="ui-text-subtitle mb-2">Punteggio SUS medio</h2>
          {avgSus !== null && grade ? (
            <div className="flex items-center gap-3">
              <span
                className="font-bold text-5xl"
                style={{ color: SUS_GRADE_COLOR[grade] }}
              >
                {avgSus.toFixed(1)}
              </span>
              <span className="flex items-center gap-2 text-gray-600 text-sm">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: SUS_GRADE_COLOR[grade] }}
                />
                {SUS_GRADE_LABEL[grade]}
              </span>
            </div>
          ) : (
            <p className="text-gray-600 text-sm">
              Nessun dato SUS disponibile.
            </p>
          )}
        </section>

        <section className="mb-8">
          <h2 className="ui-text-subtitle mb-3">Valutazioni medie (1-5)</h2>
          <BarChart items={ratingAverages} max={5} />
        </section>

        <section className="mb-8">
          <h2 className="ui-text-subtitle mb-3">Ruolo</h2>
          <BarChart items={ageGroupCounts} max={entries.length} />
        </section>

        <section className="mb-8">
          <h2 className="ui-text-subtitle mb-3">Esperienza di gioco</h2>
          <BarChart items={experienceCounts} max={entries.length} />
        </section>

        <section className="mb-8">
          <h2 className="ui-text-subtitle mb-3">Spettro autistico</h2>
          <BarChart items={autismCounts} max={entries.length} />
        </section>

        <section className="mb-8">
          <h2 className="ui-text-subtitle mb-3">
            Commenti liberi ({textEntries.length})
          </h2>
          <div className="flex flex-col gap-4">
            {textEntries.map((entry) => (
              <div
                key={entry.id}
                className="ui-border-dark border-2 p-3 text-sm"
              >
                <p className="mb-1 font-semibold">
                  {entry.name || "Anonimo"} ·{" "}
                  {new Date(entry.submittedAt).toLocaleDateString("it-IT")}
                </p>
                {entry.whatWorkedWell && (
                  <p>
                    <strong>Funzionato bene:</strong> {entry.whatWorkedWell}
                  </p>
                )}
                {entry.challenges && (
                  <p>
                    <strong>Difficoltà:</strong> {entry.challenges}
                  </p>
                )}
                {entry.suggestions && (
                  <p>
                    <strong>Suggerimenti:</strong> {entry.suggestions}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
