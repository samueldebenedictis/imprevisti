import { Battle } from "../battle";
import type { Player } from "../player";
import {
  BackWrite,
  DictationDraw,
  EmotionVideo,
  FaceEmotion,
  Mime,
  MusicEmotion,
  PhysicalTest,
  Quiz,
  WhatWouldYouDo,
} from "../square";
import type { GameActionResult } from "./types";

type SpecialAction =
  | Mime
  | Quiz
  | BackWrite
  | FaceEmotion
  | EmotionVideo
  | MusicEmotion
  | PhysicalTest
  | WhatWouldYouDo
  | DictationDraw;

/**
 * Converte l'effetto di una casella speciale nel GameActionResult corrispondente.
 * È usato sia dopo il lancio del dado sia dopo la vittoria di una battaglia,
 * così che in entrambi i casi si attivi la stessa sfida.
 * @param action - L'oggetto sfida restituito dalla casella, se presente
 * @param diceResult - Il valore del dado da riportare nel risultato
 * @returns Il risultato tipizzato, oppure "none" se la casella non attiva sfide
 */
export function specialActionToResult(
  action: SpecialAction | undefined,
  diceResult: number,
): GameActionResult {
  const type = actionType(action);
  if (!action || type === "none") {
    return { type: "none", diceResult, actionType: null };
  }
  return { type, data: action, diceResult, actionType: type };
}

function actionType(
  action: SpecialAction | undefined,
): GameActionResult["type"] {
  if (action instanceof Mime) return "mime";
  if (action instanceof Quiz) return "quiz";
  if (action instanceof BackWrite) return "backwrite";
  if (action instanceof MusicEmotion) return "music-emotion";
  if (action instanceof PhysicalTest) return "physical-test";
  if (action instanceof WhatWouldYouDo) return "what-would-you-do";
  if (action instanceof DictationDraw) return "dictation-draw";
  if (action instanceof FaceEmotion) return "face-emotion";
  if (action instanceof EmotionVideo) return "emotion-video";
  return "none";
}

/**
 * Estrae la prima battaglia generata dalla risoluzione di una sfida.
 * I metodi resolve* restituiscono una sola collisione o una coppia
 * (una per ciascuno dei due giocatori che avanzano).
 * Nelle sfide a coppie (Mimo, Parole alle spalle, Disegno dettato) i due
 * giocatori avanzano insieme: se finiscono sulla stessa casella non si
 * sfidano tra loro, mentre resta valida la collisione con un terzo giocatore.
 * @param collisions - Il valore restituito da un metodo resolve*
 * @param partners - I giocatori che hanno avanzato insieme, se presenti
 * @returns La prima battaglia trovata, oppure null
 */
export function firstBattle(
  collisions: Battle | null | readonly (Battle | null)[] | undefined,
  partners: readonly Player[] = [],
): Battle | null {
  if (!collisions) return null;
  const list = collisions instanceof Battle ? [collisions] : collisions;
  const partnerIds = new Set(partners.map((p) => p.getId()));
  const isBetweenPartners = (b: Battle) =>
    partnerIds.size > 1 &&
    b.getPlayers().every((p) => partnerIds.has(p.getId()));
  return (
    list.find(
      (c): c is Battle => c instanceof Battle && !isBetweenPartners(c),
    ) ?? null
  );
}
