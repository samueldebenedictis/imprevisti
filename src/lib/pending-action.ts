import type { Battle } from "@/model/battle";
import type { BackWrite } from "@/model/deck/backwrite";
import type { Card } from "@/model/deck/card";
import type { DictationDraw } from "@/model/deck/dictation-draw";
import type { EmotionVideo } from "@/model/deck/emotion-video";
import type { FaceEmotion } from "@/model/deck/face-emotion";
import type { Mime } from "@/model/deck/mime";
import type { MusicEmotion } from "@/model/deck/music-emotion";
import type { PhysicalTest } from "@/model/deck/physical-test";
import type { Quiz } from "@/model/deck/quiz";
import type { WhatWouldYouDo } from "@/model/deck/what-would-you-do";
import type { GameActionResult } from "@/model/managers/types";
import type { PendingAction } from "@/types/session";

export function extractCard(result: GameActionResult): {
  card: Card;
  imageUrl?: string;
  videoUrl?: string;
} {
  switch (result.type) {
    case "mime":
      return { card: (result.data as Mime).cardTopic };
    case "quiz":
      return { card: (result.data as Quiz).cardTopic };
    case "backwrite":
      return { card: (result.data as BackWrite).cardTopic };
    case "music-emotion":
      return { card: (result.data as MusicEmotion).cardEmotion };
    case "physical-test":
      return { card: (result.data as PhysicalTest).cardTest };
    case "what-would-you-do":
      return { card: (result.data as WhatWouldYouDo).cardQuestion };
    case "face-emotion": {
      const d = result.data as FaceEmotion;
      return { card: d.cardEmotion, imageUrl: d.imageUrl };
    }
    case "emotion-video": {
      const d = result.data as EmotionVideo;
      return { card: d.cardEmotion, videoUrl: d.videoUrl };
    }
    case "dictation-draw": {
      const d = result.data as DictationDraw;
      return { card: d.cardTopic, imageUrl: d.imageUrl };
    }
    default:
      return { card: { cardTitle: "", cardText: "" } as Card };
  }
}

/**
 * Converte il risultato di un'azione del domain model nella PendingAction
 * salvata in sessione, con soli dati serializzabili (nessun oggetto Player).
 * @param result - Il risultato restituito da playTurn() o resolveBattle()
 * @param actorPlayerId - Il giocatore che deve eseguire la sfida
 * @returns La PendingAction, oppure null se il risultato non richiede azioni
 */
export function toPendingAction(
  result: GameActionResult,
  actorPlayerId: string,
): PendingAction | null {
  if (result.type === "none") return null;
  if (result.type === "battle")
    return battlePendingAction(result.data as Battle);
  const { card, imageUrl, videoUrl } = extractCard(result);
  let pendingCard: unknown = card;
  if (imageUrl !== undefined) pendingCard = { topic: card, imageUrl };
  if (videoUrl !== undefined) pendingCard = { topic: card, videoUrl };
  return {
    type: result.type,
    card: pendingCard,
    actorPlayerId,
    targetPlayerId: undefined,
  };
}

/**
 * PendingAction di una battaglia nata da una collisione.
 * @param battle - La battaglia da risolvere
 */
export function battlePendingAction(battle: Battle): PendingAction {
  const [p1, p2] = battle.getPlayers();
  return {
    type: "battle",
    card: null,
    actorPlayerId: String(p1.getId()),
    targetPlayerId: String(p2.getId()),
  };
}
