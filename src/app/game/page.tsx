"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Battle } from "@/model/battle";
import { Mime } from "@/model/deck/mime";
import { Quiz } from "@/model/deck/quiz";
import { Game as GameModel } from "@/model/game";
import type { Player } from "@/model/player";
import { MoveSquare } from "@/model/square";
import BoardComponent from "../components/board";
import ClientOnly from "../components/client-only";
import DiceResultModal from "../components/dice-result-modal";
import DiceRollModal from "../components/dice-roll-modal";
import LeftBar from "../components/left-bar";
import SquareC from "../components/square";
import Button from "../components/ui/button";
import { loadGameFromLocalStorage } from "../utils/game-storage";
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
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [modalDiceResult, setModalDiceResult] = useState<number | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);
  const [actionData, setActionData] = useState<Battle | Mime | Quiz | null>(
    null,
  );
  const [playerWhoRolledName, setPlayerWhoRolledName] = useState<string | null>(
    null,
  );
  const [startPosition, setStartPosition] = useState<number | undefined>();
  const [newPosition, setNewPosition] = useState<number | undefined>();
  const [_specialEffectMessage, setSpecialEffectMessage] = useState<
    string | undefined
  >();

  useEffect(() => {
    const savedGame = loadGameFromLocalStorage();
    if (savedGame) {
      try {
        const loadedGame = GameModel.fromJSON(savedGame);
        setGame(loadedGame);
      } catch (_e) {
        // Se il caricamento fallisce, il gioco è settato a null
        // e viene mostrato il button per tornare alla home
        setGame(null);
      }
    } else {
      // Se non c'è un gioco salvato, il gioco è settato a null
      // e viene mostrato il button per tornare alla home
      setGame(null);
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
    setIsDiceModalOpen(true);
  }

  const handleRollDice = () => {
    if (game) {
      setIsRolling(true);

      // Simulate dice rolling animation for 1 second
      setTimeout(() => {
        const playerWhoRolled = game.getPlayers()[game.getTurn()];
        setPlayerWhoRolledName(playerWhoRolled.getName());
        const initialPosition = game.getPlayerPosition(playerWhoRolled);
        setStartPosition(initialPosition);

        const { diceResult, actionType, data } = game.playTurn();
        setCount(counter + 1);

        const finalPosition = game.getPlayerPosition(playerWhoRolled);
        setNewPosition(finalPosition);

        setDiceResult(diceResult);
        setActionType(actionType);
        setActionData(data || null); // Set the action data

        // Serialize the current game state to JSON, then deserialize it to create a new Game instance
        const updatedGameJSON = game.toJSON();
        const updatedGame = GameModel.fromJSON(updatedGameJSON);
        setGame(updatedGame); // Set the new instance to trigger re-render and saving

        setModalDiceResult(diceResult);
        setIsRolling(false);
      }, 1000);
    }
  };

  const handleContinueAfterDice = () => {
    setIsDiceModalOpen(false);
    setIsModalOpen(true);
    setModalDiceResult(null);
  };

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

          // Resolve the battle
          game.resolveBattle(currentBattle, winnerPlayer);

          // Create a new GameModel instance
          const updatedGame = GameModel.fromJSON(game.toJSON());

          setGame(updatedGame);
          closeModal();
        } else {
          console.error(
            "Could not find current player instances for battle resolution.",
          );
          closeModal();
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

      const currentMimePlayer = game
        .getPlayers()
        .find((p) => p.getId() === mimeAction.mimePlayer.getId());

      if (!currentMimePlayer) {
        console.error("Could not find current mime player instance");
        closeModal();
        return;
      }

      const currentMimeAction = new Mime(
        currentMimePlayer,
        mimeAction.cardTopic,
      );

      game.resolveMime(currentMimeAction, success, guesserPlayer);
      const updatedGame = GameModel.fromJSON(game.toJSON());
      setGame(updatedGame);
      closeModal();
    }
  };

  const handleResolveQuiz = (success: boolean) => {
    if (game && actionData && actionType === "quiz") {
      const quizAction = actionData as Quiz;

      const currentQuizPlayer = game
        .getPlayers()
        .find((p) => p.getId() === quizAction.quizPlayer.getId());

      if (!currentQuizPlayer) {
        console.error("Could not find current quiz player instance");
        closeModal();
        return;
      }

      const currentQuizAction = new Quiz(
        currentQuizPlayer,
        quizAction.cardTopic,
      );

      game.resolveQuiz(currentQuizAction, success);
      const updatedGame = GameModel.fromJSON(game.toJSON());
      setGame(updatedGame);
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDiceResult(null);
    setActionType(null);
    setActionData(null);
    setStartPosition(undefined);
    setNewPosition(undefined);
    setSpecialEffectMessage(undefined);
  };

  const handleDeleteGame = () => {
    localStorage.removeItem(STORAGE_STATE_KEY_GAME_INSTANCE);
    localStorage.removeItem(STORAGE_STATE_KEY_DEBUG_COUNTER);
    redirect(URL_HOME);
  };

  if (!game) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <p className="ui-text-title m-4">Nessuna partita trovata.</p>
        <Button onClick={() => redirect(URL_HOME)} color="blue">
          Torna alla Home
        </Button>
      </div>
    );
  }

  const currentPlayer = game.getPlayers()[game.getTurn()];
  const playersPositions = game.getPlayers().map((player) => ({
    name: player.getName(),
    position: game.getPlayerPosition(player),
  }));

  const size = game.getBoard().getSquares().length;
  const squaresC = game
    .getBoard()
    .getSquares()
    .map((el, index) =>
      SquareC({
        number: el.getNumber(),
        squareType: el.getType(),
        moveValue: el instanceof MoveSquare ? el.moveValue : undefined, // Se è un MoveSquare gli passo il valore
        playersOn: game
          .getBoard()
          .getPlayersOnSquare(index)
          .map((player) => ({
            name: player.getName(),
            isCurrentPlayerTurn: player.getName() === currentPlayer.getName(),
          })),
        boardSize: size,
      }),
    );
  return (
    <ClientOnly>
      <div className="mt-6 flex items-center justify-center p-4">
        <div className="mx-auto flex max-w-7xl flex-row justify-center">
          <LeftBar
            currentPlayer={currentPlayer}
            playersPositions={playersPositions}
            gameEnded={game.isGameEnded()}
            winnerName={game.getWinner()?.getName()}
            onPlayTurnClick={onButtonGiocaTurnoClick}
            onDeleteGame={handleDeleteGame}
            gameInstance={game.toJSON()}
          />
          <div className="mx-auto flex flex-col items-center justify-center">
            {BoardComponent({
              squares: squaresC,
              cols: 5,
            })}
          </div>
          <DiceResultModal
            isOpen={isModalOpen}
            onClose={closeModal}
            diceResult={diceResult as number}
            actionType={actionType}
            actionData={actionData}
            onResolveBattle={handleResolveBattle}
            onResolveMime={handleResolveMime}
            onResolveQuiz={handleResolveQuiz}
            allPlayers={game.getPlayers()}
            currentPlayerName={playerWhoRolledName || ""}
            startPosition={startPosition}
            newPosition={newPosition}
            boardSize={game.getBoard().getSquares().length}
          />
          <DiceRollModal
            isOpen={isDiceModalOpen}
            onRollDice={handleRollDice}
            isRolling={isRolling}
            diceResult={modalDiceResult}
            onContinue={handleContinueAfterDice}
          />
        </div>
      </div>
    </ClientOnly>
  );
}
