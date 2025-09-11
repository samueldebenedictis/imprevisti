import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Battle } from "@/model/battle";
import { Mime } from "@/model/deck/mime";
import { Quiz } from "@/model/deck/quiz";
import { type GameJSON, Game as GameModel } from "@/model/game";
import type { Player } from "@/model/player";
import { soundManager } from "../app/utils/sound-manager";

export interface GameState {
  // Core game state
  game: GameModel | null;
  gameData: GameJSON | null; // JSON stato del gioco

  // UI state
  isModalOpen: boolean;
  isDiceModalOpen: boolean;
  isRolling: boolean;

  // Dice and action state
  diceResult: number | null;
  modalDiceResult: number | null;
  actionType: string | null;
  actionData: Battle | Mime | Quiz | null;

  // Player state
  playerWhoRolledName: string | null;
  playerWhoRolled: Player | null;

  // Position state
  startPosition: number | undefined;
  newPosition: number | undefined;

  // Restore game state
  hasSavedGame: boolean;
  selectedFile: File | null;
}

export interface GameActions {
  // Game management
  setGame: (game: GameModel | null) => void;
  loadGame: () => void;
  deleteGame: () => void;

  // Turn management
  playTurn: () => void;
  continueAfterDice: () => void;

  // Action resolution
  resolveBattle: (winnerId: number) => void;
  resolveMime: (success: boolean, guesserId?: number) => void;
  resolveQuiz: (success: boolean) => void;

  // UI management
  openDiceModal: () => void;
  closeModal: () => void;
  resetDiceState: () => void;

  // Restore game management
  checkSavedGame: () => void;
  setSelectedFile: (file: File | null) => void;
  loadFromFile: () => Promise<void>;
  restoreFromLocalStorage: () => void;
}

