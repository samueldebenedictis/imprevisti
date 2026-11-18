"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  CUSTOM_DECKS_FILENAME,
  cleanDeckCards,
  customDecksFromFile,
  customDecksToFile,
} from "@/lib/custom-decks-file";
import {
  type CustomDecks,
  defaultDeckCards,
  EDITABLE_DECK_IDS,
  type EditableDeckId,
  MAX_CARD_TEXT,
  MAX_CUSTOM_CARDS,
} from "@/model/deck/custom-decks";
import { useConfigStore } from "@/store/config-store";
import { URL_HOME } from "@/vars";
import Button from "../components/ui/button";
import { Label } from "../components/ui/label";
import Select from "../components/ui/select";
import {
  LABEL_ADVANCED_MODE_APPLY,
  LABEL_ADVANCED_MODE_CANCEL,
  LABEL_BACKWRITE,
  LABEL_CUSTOM_DECKS,
  LABEL_CUSTOM_DECKS_ADD,
  LABEL_CUSTOM_DECKS_ANSWER,
  LABEL_CUSTOM_DECKS_COUNT,
  LABEL_CUSTOM_DECKS_CUSTOMIZED,
  LABEL_CUSTOM_DECKS_DECK,
  LABEL_CUSTOM_DECKS_DELETE,
  LABEL_CUSTOM_DECKS_DESCRIPTION,
  LABEL_CUSTOM_DECKS_EMPTY,
  LABEL_CUSTOM_DECKS_EXPORT,
  LABEL_CUSTOM_DECKS_IMPORT,
  LABEL_CUSTOM_DECKS_IMPORT_ERROR,
  LABEL_CUSTOM_DECKS_IMPORTED,
  LABEL_CUSTOM_DECKS_QUESTION,
  LABEL_CUSTOM_DECKS_REMOVE_ALL,
  LABEL_CUSTOM_DECKS_RESTORE,
  LABEL_CUSTOM_DECKS_TEXT,
  LABEL_MIME,
  LABEL_MUSIC_EMOTION,
  LABEL_PHYSICAL_TEST,
  LABEL_QUIZ,
  LABEL_WHAT_WOULD_YOU_DO,
} from "../texts";
import { downloadJSON } from "../utils/game-storage";

const DECK_LABELS: Record<EditableDeckId, string> = {
  quiz: LABEL_QUIZ,
  whatWouldYouDo: LABEL_WHAT_WOULD_YOU_DO,
  mime: LABEL_MIME,
  backWrite: LABEL_BACKWRITE,
  musicEmotion: LABEL_MUSIC_EMOTION,
  physicalTest: LABEL_PHYSICAL_TEST,
};

/** Carta in modifica: `answer` solo per il quiz; `key` per React. */
type EditorCard = { key: number; text: string; answer: string };
type Draft = Record<EditableDeckId, EditorCard[]>;

let nextKey = 0;
const toEditor = (cards: Required<CustomDecks>[EditableDeckId]): EditorCard[] =>
  cards.map((card) =>
    typeof card === "string"
      ? { key: nextKey++, text: card, answer: "" }
      : { key: nextKey++, text: card.domanda, answer: card.risposta },
  );

const fromEditor = (id: EditableDeckId, cards: EditorCard[]) =>
  id === "quiz"
    ? cards.map((c) => ({ domanda: c.text, risposta: c.answer }))
    : cards.map((c) => c.text);

/** Bozza con tutti i mazzi: personalizzati se ci sono, altrimenti predefiniti. */
function draftFor(decks: CustomDecks): Draft {
  const all = { ...defaultDeckCards(), ...decks };
  return Object.fromEntries(
    EDITABLE_DECK_IDS.map((id) => [id, toEditor(all[id])]),
  ) as Draft;
}

const sameCards = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

/**
 * Pulisce la bozza. I mazzi uguali ai predefiniti non vengono salvati, così
 * restano aggiornati con le carte del gioco.
 */
