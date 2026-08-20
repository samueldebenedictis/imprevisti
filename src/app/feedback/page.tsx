"use client";

import { useState } from "react";
import { version as appVersion } from "../../../package.json";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import { Label } from "../components/ui/label";
import Select from "../components/ui/select";

// Componente riutilizzabile per i rating scales
function RatingScale({
  label,
  labelClassName,
  htmlFor,
  value,
  onChange,
  name,
  description,
  required = false,
  invalid = false,
}: {
  label: string;
  labelClassName?: string;
  htmlFor: string;
  value: number;
  onChange: (value: number) => void;
  name: string;
  description?: string;
  required?: boolean;
  invalid?: boolean;
}) {
  return (
    <div id={htmlFor} className="mb-4">
      <Label
        htmlFor={htmlFor}
        className={`${labelClassName ?? ""} ${invalid ? "text-red-600" : ""}`}
      >
        {label}
      </Label>
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
            <span className="font-light">{ratingValue}</span>
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
      <Label htmlFor={htmlFor} className="font-light">
        {label}
      </Label>
      <textarea
        id={htmlFor}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ui-text-dark ui-border-focus mt-2 w-full p-2"
        rows={3}
        placeholder={placeholder}
      />
    </div>
  );
}

// Componente riutilizzabile per la legenda della scala di accordo 1-5
function RatingScaleLegend() {
  return (
    <p className="ui-text-normal mb-4 text-sm">
      Per ogni affermazione, indica il tuo grado di accordo:
      <br />1 = Fortemente in disaccordo, 5 = Fortemente d'accordo.
    </p>
  );
}