type GameStore = GameState & { actions: GameActions };

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      game: null,
      gameData: null,
      counter: 0,
      isModalOpen: false,
      isDiceModalOpen: false,
      isRolling: false,
      diceResult: null,
      modalDiceResult: null,
      actionType: null,
      actionData: null,
      playerWhoRolledName: null,
      playerWhoRolled: null,
      startPosition: undefined,
      newPosition: undefined,
      hasSavedGame: false,
      selectedFile: null,

      actions: {
        setGame: (game) => {
          const gameData = game ? game.toJSON() : null;
          set({ game, gameData });
        },

        loadGame: () => {
          const { gameData } = get();
          if (gameData) {
            try {
              const loadedGame = GameModel.fromJSON(gameData);
              set({ game: loadedGame });
            } catch (error) {
              console.error("Failed to load game:", error);
              set({ game: null, gameData: null });
            }
          }
        },

        deleteGame: () => {
          set({
            game: null,
            gameData: null,
            isModalOpen: false,
            isDiceModalOpen: false,
            isRolling: false,
            diceResult: null,
            modalDiceResult: null,
            actionType: null,
            actionData: null,
            playerWhoRolledName: null,
            playerWhoRolled: null,
            startPosition: undefined,
            newPosition: undefined,
          });
        },

        playTurn: () => {
          const { game } = get();
          if (!game) return;

          // Play dice roll sound
          soundManager.playDiceRoll();

          // Save current player before roll
          const currentPlayerBeforeRoll = game.getPlayers()[game.getTurn()];
          const positionBeforeRoll = game.getPlayerPosition(
            currentPlayerBeforeRoll,
          );

          set({
            playerWhoRolled: currentPlayerBeforeRoll,
            playerWhoRolledName: currentPlayerBeforeRoll.getName(),
          });

          // Get dice result and action
          const { diceResult, actionType, data } = game.playTurn();

          // Handle skip turn (diceResult === 0)
          if (diceResult === 0) {
            // Play turn skip sound
            soundManager.playTurnSkip();

            const initialPosition = game.getPlayerPosition(
              currentPlayerBeforeRoll,
            );
            set({
              startPosition: initialPosition,
              newPosition: initialPosition,
              diceResult,
              actionType,
              actionData: data || null,
              modalDiceResult: diceResult,
              isRolling: false,
            });

            // Update game state
            const updatedGame = GameModel.fromJSON(game.toJSON());
            const updatedGameData = updatedGame.toJSON();
            set({ game: updatedGame, gameData: updatedGameData });
            return;
          }

          // Handle normal turn with animation
          set({ isRolling: true });

          setTimeout(() => {
            const finalPosition = game.getPlayerPosition(
              currentPlayerBeforeRoll,
            );

            set({
              startPosition: positionBeforeRoll,
              newPosition: finalPosition,
              diceResult,
              actionType,
              actionData: data || null,
              modalDiceResult: diceResult,
              isRolling: false,
            });

            // Update game state
            const updatedGame = GameModel.fromJSON(game.toJSON());
            const updatedGameData = updatedGame.toJSON();
            set({ game: updatedGame, gameData: updatedGameData });

            // Check if modal should be shown
            const hasSpecialEffect = (() => {
              if (
                finalPosition !== undefined &&
                positionBeforeRoll !== undefined &&
                diceResult > 0
              ) {
                const normalPosition = Math.min(
                  Math.max(0, positionBeforeRoll + diceResult),
                  game.getBoard().getSquares().length - 1,
                );
                return finalPosition !== normalPosition;
              }
              return false;
            })();

            // Play battle sound if battle occurs
            if (actionType === "battle") {
              soundManager.playBattle();
            }

            // Play special square sound if applicable
            if (hasSpecialEffect || actionType) {
              soundManager.playSpecialSquare();
              set({ isModalOpen: true });
            }
          }, 1000);
        },

        continueAfterDice: () => {
          set({
            isDiceModalOpen: false,
            modalDiceResult: null,
            playerWhoRolled: null,
            playerWhoRolledName: null,
          });
        },

        resolveBattle: (winnerId: number) => {
          const { game, actionData, actionType } = get();
          if (!game || !actionData || actionType !== "battle") return;

          const winnerPlayer = game
            .getPlayers()
            .find((p) => p.getId() === winnerId);
          if (!winnerPlayer) return;

          // Get current player instances
          const [oldPlayer1, oldPlayer2] = (actionData as Battle).getPlayers();
          const currentPlayer1 = game
            .getPlayers()
            .find((p) => p.getId() === oldPlayer1.getId());
          const currentPlayer2 = game
            .getPlayers()
            .find((p) => p.getId() === oldPlayer2.getId());

          if (currentPlayer1 && currentPlayer2) {
            const currentBattle = new Battle(currentPlayer1, currentPlayer2);
            game.resolveBattle(currentBattle, winnerPlayer);

            const updatedGame = GameModel.fromJSON(game.toJSON());
            const updatedGameData = updatedGame.toJSON();
            set({ game: updatedGame, gameData: updatedGameData });
            get().actions.closeModal();
          }
        },

        resolveMime: (success: boolean, guesserId?: number) => {
          const { game, actionData, actionType } = get();
          if (!game || !actionData || actionType !== "mime") return;

          const mimeAction = actionData as Mime;
          let guesserPlayer: Player | undefined;
          if (guesserId !== undefined) {
            guesserPlayer = game
              .getPlayers()
              .find((p) => p.getId() === guesserId);
          }

          const currentMimePlayer = game
            .getPlayers()
            .find((p) => p.getId() === mimeAction.mimePlayer.getId());

          if (!currentMimePlayer) {
            get().actions.closeModal();
            return;
          }

          const currentMimeAction = new Mime(
            currentMimePlayer,
            mimeAction.cardTopic,
          );
          game.resolveMime(currentMimeAction, success, guesserPlayer);

          const updatedGame = GameModel.fromJSON(game.toJSON());
          const updatedGameData = updatedGame.toJSON();
          set({ game: updatedGame, gameData: updatedGameData });
          get().actions.closeModal();
        },

        resolveQuiz: (success: boolean) => {
          const { game, actionData, actionType } = get();
          if (!game || !actionData || actionType !== "quiz") return;

          const quizAction = actionData as Quiz;
          const currentQuizPlayer = game
            .getPlayers()
            .find((p) => p.getId() === quizAction.quizPlayer.getId());

          if (!currentQuizPlayer) {
            get().actions.closeModal();
            return;
          }

          const currentQuizAction = new Quiz(
            currentQuizPlayer,
            quizAction.cardTopic,
          );
          game.resolveQuiz(currentQuizAction, success);

          const updatedGame = GameModel.fromJSON(game.toJSON());
          const updatedGameData = updatedGame.toJSON();
          set({ game: updatedGame, gameData: updatedGameData });
          get().actions.closeModal();
        },

        openDiceModal: () => set({ isDiceModalOpen: true }),

        closeModal: () =>
          set({
            isModalOpen: false,
            isDiceModalOpen: false,
            isRolling: false,
            diceResult: null,
            modalDiceResult: null,
            actionType: null,
            actionData: null,
            startPosition: undefined,
            newPosition: undefined,
            playerWhoRolled: null,
            playerWhoRolledName: null,
          }),

        resetDiceState: () =>
          set({
            isRolling: false,
            diceResult: null,
            modalDiceResult: null,
          }),

        checkSavedGame: () => {
          const { gameData } = get();
          set({ hasSavedGame: !!gameData });
        },

        setSelectedFile: (file) => set({ selectedFile: file }),

        loadFromFile: async () => {
          const { selectedFile } = get();
          if (!selectedFile) {
            throw new Error("No file selected");
          }

          return new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const jsonString = e.target?.result as string;
                const gameData = JSON.parse(jsonString);
                const loadedGame = GameModel.fromJSON(gameData);

                set({
                  game: loadedGame,
                  gameData,
                  selectedFile: null,
                });
                resolve();
              } catch (_error) {
                reject(new Error("Invalid file format"));
              }
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsText(selectedFile);
          });
        },

        restoreFromLocalStorage: () => {
          get().actions.loadGame();
        },
      },
    }),
    {
      name: "game-store",
      partialize: (state) => ({
        gameData: state.gameData,
        hasSavedGame: !!state.gameData,
      }),
    },
  ),
);

// Selectors for cleaner component usage
export const useGameState = () => useGameStore((state) => state);
export const useGameActions = () => useGameStore((state) => state.actions);
export const useGame = () => useGameStore((state) => state.game);
export const useCurrentPlayer = () => {
  const { game, playerWhoRolled, isModalOpen, isDiceModalOpen } =
    useGameStore();
  if (!game) return null;

  return playerWhoRolled && (isModalOpen || isDiceModalOpen)
    ? playerWhoRolled
    : game.getPlayers()[game.getTurn()];
};
