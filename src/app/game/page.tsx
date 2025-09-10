"use client";

import { redirect } from "next/navigation";
import { useEffect, useMemo } from "react";
import { MoveSquare } from "@/model/square";
import { useCurrentPlayer, useGameStore } from "../../store/game-store";
import { URL_HOME } from "../../vars";
import BoardComponent from "../components/board";
import ClientOnly from "../components/client-only";
import LeftBar from "../components/left-bar";
import SquareC from "../components/square";
import DiceResultModal from "../components/turn-result-modal";
import Button from "../components/ui/button";

export default function Page() {
  // Game state store
  const game = useGameStore((state) => state.game);
  const actions = useGameStore((state) => state.actions);

  // UI state store
  const isModalOpen = useGameStore((state) => state.isModalOpen);
  const isDiceModalOpen = useGameStore((state) => state.isDiceModalOpen);
  const isRolling = useGameStore((state) => state.isRolling);
  const diceResult = useGameStore((state) => state.diceResult);
  const modalDiceResult = useGameStore((state) => state.modalDiceResult);
  const actionType = useGameStore((state) => state.actionType);
  const actionData = useGameStore((state) => state.actionData);
  const playerWhoRolledName = useGameStore(
    (state) => state.playerWhoRolledName,
  );
  const startPosition = useGameStore((state) => state.startPosition);
  const newPosition = useGameStore((state) => state.newPosition);

  // Player state store
  const currentPlayer = useCurrentPlayer();

  // Effects
  useEffect(() => {
    actions.loadGame();
  }, [actions]);

  const handleDeleteGame = () => {
    actions.deleteGame();
    redirect(URL_HOME);
  };

  // Memoize posizioni dei giocatori
  const playersPositions = useMemo(
    () =>
      game
        ? game.getPlayers().map((player) => ({
            name: player.getName(),
            position: game.getPlayerPosition(player),
          }))
        : [],
    [game],
  );

  const size = game ? game.getBoard().getSquares().length : 0;

  const squaresC = useMemo(
    () =>
      game
        ? game
            .getBoard()
            .getSquares()
            .map((el, index) =>
              SquareC({
                number: el.getNumber(),
                squareType: el.getType(),
                moveValue: el instanceof MoveSquare ? el.moveValue : undefined,
                playersOn: game
                  .getBoard()
                  .getPlayersOnSquare(index)
                  .map((player) => ({
                    name: player.getName(),
                    isCurrentPlayerTurn:
                      player.getName() === currentPlayer?.getName(),
                  })),
                boardSize: size,
                isMoving: isRolling,
              }),
            )
        : [],
    [game, size, isRolling, currentPlayer?.getName],
  );

  // Render del gioco
  if (!game) {
    return (
      <ClientOnly>
        <div className="flex h-96 flex-col items-center justify-center">
          <p className="ui-text-title m-4">Nessuna partita trovata.</p>
          <Button onClick={() => redirect(URL_HOME)} color="blue">
            Torna alla Home
          </Button>
        </div>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <div className="mt-6 flex items-start justify-center gap-8 p-4">
        <div className="sticky top-30 flex-shrink-0 self-start">
          <LeftBar
            currentPlayer={currentPlayer!}
            playersPositions={playersPositions}
            gameEnded={game.isGameEnded()}
            winnerName={game.getWinner()?.getName()}
            onPlayTurnClick={actions.openDiceModal}
            onDeleteGame={handleDeleteGame}
            gameInstance={game.toJSON()}
            showDiceRoll={isDiceModalOpen}
            diceRollProps={{
              onRollDice: actions.playTurn,
              isRolling,
              diceResult: modalDiceResult,
              onContinue: actions.continueAfterDice,
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
          onClose={actions.closeModal}
          diceResult={diceResult as number}
          actionType={actionType}
          actionData={actionData}
          onResolveBattle={actions.resolveBattle}
          onResolveMime={actions.resolveMime}
          onResolveQuiz={actions.resolveQuiz}
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