const RATING_QUESTIONS = [
  {
    key: "digitalVsPhysical",
    label: "Versione digitale vs fisica",
    description: "La versione digitale mantiene l'esperienza del gioco fisico?",
    errorLabel: "la versione digitale vs fisica",
    required: false,
  },
  {
    key: "gameplayClarity",
    label: "Chiarezza dei meccanismi di gioco *",
    description: "Le regole e i meccanismi di gioco sono chiari?",
    errorLabel: "la chiarezza dei meccanismi di gioco",
    required: true,
  },
  {
    key: "graphics",
    label: "Grafica *",
    description: "Come valuti la qualità della grafica dell'applicativo?",
    errorLabel: "la grafica",
    required: true,
  },
  {
    key: "enjoyment",
    label: "Mi è piaciuto *",
    description: "Quanto ti è piaciuta l'esperienza complessiva del gioco?",
    errorLabel: "quanto ti è piaciuto il gioco",
    required: true,
  },
  {
    key: "funLevel",
    label: "Mi sono divertito *",
    description: "Quanto ti sei divertito giocando?",
    errorLabel: "quanto ti sei divertito",
    required: true,
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
  "Penso che potrei usare questo applicativo frequentemente.",
  "Ho trovato l'applicativo inutilmente complesso.",
  "Ho ritenuto l'applicativo facile da usare.",
  "Penso avrei bisogno del supporto di un tecnico per usare l'applicativo.",
  "Le varie funzioni dell'applicativo mi sono sembrate ben integrate.",
  "Ho trovato troppe incongruenze nell'applicativo.",
  "La maggior parte delle persone imparerebbe a usare l'applicativo molto rapidamente.",
  "Ho trovato l'applicativo macchinoso da usare.",
  "Mi sono sentito molto sicuro nell'usare l'applicativo.",
  "Ho dovuto imparare molte cose prima di poter usare l'applicativo.",
];

const TEXT_QUESTIONS = [
  {
    key: "whatWorkedWell",
    label: "Cosa ha funzionato bene?",
    placeholder: "Descrivi gli aspetti positivi...",
  },
  {
    key: "challenges",
    label: "Cosa ha funzionato male?",
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

const STEP_LABELS = ["Info base", "Questionario SUS", "Valutazioni", "Altro"];
const TOTAL_STEPS = STEP_LABELS.length;

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [ageGroup, setGroup] = useState("");
  const [gameExperience, setGameExperience] = useState("");
  const [screenMode, setScreenMode] = useState("");
  const [autismIdentification, setAutismIdentification] = useState("");
  const [ratings, setRatings] = useState<Record<RatingKey, number>>(
    initialRatings(),
  );
  const [susScores, setSusScores] = useState<number[]>(
    Array(SUS_QUESTIONS.length).fill(0),
  );
  const [texts, setTexts] = useState<Record<TextKey, string>>(initialTexts());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step, setStep] = useState(0);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());

  const clearInvalid = (key: string) =>
    setInvalidFields((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });

  const setRating = (key: RatingKey, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
    clearInvalid(key);
  };

  const setSusScore = (index: number, value: number) => {
    setSusScores((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    clearInvalid(`sus${index + 1}`);
  };

  const setText = (key: TextKey, value: string) =>
    setTexts((prev) => ({ ...prev, [key]: value }));

  const getStepInvalidFields = (s: number): string[] => {
    if (s === 0) {
      const fields: string[] = [];
      if (!name.trim()) fields.push("name");
      if (!ageGroup.trim()) fields.push("ageGroup");
      if (!gameExperience.trim()) fields.push("gameExperience");
      if (!screenMode.trim()) fields.push("screenMode");
      return fields;
    }

    if (s === 1) {
      return susScores
        .map((score, i) => (score === 0 ? `sus${i + 1}` : null))
        .filter((f): f is string => f !== null);
    }

    if (s === 2) {
      return RATING_QUESTIONS.filter(
        (q) => q.required && ratings[q.key] === 0,
      ).map((q) => q.key);
    }

    return [];
  };

  const scrollToField = (id: string) => {
    setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const goToNextStep = () => {
    const fields = getStepInvalidFields(step);
    if (fields.length > 0) {
      setInvalidFields(new Set(fields));
      scrollToField(fields[0]);
      return;
    }
    setInvalidFields(new Set());
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (let s = 0; s < TOTAL_STEPS; s++) {
      const fields = getStepInvalidFields(s);
      if (fields.length > 0) {
        setStep(s);
        setInvalidFields(new Set(fields));
        scrollToField(fields[0]);
        return;
      }
    }
    setInvalidFields(new Set());

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
          screenMode,
          autismIdentification,
          appVersion,
          ...Object.fromEntries(
            Object.entries(ratings).filter(([, value]) => value !== 0),
          ),
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
        setScreenMode("");
        setAutismIdentification("");
        setRatings(initialRatings());
        setSusScores(Array(SUS_QUESTIONS.length).fill(0));
        setTexts(initialTexts());
        setStep(0);
        setInvalidFields(new Set());
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
            setStep(0);
          }}
        >
          Invia un altro messaggio
        </Button>
      </div>
    );
  }

  return (
    <div className="ui-text-dark my-8 flex flex-col items-center justify-center p-4">
      <h1 className="ui-text-title m-2">Feedback</h1>
      <p className="ui-text-normal mb-4">Aiutami a migliorare l'app!</p>
      <form
        onSubmit={handleSubmit}
        className="m-2 w-full max-w-md bg-white px-2"
      >
        <div className="mb-6">
          <p className="ui-text-normal mb-1 text-sm">
            Passo {step + 1} di {TOTAL_STEPS}: {STEP_LABELS[step]}
          </p>
          <div className="h-2 w-full bg-gray-200">
            <div
              className="h-2 bg-sky-500 transition-all"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {step === 0 && (
          <>
            <h2 className="ui-text-title mb-2">Info base</h2>
            <div className="mb-4">
              <Label
                htmlFor="name"
                className={`font-light ${invalidFields.has("name") ? "text-red-600" : ""}`}
              >
                Nome *
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearInvalid("name");
                }}
                required
                className={`mt-2 ${invalidFields.has("name") ? "border-red-600" : ""}`}
              />
            </div>

            <div className="mb-4">
              <Label
                htmlFor="ageGroup"
                className={`font-light ${invalidFields.has("ageGroup") ? "text-red-600" : ""}`}
              >
                Sei un docente o un alunno? *
              </Label>
              <Select
                id="ageGroup"
                value={ageGroup}
                onChange={(e) => {
                  setGroup(e.target.value);
                  clearInvalid("ageGroup");
                }}
                options={[
                  { value: "docente", label: "Docente" },
                  { value: "alunno", label: "Alunno" },
                  { value: "none", label: "Altro" },
                ]}
                placeholder="Seleziona..."
                className={`mt-2 ${invalidFields.has("ageGroup") ? "border-red-600" : ""}`}
              />
            </div>

            <div className="mb-4">
              <Label
                htmlFor="gameExperience"
                className={`font-light ${invalidFields.has("gameExperience") ? "text-red-600" : ""}`}
              >
                Esperienza con il gioco *
              </Label>
              <Select
                id="gameExperience"
                value={gameExperience}
                onChange={(e) => {
                  setGameExperience(e.target.value);
                  clearInvalid("gameExperience");
                }}
                options={[
                  { value: "fisico", label: "Ho giocato la versione fisica" },
                  {
                    value: "digitale",
                    label: "Ho giocato la versione digitale",
                  },
                  {
                    value: "esperto",
                    label: "Ho giocato entrambe le versioni",
                  },
                ]}
                placeholder="Seleziona..."
                className={`mt-2 ${invalidFields.has("gameExperience") ? "border-red-600" : ""}`}
              />
            </div>

            <div className="mb-4">
              <Label
                htmlFor="screenMode"
                className={`font-light ${invalidFields.has("screenMode") ? "text-red-600" : ""}`}
              >
                Ho giocato alla versione schermo singolo o multischermo *
              </Label>
              <Select
                id="screenMode"
                value={screenMode}
                onChange={(e) => {
                  setScreenMode(e.target.value);
                  clearInvalid("screenMode");
                }}
                options={[
                  { value: "singolo", label: "Schermo singolo" },
                  { value: "multi", label: "Multischermo" },
                ]}
                placeholder="Seleziona..."
                className={`mt-2 ${invalidFields.has("screenMode") ? "border-red-600" : ""}`}
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="ui-text-title mb-2">Questionario SUS</h2>
            <RatingScaleLegend />

            {SUS_QUESTIONS.map((question, i) => (
              <RatingScale
                key={`sus${i + 1}`}
                label={`${i + 1}. ${question}`}
                labelClassName="font-light"
                htmlFor={`sus${i + 1}`}
                value={susScores[i]}
                onChange={(value) => setSusScore(i, value)}
                name={`sus${i + 1}`}
                required
                invalid={invalidFields.has(`sus${i + 1}`)}
              />
            ))}
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="ui-text-title mb-2">Valutazioni</h2>
            <RatingScaleLegend />

            {RATING_QUESTIONS.map((q) => (
              <RatingScale
                key={q.key}
                label={q.label}
                labelClassName="font-light"
                htmlFor={q.key}
                name={q.key}
                description={q.description}
                value={ratings[q.key]}
                onChange={(value) => setRating(q.key, value)}
                required={q.required}
                invalid={invalidFields.has(q.key)}
              />
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="ui-text-title mb-2">Altro</h2>
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

            <div className="mb-4">
              <Label htmlFor="autismIdentification" className="font-light">
                Hai una diagnosi (o ti riconosci) nello spettro autistico?
              </Label>
              <div className="mt-1 text-sm">
                Questa informazione è opzionale, ci aiuta a leggere meglio i
                feedback legati a bisogni specifici.
              </div>
              <Select
                id="autismIdentification"
                value={autismIdentification}
                onChange={(e) => setAutismIdentification(e.target.value)}
                options={[
                  { value: "si_diagnosi", label: "Sì, diagnosi confermata" },
                  {
                    value: "si_non_diagnosticato",
                    label: "Sì, ma senza diagnosi formale",
                  },
                  { value: "no", label: "No" },
                  {
                    value: "preferisco_non_rispondere",
                    label: "Preferisco non rispondere",
                  },
                ]}
                placeholder="Seleziona..."
                className="mt-2"
              />
            </div>
          </>
        )}

        <div className="mt-6 flex justify-between gap-2">
          {step > 0 ? (
            <Button
              type="button"
              className="mx-0"
              onClick={() => setStep((s) => s - 1)}
            >
              Indietro
            </Button>
          ) : (
            <div />
          )}

          {step < TOTAL_STEPS - 1 ? (
            <Button
              key="next"
              color="blue"
              type="button"
              className="mx-0"
              onClick={goToNextStep}
            >
              Avanti
            </Button>
          ) : (
            <Button
              key="submit"
              color="blue"
              type="submit"
              className="mx-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Invio in corso..." : "Invia"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
