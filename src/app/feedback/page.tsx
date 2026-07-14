"use client";

import { useState } from "react";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import { Label } from "../components/ui/label";
import Select from "../components/ui/select";

// Componente riutilizzabile per i rating scales
function RatingScale({
  label,
  htmlFor,
  value,
  onChange,
  name,
  description,
  required = false,
}: {
  label: string;
  htmlFor: string;
  value: number;
  onChange: (value: number) => void;
  name: string;
  description?: string;
  required?: boolean;
}) {
  return (
    <div className="mb-4">
      <Label htmlFor={htmlFor}>{label}</Label>
      {description && <div className="mt-1 text-sm">{description}</div>}
      <div className="mt-2 flex justify-between">
        {[1, 2, 3, 4, 5].map((ratingValue) => (
          <label
            key={ratingValue}
            className="ui-text-normal flex cursor-pointer items-center"
          >
            <input
              type="radio"
              name={name}
              value={ratingValue}
              checked={value === ratingValue}
              onChange={(e) => onChange(Number(e.target.value))}
              className="ui-custom-checkbox mr-2"
              required={required}
            />
            <span>{ratingValue}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Componente riutilizzabile per le domande a risposta libera
function TextAreaField({
  label,
  htmlFor,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  htmlFor: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="mb-4">
      <Label htmlFor={htmlFor}>{label}</Label>
      <textarea
        id={htmlFor}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ui-text-dark ui-border-focus w-full p-2"
        rows={3}
        placeholder={placeholder}
      />
    </div>
  );
}

const RATING_QUESTIONS = [
  {
    key: "accessibility",
    label: "Valutazione accessibilità *",
    description: "È facile utilizzare l'app per persone con bisogni speciali?",
    errorLabel: "l'accessibilità",
  },
  {
    key: "digitalVsPhysical",
    label: "Versione digitale vs fisica *",
    description: "La versione digitale mantiene l'esperienza del gioco fisico?",
    errorLabel: "la versione digitale vs fisica",
  },
  {
    key: "visualClarity",
    label: "Chiarezza visiva *",
    description: "Gli elementi visivi dell'app sono chiari e distinti?",
    errorLabel: "la chiarezza visiva",
  },
  {
    key: "soundComfort",
    label: "Comfort sonoro *",
    description: "I suoni e gli effetti audio sono appropriati?",
    errorLabel: "il comfort sonoro",
  },
] as const;

type RatingKey = (typeof RATING_QUESTIONS)[number]["key"];

const initialRatings = (): Record<RatingKey, number> =>
  Object.fromEntries(RATING_QUESTIONS.map((q) => [q.key, 0])) as Record<
    RatingKey,
    number
  >;

// 10 domande standard della System Usability Scale (SUS)
// https://en.wikipedia.org/wiki/System_usability_scale
const SUS_QUESTIONS = [
  "Penso che potrei usare questo sistema frequentemente.",
  "Ho trovato il sistema inutilmente complesso.",
  "Ho ritenuto il sistema facile da usare.",
  "Penso avrei bisogno del supporto di un tecnico per usare il sistema.",
  "Le varie funzioni del sistema mi sono sembrate ben integrate.",
  "Ho trovato troppe incongruenze nel sistema.",
  "La maggior parte delle persone imparerebbe a usare il sistema molto rapidamente.",
  "Ho trovato il sistema macchinoso da usare.",
  "Mi sono sentito molto sicuro nell'usare il sistema.",
  "Ho dovuto imparare molte cose prima di poter usare il sistema.",
];

const TEXT_QUESTIONS = [
  {
    key: "whatWorkedWell",
    label: "Cosa ha funzionato bene?",
    placeholder: "Descrivi gli aspetti positivi...",
  },
  {
    key: "challenges",
    label: "Cosa è stato difficile?",
    placeholder: "Descrivi le difficoltà incontrate...",
  },
  {
    key: "suggestions",
    label: "Suggerimenti per miglioramenti",
    placeholder: "Idee per migliorare l'app...",
  },
] as const;

type TextKey = (typeof TEXT_QUESTIONS)[number]["key"];

const initialTexts = (): Record<TextKey, string> =>
  Object.fromEntries(TEXT_QUESTIONS.map((q) => [q.key, ""])) as Record<
    TextKey,
    string
  >;

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [ageGroup, setGroup] = useState("");
  const [gameExperience, setGameExperience] = useState("");
  const [ratings, setRatings] = useState<Record<RatingKey, number>>(
    initialRatings(),
  );
  const [susScores, setSusScores] = useState<number[]>(
    Array(SUS_QUESTIONS.length).fill(0),
  );
  const [texts, setTexts] = useState<Record<TextKey, string>>(initialTexts());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const setRating = (key: RatingKey, value: number) =>
    setRatings((prev) => ({ ...prev, [key]: value }));

  const setSusScore = (index: number, value: number) =>
    setSusScores((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

  const setText = (key: TextKey, value: string) =>
    setTexts((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validazione campi obbligatori
    if (!ageGroup.trim()) {
      alert("Seleziona se sei un docente o un alunno.");
      return;
    }

    for (const q of RATING_QUESTIONS) {
      if (ratings[q.key] === 0) {
        alert(`Valuta ${q.errorLabel} selezionando un punteggio da 1 a 5.`);
        return;
      }
    }

    if (susScores.some((score) => score === 0)) {
      alert(
        "Rispondi a tutte le domande del questionario SUS selezionando un punteggio da 1 a 5.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          ageGroup,
          gameExperience,
          ...ratings,
          ...Object.fromEntries(
            susScores.map((score, i) => [`sus${i + 1}`, score]),
          ),
          ...texts,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setName("");
        setGroup("");
        setGameExperience("");
        setRatings(initialRatings());
        setSusScores(Array(SUS_QUESTIONS.length).fill(0));
        setTexts(initialTexts());
      } else {
        alert("Errore nell'invio del messaggio. Riprova più tardi.");
      }
    } catch (_error) {
      alert("Errore nell'invio del messaggio. Riprova più tardi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="ui-text-dark my-8 flex flex-col items-center justify-center p-2">
        <h1 className="ui-text-title m-2">Grazie per il feedback!</h1>
        <p className="ui-text-normal mb-4">
          Il tuo messaggio è stato inviato con successo.
        </p>
        <Button
          onClick={() => {
            setIsSubmitted(false);
          }}
        >
          Invia un altro messaggio
        </Button>
      </div>
    );
  }

  return (
    <div className="ui-text-dark my-8 flex flex-col items-center justify-center p-2">
      <h1 className="ui-text-title m-2">Feedback</h1>
      <p className="ui-text-normal mb-4">Aiutami a migliorare l'app!</p>
      <form onSubmit={handleSubmit} className="m-2 w-full max-w-md bg-white">
        <div className="mb-4">
          <Label htmlFor="name">Nome *</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="ageGroup">Sei un docente o un alunno? *</Label>
          <Select
            value={ageGroup}
            onChange={(e) => setGroup(e.target.value)}
            options={[
              { value: "docente", label: "Docente" },
              { value: "alunno", label: "Alunno" },
              { value: "none", label: "Altro" },
            ]}
            placeholder="Seleziona..."
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="gameExperience">Esperienza con il gioco *</Label>
          <Select
            value={gameExperience}
            onChange={(e) => setGameExperience(e.target.value)}
            options={[
              { value: "fisico", label: "Ho giocato la versione fisica" },
              { value: "digitale", label: "Ho giocato la versione digitale" },
              { value: "esperto", label: "Ho giocato entrambe le versioni" },
            ]}
            placeholder="Seleziona..."
          />
        </div>

        <div className="my-8 border-gray-300 border-b-2"></div>

        {RATING_QUESTIONS.map((q) => (
          <RatingScale
            key={q.key}
            label={q.label}
            htmlFor={q.key}
            name={q.key}
            description={q.description}
            value={ratings[q.key]}
            onChange={(value) => setRating(q.key, value)}
            required
          />
        ))}

        <div className="my-8 border-gray-300 border-b-2"></div>

        <h2 className="ui-text-title mb-2">Questionario SUS *</h2>
        <p className="ui-text-normal mb-4 text-sm">
          Per ogni affermazione, indica il tuo grado di accordo: 1 = Fortemente
          in disaccordo, 5 = Fortemente d'accordo.
        </p>

        {SUS_QUESTIONS.map((question, i) => (
          <RatingScale
            key={`sus${i + 1}`}
            label={`${i + 1}. ${question}`}
            htmlFor={`sus${i + 1}`}
            value={susScores[i]}
            onChange={(value) => setSusScore(i, value)}
            name={`sus${i + 1}`}
            required
          />
        ))}

        <div className="my-8 border-gray-300 border-b-2"></div>

        {TEXT_QUESTIONS.map((q) => (
          <TextAreaField
            key={q.key}
            label={q.label}
            htmlFor={q.key}
            name={q.key}
            value={texts[q.key]}
            onChange={(value) => setText(q.key, value)}
            placeholder={q.placeholder}
          />
        ))}

        <Button
          color="blue"
          type="submit"
          className="mx-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Invio in corso..." : "Invia"}
        </Button>
      </form>
    </div>
  );
}
