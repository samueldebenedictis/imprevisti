import type { GameJSON } from "@/model/game";

export interface SessionPlayer {
  id: string; // stringa numerica "0", "1", "2" — corrisponde a Player(id: number)
  name: string;
}

export interface PendingAction {
  type: string; // 'mime' | 'quiz' | 'backwrite' | 'face-emotion' | 'music-emotion' | 'physical-test' | 'what-would-you-do' | 'dictation-draw'
  card: unknown; // dati primitivi serializzati (NO oggetti Player)
  actorPlayerId: string; // chi esegue l'azione
  targetPlayerId?: string; // chi indovina/disegna (mime, backwrite, dictation-draw)
}

export interface LastMoveInfo {
  actorPlayerId: string;
  diceResult: number; // 0 = turno saltato
  squareNumber: number; // el.getNumber() — stesso valore mostrato sulla casella
  squareType: string;
}

export interface SessionState {
  sessionId: string;
  hostToken: string; // segreto per autorizzare azioni host
  players: SessionPlayer[];
  started: boolean;
  gameState: GameJSON | null;
  currentPlayerId: string | null; // String(player.getId())
  pendingAction: PendingAction | null;
  diceResult: number | null;
  lastMoveInfo: LastMoveInfo | null;
  gameOver: { winnerName: string } | null;
  createdAt: number;
  updatedAt: number;
}

// Versione pubblica senza hostToken
export type PublicSessionState = Omit<SessionState, "hostToken">;
