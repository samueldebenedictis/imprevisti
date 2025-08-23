"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Battle } from "@/model/battle";
import type { Mime } from "@/model/deck/mime";
import type { Quiz } from "@/model/deck/quiz";
import { Game as GameModel } from "@/model/game";
import type { Player } from "@/model/player";
import BoardComponent from "../components/board";
import ClientOnly from "../components/client-only";
import DiceResultModal from "../components/dice-result-modal";
import SquareC from "../components/square";
import {
  STORAGE_STATE_KEY_DEBUG_COUNTER,
  STORAGE_STATE_KEY_GAME_INSTANCE,
  URL_HOME,
} from "../vars";

// Forcing re-evaluation
export default function Page() {
  const [game, setGame] = useState<GameModel | null>(null);
  const [counter, setCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);
  const [actionData, setActionData] = useState<Battle | Mime | Quiz | null>(
    null,
  );

  useEffect(() => {
    const savedGame = localStorage.getItem(STORAGE_STATE_KEY_GAME_INSTANCE);
    if (savedGame) {
      try {
        const parsedGame = JSON.parse(savedGame);
        const loadedGame = GameModel.fromJSON(parsedGame);
        setGame(loadedGame);
      } catch (_e) {
        // Se il caricamento fallisce, inizia una nuova partita
        // console.error("Failed to load game from localStorage", e);
        redirect(URL_HOME);
      }
    } else {
      // Se non c'è un gioco salvato, inizia una nuova partita
      // console.error("Failed to load game from localStorage");
      redirect(URL_HOME);
    }
  }, []); // Esegui solo al mount del componente

  useEffect(() => {
    if (game) {
      localStorage.setItem(
        STORAGE_STATE_KEY_GAME_INSTANCE,
        JSON.stringify(game),
      );
      localStorage.setItem(STORAGE_STATE_KEY_DEBUG_COUNTER, `${counter}`);
    }
  }, [game, counter]); // Salva il gioco e il counter ogni volta che cambiano

  function onButtonGiocaTurnoClick() {
    if (game) {
      const { diceResult, actionType, data } = game.playTurn();
      setCount(counter + 1);

      setDiceResult(diceResult);
      setActionType(actionType);
      setActionData(data || null); // Set the action data
      setIsModalOpen(true);

      // Serialize the current game state to JSON, then deserialize it to create a new Game instance
      const updatedGameJSON = game.toJSON();
      const updatedGame = GameModel.fromJSON(updatedGameJSON);
      setGame(updatedGame); // Set the new instance to trigger re-render and saving
    }
  }

  const handleResolveBattle = (winnerId: number) => {
    if (game && actionData && actionType === "battle") {
      const winnerPlayer = game
        .getPlayers()
        .find((p) => p.getId() === winnerId);
      if (winnerPlayer) {
        // Get the IDs of the players from the old battle object
        const [oldPlayer1, oldPlayer2] = (actionData as Battle).getPlayers();
        const player1Id = oldPlayer1.getId();
        const player2Id = oldPlayer2.getId();

        // Find the corresponding current Player instances from the game state
        const currentPlayer1 = game
          .getPlayers()
          .find((p) => p.getId() === player1Id);
        const currentPlayer2 = game
          .getPlayers()
          .find((p) => p.getId() === player2Id);

        if (currentPlayer1 && currentPlayer2) {
          // Create a new Battle object with the current Player instances
          const currentBattle = new Battle(currentPlayer1, currentPlayer2);

          // Resolve the battle on the current game instance with the new Battle object
          game.resolveBattle(currentBattle, winnerPlayer);

          // After resolving, create a new GameModel instance from the *modified* game state
          // This ensures React detects the state change and re-renders
          const updatedGame = GameModel.fromJSON(game.toJSON());

          setGame(updatedGame);
          closeModal();
        } else {
          console.error(
            "Could not find current player instances for battle resolution.",
          );
          closeModal(); // Close modal even if players not found to avoid stuck state
        }
      }
    }
  };

  const handleResolveMime = (success: boolean, guesserId?: number) => {
    if (game && actionData && actionType === "mime") {
      const mimeAction = actionData as Mime;
      let guesserPlayer: Player | undefined;
      if (guesserId !== undefined) {
        guesserPlayer = game.getPlayers().find((p) => p.getId() === guesserId);
      }
      game.resolveMime(mimeAction, success, guesserPlayer);
      const updatedGame = GameModel.fromJSON(game.toJSON());
      setGame(updatedGame);
      closeModal();
    }
  };

  const handleResolveQuiz = (success: boolean) => {
    if (game && actionData && actionType === "quiz") {
      const quizAction = actionData as Quiz;
      game.resolveQuiz(quizAction, success);
      const updatedGame = GameModel.fromJSON(game.toJSON());
      setGame(updatedGame);
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDiceResult(null);
    setActionType(null);
    setActionData(null); // Reset action data when closing modal
  };

  if (!game) {
    return <div>Caricamento gioco...</div>; // O uno spinner di caricamento
  }

  const size = game.getBoard().getSquares().length;
  const squaresC = game
    .getBoard()
    .getSquares()
    .map((el, index) =>
      SquareC({
        number: el.getNumber(),
        squareType: "normal",
        playersOn: game
          .getBoard()
          .getPlayersOnSquare(index)
          .map((el) => el.getName()),
        boardSize: size,
      }),
    );
  return (
    <ClientOnly>
      <div>
        <div>
          <button
            type="button"
            onClick={() => {
              // setPlayed(played + 1);
              onButtonGiocaTurnoClick();
            }}
            className="flex h-12 w-full rounded-full bg-black justify-center items-center font-bold text-xl text-yellow-100"
          >
            Gioca un turno
          </button>
        </div>
        <div className="mx-auto items-center flex flex-col justify-center">
          {BoardComponent({
            squares: squaresC,
            cols: 5,
          })}
        </div>
        <DiceResultModal
          isOpen={isModalOpen}
          onClose={closeModal}
          diceResult={diceResult}
          actionType={actionType}
          actionData={actionData}
          onResolveBattle={handleResolveBattle}
          onResolveMime={handleResolveMime}
          onResolveQuiz={handleResolveQuiz}
          allPlayers={game.getPlayers()}
        />
      </div>
    </ClientOnly>
  );
}
