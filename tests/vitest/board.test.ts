import { describe, expect, test } from "vitest";
import { Board } from "@/model/board";
import { Player } from "@/model/player";
import { Square } from "@/model/square/square";

describe("Board", () => {
  test("Build with squares", () => {
    const squares = [new Square(0), new Square(1)];
    const board = new Board(squares, [new Player(0, "Lucia")]);
    expect(board.getSquares()).toHaveLength(2);
  });

  test("getPlayerPosition", () => {
    const squares = [new Square(0), new Square(1)];
    const player = new Player(0, "Lucia");
    const board = new Board(squares, [player]);
    expect(board.getPlayerPosition(player)).toBe(0);
  });

  test("movePlayer", () => {
    const squares = [new Square(0), new Square(1), new Square(2)];
    const player = new Player(0, "Lucia");
    const board = new Board(squares, [player]);
    board.movePlayer(player, 2);
    expect(board.getPlayerPosition(player)).toBe(2);
  });

  test("getPlayersOnSquare", () => {
    const squares = [new Square(0), new Square(1), new Square(2)];
    const player1 = new Player(0, "Lucia");
    const player2 = new Player(1, "Renzo");
    const board = new Board(squares, [player1, player2]);
    board.movePlayer(player1, 1);
    board.movePlayer(player2, 1);
    expect(board.getPlayersOnSquare(1)).toEqual([player1, player2]);
    expect(board.getPlayersOnSquare(0)).toEqual([]);
  });

  test("toJSON", () => {
    const squares = [new Square(0), new Square(1)];
    const player = new Player(0, "Lucia");
    const board = new Board(squares, [player]);
    board.movePlayer(player, 1);
    const json = board.toJSON();
    expect(json.squares).toHaveLength(2);
    expect(json.playersPosition).toEqual([{ playerId: 0, position: 1 }]);
  });

  test("fromJSON", () => {
    const json = {
      squares: [
        { number: 0, type: "normal" as const },
        { number: 1, type: "normal" as const },
      ],
      playersPosition: [{ playerId: 0, position: 1 }],
    };
    const players = [new Player(0, "Lucia")];
    const board = Board.fromJSON(json, players);
    expect(board.getSquares()).toHaveLength(2);
    expect(board.getPlayerPosition(players[0])).toBe(1);
  });

  test("constructor with playersPositionMap", () => {
    const squares = [new Square(0), new Square(1)];
    const player = new Player(0, "Lucia");
    const playersPositionMap = new Map([[player, 1]]);
    const board = new Board(squares, [], playersPositionMap);
    expect(board.getPlayerPosition(player)).toBe(1);
  });

  test("movePlayer with new player instance", () => {
    const squares = [new Square(0), new Square(1), new Square(2)];
    const player1 = new Player(0, "Lucia");
    const board = new Board(squares, [player1]);

    // Create a new instance with same ID
    const player2 = new Player(0, "Lucia");
    board.movePlayer(player2, 2);

    expect(board.getPlayerPosition(player1)).toBe(2);
  });

  test("movePlayer throws error for non-existent player", () => {
    const squares = [new Square(0), new Square(1), new Square(2)];
    const player1 = new Player(0, "Lucia");
    const player2 = new Player(1, "Mario");

    // Create board with only player1 in the position map
    const playersPositionMap = new Map([[player1, 0]]);
    const board = new Board(squares, [player1, player2], playersPositionMap);

    // Try to move player2 who exists in players array but not in position map
    let errorMove = false;
    try {
      board.movePlayer(player2, 2);
    } catch (error) {
      errorMove = true;
      expect((error as Error).message).toBe("Not found");
    }
    expect(errorMove).toBe(true);

    let errorGet = false;
    try {
      board.getPlayerPosition(player2);
    } catch (error) {
      errorGet = true;
      expect((error as Error).message).toBe("Not found");
    }
    expect(errorGet).toBe(true);
  });

  test("fromJSON handles missing player gracefully", () => {
    const json = {
      squares: [
        { number: 0, type: "normal" as const },
        { number: 1, type: "normal" as const },
      ],
      playersPosition: [
        { playerId: 0, position: 1 },
        { playerId: 999, position: 2 }, // Player ID that doesn't exist
      ],
    };
    const players = [new Player(0, "Lucia")]; // Only player 0 exists
    const board = Board.fromJSON(json, players);

    // Should only set position for existing player
    expect(board.getPlayerPosition(players[0])).toBe(1);
    // The non-existent player position should not be set
  });
});
