"use client";

import { useState } from "react";
import { formspreeId, formVersion } from "@/vars";
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

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [ageGroup, setGroup] = useState("");
  const [gameExperience, setGameExperience] = useState("");
  const [accessibility, setAccessibility] = useState<number>(0);
  const [digitalVsPhysical, setDigitalVsPhysical] = useState<number>(0);
  const [visualClarity, setVisualClarity] = useState<number>(0);
  const [soundComfort, setSoundComfort] = useState<number>(0);
  const [whatWorkedWell, setWhatWorkedWell] = useState("");
  const [challenges, setChallenges] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validazione campi obbligatori
    if (!ageGroup.trim()) {
      alert("Seleziona se sei un docente o un alunno.");
      return;
    }

    if (accessibility === 0) {
      alert("Valuta l'accessibilità selezionando un punteggio da 1 a 5.");
      return;
    }

    if (digitalVsPhysical === 0) {
      alert(
        "Valuta la versione digitale vs fisica selezionando un punteggio da 1 a 5.",
      );
      return;
    }

    if (visualClarity === 0) {
      alert("Valuta la chiarezza visiva selezionando un punteggio da 1 a 5.");
      return;
    }

    if (soundComfort === 0) {
      alert("Valuta il comfort sonoro selezionando un punteggio da 1 a 5.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          ageGroup,
          gameExperience,
          accessibility,
          digitalVsPhysical,
          visualClarity,
          soundComfort,
          whatWorkedWell,
          challenges,
          suggestions,
          formVersion,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setName("");
        setGroup("");
        setGameExperience("");
        setAccessibility(0);
        setDigitalVsPhysical(0);
        setVisualClarity(0);
        setSoundComfort(0);
        setWhatWorkedWell("");
        setChallenges("");
        setSuggestions("");
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

        <RatingScale
          label="Valutazione accessibilità *"
          htmlFor="accessibility"
          value={accessibility}
          onChange={setAccessibility}
          name="accessibility"
          description="È facile utilizzare l'app per persone con bisogni speciali?"
          required
        />

        <RatingScale
          label="Versione digitale vs fisica *"
          htmlFor="digitalVsPhysical"
          value={digitalVsPhysical}
          onChange={setDigitalVsPhysical}
          name="digitalVsPhysical"
          description="La versione digitale mantiene l'esperienza del gioco fisico?"
          required
        />

        <RatingScale
          label="Chiarezza visiva *"
          htmlFor="visualClarity"
          value={visualClarity}
          onChange={setVisualClarity}
          name="visualClarity"
          description="Gli elementi visivi dell'app sono chiari e distinti ?"
          required
        />

        <RatingScale
          label="Comfort sonoro *"
          htmlFor="soundComfort"
          value={soundComfort}
          onChange={setSoundComfort}
          name="soundComfort"
          description="I suoni e gli effetti audio sono appropriati?"
          required
        />

        <div className="my-8 border-gray-300 border-b-2"></div>

        <div className="mb-4">
          <Label htmlFor="whatWorkedWell">Cosa ha funzionato bene?</Label>
          <textarea
            id="whatWorkedWell"
            name="whatWorkedWell"
            value={whatWorkedWell}
            onChange={(e) => setWhatWorkedWell(e.target.value)}
            className="ui-text-dark ui-border-focus w-full p-2"
            rows={3}
            placeholder="Descrivi gli aspetti positivi..."
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="challenges">Cosa è stato difficile?</Label>
          <textarea
            id="challenges"
            name="challenges"
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            className="ui-text-dark ui-border-focus w-full p-2"
            rows={3}
            placeholder="Descrivi le difficoltà incontrate..."
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="suggestions">Suggerimenti per miglioramenti</Label>
          <textarea
            id="suggestions"
            name="suggestions"
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            className="ui-text-dark ui-border-focus w-full p-2"
            rows={3}
            placeholder="Idee per migliorare l'app..."
          />
        </div>

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
