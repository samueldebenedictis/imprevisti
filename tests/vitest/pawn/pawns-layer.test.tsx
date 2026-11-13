import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import PawnsLayer from "@/app/components/pawns-layer";
import { defaultPawn } from "@/model/pawn";

vi.mock("@/app/utils/sound-manager", () => ({
  soundManager: { playPawnMove: vi.fn() },
}));

afterEach(cleanup);

const players = (names: string[]) =>
  names.map((name, i) => ({
    id: String(i),
    name,
    position: 0,
    pawn:
      i === 1 ? ({ color: "pink", shape: "hexagon" } as const) : defaultPawn(i),
  }));

const layer = (names: string[]) =>
  render(
    <PawnsLayer
      players={players(names)}
      currentPlayerId="0"
      cols={5}
      totalSquares={10}
    />,
  );

describe("pedine sulla stessa casella", () => {
  test("fino a 3: tutte, con colore e forma di ognuno", () => {
    const { container } = layer(["Luca", "Anna", "Sara"]);
    for (const name of ["Luca", "Anna", "Sara"])
      expect(screen.getByText(name)).toBeTruthy();
    expect(container.querySelector('[data-shape="hexagon"]')).toBeTruthy();
    expect(screen.queryByText(/giocatori/)).toBeNull();
  });

  test("4 o più: chi è di turno più la pedina N giocatori", () => {
    layer(["Luca", "Anna", "Sara", "Marco"]);
    expect(screen.getByText("Luca")).toBeTruthy();
    expect(screen.getByText("3 giocatori")).toBeTruthy();
    expect(screen.queryByText("Anna")).toBeNull();
  });

  test("nessuno di turno sulla casella: solo N giocatori", () => {
    render(
      <PawnsLayer
        players={players(["A", "B", "C", "D"])}
        currentPlayerId={null}
        cols={5}
        totalSquares={10}
      />,
    );
    expect(screen.getByText("4 giocatori")).toBeTruthy();
  });
});
