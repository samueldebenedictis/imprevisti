import type React from "react";
import type { Battle } from "@/model/battle";
import type { Player } from "@/model/player";
import { MODAL_BATTLE_TITLE, MODAL_BATTLE_WINNER_SELECTION } from "../../texts";
import Button from "../ui/button";
import { H3 } from "./h3";

interface BattleResultProps {
  actionData: Battle;
  onResolveBattle?: (winnerId: number) => void;
  onClose: () => void;
  allPlayers: Player[];
}

const BattleResult: React.FC<BattleResultProps> = ({
  actionData,
  onResolveBattle,
  onClose,
  allPlayers,
}) => {
  const handleWinnerSelection = (winnerId: number) => {
    if (onResolveBattle) {
      onResolveBattle(winnerId);
    }
    onClose();
  };

  return (
    <div className="mt-4">
      <H3>{MODAL_BATTLE_TITLE}</H3>
      <p className="m-1 text-xl">{MODAL_BATTLE_WINNER_SELECTION}</p>
      <div className="flex justify-center space-x-4">
        {actionData.getPlayers().map((oldPlayer: Player) => {
          const currentPlayer = allPlayers.find(
            (p) => p.getId() === oldPlayer.getId(),
          );
          return currentPlayer ? (
            <Button
              key={currentPlayer.getId()}
              onClick={() => handleWinnerSelection(currentPlayer.getId())}
              color="red"
            >
              {currentPlayer.getName()}
            </Button>
          ) : null;
        })}
      </div>
    </div>
  );
};

export default BattleResult;
