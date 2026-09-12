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

type FilterKey =
  | "ageGroup"
  | "gameExperience"
  | "autismIdentification"
  | "appVersion";

// appVersion non ha una mappa di etichette: il valore grezzo (es. "2.0.16")
// è già leggibile ed è usato com'è, sia come label che come chiave filtro.
const FILTER_LABELS: Record<FilterKey, Record<string, string>> = {
  ageGroup: AGE_GROUP_LABELS,
  gameExperience: EXPERIENCE_LABELS,
  autismIdentification: AUTISM_LABELS,
  appVersion: {},
};

const EMPTY_FILTERS: Record<FilterKey, Set<string>> = {
  ageGroup: new Set(),
  gameExperience: new Set(),
  autismIdentification: new Set(),
  appVersion: new Set(),
};

function countBy(entries: FeedbackEntry[], key: FilterKey) {
  const labels = FILTER_LABELS[key];
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const raw = entry[key];
    if (!raw) continue;
    const rawValue = String(raw);
    counts.set(rawValue, (counts.get(rawValue) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([rawValue, value]) => ({
    label: labels[rawValue] ?? rawValue,
    value,
    key: rawValue,
  }));
}

export default function FeedbackDashboardPage() {
  const [secret, setSecret] = useState("");
  const [entries, setEntries] = useState<FeedbackEntry[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] =
    useState<Record<FilterKey, Set<string>>>(EMPTY_FILTERS);

  const toggleFilter = (key: FilterKey, value: string) => {
    setFilters((prev) => {
      const next = new Set(prev[key]);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return { ...prev, [key]: next };
    });
  };

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

  const filterKeys = Object.keys(filters) as FilterKey[];
  const filteredEntries = entries.filter((entry) =>
    filterKeys.every((key) => {
      const selected = filters[key];
      if (selected.size === 0) return true;
      const raw = entry[key];
      return raw ? selected.has(String(raw)) : false;
    }),
  );

  const susScores = filteredEntries
    .map((entry) => computeSusScore(entry))
    .filter((score): score is number => score !== null);
  const avgSus = susScores.length
    ? susScores.reduce((a, b) => a + b, 0) / susScores.length
    : null;
  const grade = avgSus !== null ? susGrade(avgSus) : null;

  const ratingKeys = Object.keys(RATING_LABELS);
  const ratingAverages = ratingKeys.map((key) => {
    const values = filteredEntries
      .map((entry) => entry[key as keyof FeedbackEntry])
      .filter((v): v is number => typeof v === "number" && v > 0);
    const avg = values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;
    return { label: RATING_LABELS[key], value: Number(avg.toFixed(2)) };
  });

  const ageGroupCounts = countBy(filteredEntries, "ageGroup");
  const experienceCounts = countBy(filteredEntries, "gameExperience");
  const autismCounts = countBy(filteredEntries, "autismIdentification");
  const appVersionCounts = countBy(filteredEntries, "appVersion");

  const textEntries = filteredEntries.filter(
    (entry) => entry.whatWorkedWell || entry.challenges || entry.suggestions,
  );

  const activeFilterChips = filterKeys.flatMap((key) =>
    Array.from(filters[key]).map((value) => ({
      key,
      value,
      label: FILTER_LABELS[key][value] ?? value,
    })),
  );

  return (
    <div className="ui-text-dark my-8 flex w-full flex-col items-center p-4">
      <h1 className="ui-text-title m-2">Dashboard feedback</h1>
      <p className="ui-text-normal mb-1 text-base">
        {filteredEntries.length === entries.length
          ? `${entries.length} risposte`
          : `${filteredEntries.length} di ${entries.length} risposte`}
      </p>
      <p className="mb-4 text-gray-600 text-sm">
        Clicca su una barra di Ruolo / Esperienza / Spettro autistico / Versione
        app per filtrare.
      </p>

      {activeFilterChips.length > 0 && (
        <div className="mb-6 flex w-full max-w-3xl flex-wrap items-center gap-2">
          <span className="text-gray-600 text-sm">Filtri attivi:</span>
          {activeFilterChips.map((chip) => (
            <button
              key={`${chip.key}-${chip.value}`}
              type="button"
              onClick={() => toggleFilter(chip.key, chip.value)}
              className="ui-border-dark flex items-center gap-1 border-2 bg-sky-100 px-2 py-1 text-xs"
            >
              {chip.label}
              <span aria-hidden="true">×</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="text-sky-700 text-xs underline"
          >
            Cancella tutti
          </button>
        </div>
      )}

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
          <BarChart
            items={ageGroupCounts}
            max={filteredEntries.length}
            selectedKeys={filters.ageGroup}
            onItemClick={(value) => toggleFilter("ageGroup", value)}
          />
        </section>

        <section className="mb-8">
          <h2 className="ui-text-subtitle mb-3">Esperienza di gioco</h2>
          <BarChart
            items={experienceCounts}
            max={filteredEntries.length}
            selectedKeys={filters.gameExperience}
            onItemClick={(value) => toggleFilter("gameExperience", value)}
          />
        </section>

        <section className="mb-8">
          <h2 className="ui-text-subtitle mb-3">Spettro autistico</h2>
          <BarChart
            items={autismCounts}
            max={filteredEntries.length}
            selectedKeys={filters.autismIdentification}
            onItemClick={(value) => toggleFilter("autismIdentification", value)}
          />
        </section>

        <section className="mb-8">
          <h2 className="ui-text-subtitle mb-3">Versione app</h2>
          <BarChart
            items={appVersionCounts}
            max={filteredEntries.length}
            selectedKeys={filters.appVersion}
            onItemClick={(value) => toggleFilter("appVersion", value)}
          />
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
