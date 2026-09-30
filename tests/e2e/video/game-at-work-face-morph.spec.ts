import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { FaceEmotionSquare } from "@/model/square/face-emotion-square";
import { expect, test } from "../app/fixtures";
import { GamePage } from "../app/pages/game-page";
import { addZustandInitScript } from "../app/zustand";

const TIMEOUT = 1500;
// Durata di un ciclo della gif di morphing (41 frame, ~3.3s)
const GIF_LOOP = 3300;

const VIEWPORT = { width: 1280, height: 720 };
test.use({ viewport: VIEWPORT, video: { mode: "on", size: VIEWPORT } });

// Video dimostrativo del morphing del volto nella sfida "Indovina l'emozione".
// Per mostrare sempre la stessa carta (004_o_m_h_a: uomo anziano, felicità)
// Math.random viene sostituito da una sequenza strettamente decrescente: in
// Deck.shuffle la prima carta riceve il valore più alto, finisce in fondo
// all'array ordinato e viene quindi pescata per prima da draw(). Il dado,
// con valori vicini a 1, restituisce 6.
test("face emotion", async ({ page }) => {
  const gamePage = new GamePage(page);

  await page.addInitScript(() => {
    let n = 0;
    Math.random = () => 0.999 - n++ * 1e-9;
  });

  const squares = Array.from(
    { length: 12 },
    (_, i) => new FaceEmotionSquare(i),
  );
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const game = new Game(new Board(squares, players));
  await addZustandInitScript(page, game.toJSON());

  await gamePage.goto();
  await page.waitForTimeout(2 * TIMEOUT);

  await gamePage.playTurnButton.click();
  await page.waitForTimeout(TIMEOUT);
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultModal).toBeVisible();
  const image = page.getByRole("img", { name: "felicità" });
  await expect(image).toHaveAttribute("src", /004_o_m_h_a/);
  await page.waitForTimeout(2 * TIMEOUT);

  // Passaggio da foto statica a gif animata
  await page.locator("label[for='face-emotion-animated-toggle']").click();
  await expect(image).toHaveAttribute("src", /004_o_m_h_a_morph/);
  await page.waitForTimeout(2 * GIF_LOOP);

  await gamePage.faceEmotionShowAnswerButton.click();
  await page.waitForTimeout(2 * TIMEOUT);
  await gamePage.faceEmotionCorrectButton.click();
  await page.waitForTimeout(2 * TIMEOUT);
});
