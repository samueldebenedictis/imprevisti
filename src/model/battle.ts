import type { Player } from "./player";

export class Battle {
  private player1: Player;
  private player2: Player;

  constructor(player1: Player, player2: Player) {
    this.player1 = player1;
    this.player2 = player2;
  }

  /**
   * Resolves the battle with the specified winner.
   * Validates that the winner is one of the two players in the battle.
   */
  resolveBattle(winner: Player): Player {
    if (winner !== this.player1 && winner !== this.player2) {
      throw new Error("Winner must be one of the players in the battle");
    }
    return winner;
  }

  /**
   * Returns both players in the battle as a tuple.
   */
  getPlayers(): [Player, Player] {
    return [this.player1, this.player2];
  }

  /**
   * Returns the opponent of the specified player.
   */
  getOpponent(player: Player): Player {
    if (player === this.player1) {
      return this.player2;
    }
    if (player === this.player2) {
      return this.player1;
    }
    throw new Error("Player is not part of this battle");
  }
}