function cleanDraft(
  draft: Draft,
): { decks: CustomDecks } | { error: string; deck: EditableDeckId } {
  const defaults = defaultDeckCards();
  const decks: CustomDecks = {};
  for (const id of EDITABLE_DECK_IDS) {
    const result = cleanDeckCards(
      id,
      fromEditor(id, draft[id]),
      DECK_LABELS[id],
    );
    if ("error" in result) return { error: result.error, deck: id };
    if (!sameCards(result.cards, defaults[id]))
      (decks as Record<string, unknown>)[id] = result.cards;
  }
  return { decks };
}

export default function CustomDecksPage() {
  const router = useRouter();
  const customDecks = useConfigStore((state) => state.customDecks);
  const actions = useConfigStore((state) => state.actions);

  // La bozza si crea dopo il montaggio: le carte salvate sono nel browser
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deck, setDeck] = useState<EditableDeckId>("quiz");
  const [message, setMessage] = useState<{ text: string; error: boolean }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft((current) => current ?? draftFor(customDecks));
  }, [customDecks]);

  if (!draft) return <div className="my-8 min-h-screen" />;

  const defaults = defaultDeckCards();
  const cards = draft[deck];
  const isQuiz = deck === "quiz";
  const isCustomized = (id: EditableDeckId) =>
    !sameCards(fromEditor(id, draft[id]), defaults[id]);

  const setCards = (next: EditorCard[]) => {
    setDraft({ ...draft, [deck]: next });
    setMessage(undefined);
  };
  const updateCard = (key: number, change: Partial<EditorCard>) =>
    setCards(cards.map((c) => (c.key === key ? { ...c, ...change } : c)));

  const addCard = () => {
    setCards([{ key: nextKey++, text: "", answer: "" }, ...cards]);
    // La nuova carta è in cima: torno all'inizio dell'elenco e la seleziono
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: 0 });
      listRef.current?.querySelector("input")?.focus();
    });
  };

  const exportFile = () => {
    const result = cleanDraft(draft);
    if ("error" in result) {
      setDeck(result.deck);
      setMessage({ text: result.error, error: true });
      return;
    }
    downloadJSON(customDecksToFile(result.decks), CUSTOM_DECKS_FILENAME);
  };

  const importFile = async (file: File) => {
    let raw: unknown;
    try {
      raw = JSON.parse(await file.text());
    } catch {
      setMessage({ text: LABEL_CUSTOM_DECKS_IMPORT_ERROR, error: true });
      return;
    }
    const result = customDecksFromFile(raw);
    if ("error" in result) {
      setMessage({
        text: `${LABEL_CUSTOM_DECKS_IMPORT_ERROR}: ${result.error}`,
        error: true,
      });
      return;
    }
    setDraft(draftFor(result.decks));
    setMessage({ text: LABEL_CUSTOM_DECKS_IMPORTED, error: false });
  };

  const apply = () => {
    const result = cleanDraft(draft);
    if ("error" in result) {
      setDeck(result.deck);
      setMessage({ text: result.error, error: true });
      return;
    }
    actions.setCustomDecks(result.decks);
    router.push(URL_HOME);
  };

  return (
    <div className="ui-text-dark my-8 flex flex-col items-center justify-center p-2">
      <h1 className="ui-text-title m-2">{LABEL_CUSTOM_DECKS}</h1>
      <p className="ui-text-normal mb-6 max-w-md text-center">
        {LABEL_CUSTOM_DECKS_DESCRIPTION}
      </p>

      <div className="w-full max-w-2xl">
        <Label htmlFor="deck">{LABEL_CUSTOM_DECKS_DECK}</Label>
        <Select
          id="deck"
          value={deck}
          onChange={(e) => {
            setDeck(e.target.value as EditableDeckId);
            setMessage(undefined);
          }}
          options={EDITABLE_DECK_IDS.map((id) => ({
            value: id,
            label: `${DECK_LABELS[id]} (${LABEL_CUSTOM_DECKS_COUNT(draft[id].length)}${
              isCustomized(id) ? `, ${LABEL_CUSTOM_DECKS_CUSTOMIZED}` : ""
            })`,
          }))}
        />

        <div className="my-2 flex flex-wrap justify-center">
          <Button
            color="green"
            onClick={addCard}
            disabled={cards.length >= MAX_CUSTOM_CARDS}
          >
            {LABEL_CUSTOM_DECKS_ADD}
          </Button>
          <Button
            color="red"
            onClick={() => setCards([])}
            disabled={cards.length === 0}
          >
            {LABEL_CUSTOM_DECKS_REMOVE_ALL}
          </Button>
          <Button
            color="yellow"
            onClick={() => setCards(toEditor(defaults[deck]))}
            disabled={!isCustomized(deck)}
          >
            {LABEL_CUSTOM_DECKS_RESTORE}
          </Button>
        </div>

        <div
          ref={listRef}
          className="ui-border-dark mb-4 max-h-[60vh] overflow-y-auto bg-white"
        >
          {cards.length === 0 && (
            <p className="ui-text-normal p-4 text-center">
              {LABEL_CUSTOM_DECKS_EMPTY}
            </p>
          )}
          {cards.map((card, index) => (
            <div
              key={card.key}
              className="flex items-center gap-2 border-gray-200 border-b p-2"
            >
              <span className="ui-text-normal w-8 flex-shrink-0 text-right">
                {index + 1}
              </span>
              <div className="flex flex-1 flex-col gap-1 sm:flex-row">
                <input
                  type="text"
                  value={card.text}
                  maxLength={MAX_CARD_TEXT}
                  aria-label={`${isQuiz ? LABEL_CUSTOM_DECKS_QUESTION : LABEL_CUSTOM_DECKS_TEXT} ${index + 1}`}
                  placeholder={
                    isQuiz
                      ? LABEL_CUSTOM_DECKS_QUESTION
                      : LABEL_CUSTOM_DECKS_TEXT
                  }
                  onChange={(e) =>
                    updateCard(card.key, { text: e.target.value })
                  }
                  className={`ui-text-dark ui-border-focus min-w-0 p-2 ${isQuiz ? "sm:flex-[2]" : "flex-1"}`}
                />
                {isQuiz && (
                  <input
                    type="text"
                    value={card.answer}
                    maxLength={MAX_CARD_TEXT}
                    aria-label={`${LABEL_CUSTOM_DECKS_ANSWER} ${index + 1}`}
                    placeholder={LABEL_CUSTOM_DECKS_ANSWER}
                    onChange={(e) =>
                      updateCard(card.key, { answer: e.target.value })
                    }
                    className="ui-text-dark ui-border-focus min-w-0 p-2 sm:flex-1"
                  />
                )}
              </div>
              <button
                type="button"
                aria-label={LABEL_CUSTOM_DECKS_DELETE(index + 1)}
                title={LABEL_CUSTOM_DECKS_DELETE(index + 1)}
                onClick={() =>
                  setCards(cards.filter((c) => c.key !== card.key))
                }
                className="ui-text-subtitle h-10 w-10 flex-shrink-0 cursor-pointer text-red-600 hover:bg-red-50"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {message && (
          <p
            role={message.error ? "alert" : "status"}
            className={`ui-text-normal mb-2 text-center ${message.error ? "text-red-600" : "text-green-700"}`}
          >
            {message.text}
          </p>
        )}

        <div className="flex flex-wrap justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            data-testid="custom-decks-file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importFile(file);
              e.target.value = "";
            }}
          />
          <Button color="blue" onClick={() => fileInputRef.current?.click()}>
            {LABEL_CUSTOM_DECKS_IMPORT}
          </Button>
          <Button color="blue" onClick={exportFile}>
            {LABEL_CUSTOM_DECKS_EXPORT}
          </Button>
        </div>
        <div className="flex flex-wrap justify-center">
          <Button color="red" onClick={() => router.push(URL_HOME)}>
            {LABEL_ADVANCED_MODE_CANCEL}
          </Button>
          <Button color="green" onClick={apply}>
            {LABEL_ADVANCED_MODE_APPLY}
          </Button>
        </div>
      </div>
    </div>
  );
}
