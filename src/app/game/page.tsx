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
import LeftBar from "../components/left-bar";
import SquareC from "../components/square";
import DiceResultModal from "../components/turn-result-modal";
import Button from "../components/ui/button";
import { loadGameFromLocalStorage } from "../utils/game-storage";
import {
  STORAGE_STATE_KEY_DEBUG_COUNTER,
  STORAGE_STATE_KEY_GAME_INSTANCE,
  URL_HOME,
} from "../vars";

// Forza la rivalutazione
export default function Page() {
  const [game, setGame] = useState<GameModel | null>(null);
  const [counter, _setCount] = useState(0);
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
  const [playerWhoRolled, setPlayerWhoRolled] = useState<Player | null>(null);
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
      // Salva il giocatore corrente PRIMA di chiamare playTurn()
      const currentPlayerBeforeRoll = game.getPlayers()[game.getTurn()];
      const positionBeforeRoll = game.getPlayerPosition(
        currentPlayerBeforeRoll,
      );
      setPlayerWhoRolled(currentPlayerBeforeRoll);
      setPlayerWhoRolledName(currentPlayerBeforeRoll.getName());

      // Ottieni il risultato del dado prima per controllare il salto turno
      const { diceResult, actionType, data } = game.playTurn();

      // Se il risultato del dado è 0 (salto turno), gestisci immediatamente senza animazione
      if (diceResult === 0) {
        const initialPosition = game.getPlayerPosition(currentPlayerBeforeRoll);
        setStartPosition(initialPosition);
        setNewPosition(initialPosition); // Nessun movimento per salto turno

        setDiceResult(diceResult);
        setActionType(actionType);
        setActionData(data || null);

        // Serializza lo stato di gioco corrente in JSON, poi deserializza per creare una nuova istanza Game
        const updatedGameJSON = game.toJSON();
        const updatedGame = GameModel.fromJSON(updatedGameJSON);
        setGame(updatedGame);

        setModalDiceResult(diceResult);
        setIsRolling(false);
        return; // Salta la logica di animazione e modale
      }

      // Per lanci normali, mostra animazione
      setIsRolling(true);

      // Simula animazione di lancio dado per 1 secondo
      setTimeout(() => {
        setStartPosition(positionBeforeRoll);

        const finalPosition = game.getPlayerPosition(currentPlayerBeforeRoll);
        setNewPosition(finalPosition);

        setDiceResult(diceResult);
        setActionType(actionType);
        setActionData(data || null); // Imposta i dati dell'azione

        // Serializza lo stato di gioco corrente in JSON, poi deserializza per creare una nuova istanza Game
        const updatedGameJSON = game.toJSON();
        const updatedGame = GameModel.fromJSON(updatedGameJSON);
        setGame(updatedGame); // Imposta la nuova istanza per attivare il re-render e il salvataggio

        setModalDiceResult(diceResult);
        setIsRolling(false);

        // Controlla se dobbiamo mostrare il modale immediatamente (per effetti speciali, azioni o caselle speciali)
        const hasSpecialEffectNow = () => {
          if (
            finalPosition !== undefined &&
            positionBeforeRoll !== undefined &&
            diceResult !== null &&
            diceResult > 0 &&
            game
          ) {
            const normalPosition = Math.min(
              Math.max(0, positionBeforeRoll + diceResult),
              game.getBoard().getSquares().length - 1,
            );
            return finalPosition !== normalPosition;
          }
          return false;
        };

        if (hasSpecialEffectNow() || actionType) {
          setIsModalOpen(true);
        }
      }, 1000);
    }
  };

  const handleContinueAfterDice = () => {
    setIsDiceModalOpen(false);
    setModalDiceResult(null);
    setPlayerWhoRolled(null); // Cancella il giocatore memorizzato
    setPlayerWhoRolledName(null);
    // Per caselle normali, non mostriamo modale, solo chiudiamo l'interfaccia dado
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

  const _hasSpecialEffect = () => {
    if (
      newPosition !== undefined &&
      startPosition !== undefined &&
      diceResult !== null &&
      diceResult > 0 && // Only check for special effects on actual moves
      game
    ) {
      const normalPosition = Math.min(
        Math.max(0, startPosition + diceResult),
        game.getBoard().getSquares().length - 1,
      );
      const isSpecial = newPosition !== normalPosition;
      console.log("Special effect check:", {
        startPosition,
        diceResult,
        normalPosition,
        newPosition,
        isSpecial,
      });
      return isSpecial;
    }
    return false;
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDiceModalOpen(false); // Close dice interface to show main button
    setIsRolling(false); // Reset rolling state
    setDiceResult(null);
    setModalDiceResult(null); // Reset modal dice result
    setActionType(null);
    setActionData(null);
    setStartPosition(undefined); // Reset position states
    setNewPosition(undefined); // Reset position states
    setSpecialEffectMessage(undefined);
    setPlayerWhoRolled(null); // Clear the stored player
    setPlayerWhoRolledName(null);
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

  // Use the player who rolled the dice during dice result display, otherwise use game's current turn
  const currentPlayer =
    playerWhoRolled && (isModalOpen || isDiceModalOpen)
      ? playerWhoRolled
      : game.getPlayers()[game.getTurn()];
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
        isMoving: isRolling, // I pawn si muovono durante il rolling del dado
      }),
    );
  return (
    <ClientOnly>
      <div className="mt-6 flex items-start justify-center gap-8 p-4">
        <div className="sticky top-30 flex-shrink-0 self-start">
          <LeftBar
            currentPlayer={currentPlayer}
            playersPositions={playersPositions}
            gameEnded={game.isGameEnded()}
            winnerName={game.getWinner()?.getName()}
            onPlayTurnClick={onButtonGiocaTurnoClick}
            onDeleteGame={handleDeleteGame}
            gameInstance={game.toJSON()}
            showDiceRoll={isDiceModalOpen}
            diceRollProps={{
              onRollDice: handleRollDice,
              isRolling,
              diceResult: modalDiceResult,
              onContinue: handleContinueAfterDice,
              currentPlayerName: playerWhoRolledName || "",
            }}
          />
        </div>
        <div className="flex flex-shrink-0 flex-col items-center justify-center">
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
      </div>
    </ClientOnly>
  );
}
