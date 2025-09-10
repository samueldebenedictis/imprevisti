import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateSquares } from "@/app/utils/generate-squares";
import {
  DEFAULT_PLAYERS,
  DEFAULT_SPECIAL_PERCENTAGE_SQUARES,
  DEFAULT_SQUARES,
  MAX_PLAYERS,
  MAX_SQUARES,
  MIN_PLAYERS,
  MIN_SQUARES,
  STORAGE_STATE_KEY_GAME_INSTANCE,
} from "../vars";
import { useGameStore } from "./game-store";

export interface GameConfig {
  numPlayers: number;
  playerNames: string[];
  numSquares: number;
  squareTypes: {
    mime: boolean;
    quiz: boolean;
    move: boolean;
  };
  specialPercentage: number;
}

export interface ConfigActions {
  // Giocatori
  setNumPlayers: (num: number) => void;
  setPlayerName: (index: number, name: string) => void;
  addPlayer: () => void;
  removePlayer: (index: number) => void;

  // Partita
  setNumSquares: (num: number) => void;
  setSquareType: (
    type: keyof GameConfig["squareTypes"],
    enabled: boolean,
  ) => void;
  setSpecialPercentage: (percentage: number) => void;

  // Form
  resetConfig: () => void;
  validateConfig: () => boolean;

  // Creazione partita
  createGame: () => void;
}

type ConfigStore = GameConfig & { actions: ConfigActions };

const defaultConfig: GameConfig = {
  numPlayers: DEFAULT_PLAYERS,
  playerNames: [""],
  numSquares: DEFAULT_SQUARES,
  squareTypes: {
    mime: true,
    quiz: true,
    move: true,
  },
  specialPercentage: DEFAULT_SPECIAL_PERCENTAGE_SQUARES,
};

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      ...defaultConfig,

      actions: {
        setNumPlayers: (num) => {
          const currentNames = get().playerNames;
          const newNames = Array(num)
            .fill("")
            .map((_, i) => currentNames[i] || "");
          set({ numPlayers: num, playerNames: newNames });
        },

        setPlayerName: (index, name) => {
          const currentNames = [...get().playerNames];
          currentNames[index] = name;
          set({ playerNames: currentNames });
        },

        addPlayer: () => {
          const { numPlayers, playerNames } = get();
          if (numPlayers < MAX_PLAYERS) {
            set({
              numPlayers: numPlayers + 1,
              playerNames: [...playerNames, ""],
            });
          }
        },

        removePlayer: (index) => {
          const { numPlayers, playerNames } = get();
          if (numPlayers > MIN_PLAYERS) {
            const newNames = playerNames.filter((_, i) => i !== index);
            set({
              numPlayers: numPlayers - 1,
              playerNames: newNames,
            });
          }
        },

        setNumSquares: (num) => set({ numSquares: num }),

        setSquareType: (type, enabled) => {
          set((state) => ({
            squareTypes: {
              ...state.squareTypes,
              [type]: enabled,
            },
          }));
        },

        setSpecialPercentage: (percentage) =>
          set({ specialPercentage: percentage }),

        resetConfig: () => set(defaultConfig),

        validateConfig: () => {
          const { numPlayers, playerNames, numSquares, squareTypes } = get();

          // Controllo che tutti i giocatori abbiano nomi
          const hasValidNames = playerNames
            .slice(0, numPlayers)
            .every((name) => name.trim().length > 0);

          // Potrei controllare che almeno una tipologia di casella speciale sia selezionata
          // Per ora disattivato
          // const hasSquareTypes = Object.values(squareTypes).some(enabled => enabled);
          const hasSquareTypes = true;

          // Controllo numero giocatori e numero caselle
          const validNumPlayers =
            numPlayers >= MIN_PLAYERS && numPlayers <= MAX_PLAYERS;
          const validNumSquares =
            numSquares >= MIN_SQUARES && numSquares <= MAX_SQUARES;

          return (
            hasValidNames &&
            hasSquareTypes &&
            validNumPlayers &&
            validNumSquares
          );
        },

        createGame: () => {
          const config = get();
          if (!get().actions.validateConfig()) {
            throw new Error("Invalid game configuration");
          }

          // Creo il playerJSON
          const playersJSON = config.playerNames
            .slice(0, config.numPlayers)
            .map((name, id) => ({
              id,
              name: name.trim(),
              turnsToSkip: 0,
            }));

          // Generate le caselle
          const squareJSON = generateSquares(
            config.numSquares,
            config.squareTypes,
            config.specialPercentage / 100,
          );

          // Creo la game instance
          const gameInstance = {
            currentRound: 1,
            currentTurn: 0,
            players: playersJSON,
            winnerId: undefined,
            gameEnded: false,
            board: {
              playersPosition: playersJSON.map((player) => ({
                playerId: player.id,
                position: 0,
              })),
              squares: squareJSON,
            },
          };

          localStorage.setItem(
            STORAGE_STATE_KEY_GAME_INSTANCE,
            JSON.stringify(gameInstance),
          );

          const gameStore = useGameStore.getState();
          gameStore.actions.loadGame();
        },
      },
    }),
    {
      name: "game-config",
      partialize: (state) => ({
        numPlayers: state.numPlayers,
        playerNames: state.playerNames,
        numSquares: state.numSquares,
        squareTypes: state.squareTypes,
        specialPercentage: state.specialPercentage,
      }),
    },
  ),
);

// State managers
export const useGameConfig = () => useConfigStore((state) => state);
export const useConfigActions = () => useConfigStore((state) => state.actions);
export const useConfigValidation = () =>
  useConfigStore((state) => state.actions.validateConfig);
