import fs from "node:fs";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { QuizSquare } from "@/model/square/quiz-square";
import { expect, test } from "./fixtures";
import { addZustandInitScript } from "./zustand";

const QUESTION = "Qual è la capitale d'Italia?";
const ANSWER = "Roma";

test("Domande personalizzate - il docente sostituisce il quiz e applica", async ({
  page,
}) => {
  await page.goto("/custom-decks");
  await expect(page.getByLabel("Mazzo")).toHaveValue("quiz");
  // Parte dalle carte predefinite
  await expect(page.getByLabel("Domanda 1", { exact: true })).not.toHaveValue(
    "",
  );

  await page
    .getByRole("button", { name: "Rimuovi tutte", exact: true })
    .click();
  await expect(page.getByText(/Nessuna carta/)).toBeVisible();

  // Mazzo vuoto: non si può applicare
  await page
    .getByRole("button", { name: "Applica e torna", exact: true })
    .click();
  await expect(page.locator("p[role=alert]")).toHaveText("Quiz: nessuna carta");

  await page
    .getByRole("button", { name: "Aggiungi carta", exact: true })
    .click();
  await page.getByLabel("Domanda 1", { exact: true }).fill(QUESTION);
  await page.getByLabel("Risposta 1", { exact: true }).fill(ANSWER);
  await expect(page.getByLabel("Mazzo")).toContainText(
    "Quiz (1 carta, personalizzato)",
  );
  await page
    .getByRole("button", { name: "Applica e torna", exact: true })
    .click();

  await page.waitForURL("/");
  const saved = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("game-config") ?? "{}").state.customDecks,
  );
  // Solo il mazzo cambiato: gli altri restano predefiniti
  expect(saved).toEqual({ quiz: [{ domanda: QUESTION, risposta: ANSWER }] });

  await page.getByText("Schermo singolo").click();
  await expect(page.getByText("Domande personalizzate attive")).toBeVisible();
});

test("Domande personalizzate - esporta e reimporta il file JSON", async ({
  page,
}, testInfo) => {
  await page.goto("/custom-decks");
  await page.getByLabel("Mazzo").selectOption("mime");
  await page
    .getByRole("button", { name: "Rimuovi tutte", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Aggiungi carta", exact: true })
    .click();
  await page.getByLabel("Testo 1", { exact: true }).fill("Giraffa");

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Esporta", exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("domande-imprevisti.json");
  const file = testInfo.outputPath("domande.json");
  await download.saveAs(file);
  const exported = JSON.parse(fs.readFileSync(file, "utf8"));
  expect(exported.versione).toBe(1);
  expect(exported.mimo).toEqual(["Giraffa"]);
  expect(exported.quiz.length).toBeGreaterThan(1);

  // Ripristino e reimporto il file esportato
  await page.getByRole("button", { name: "Ripristina", exact: true }).click();
  await expect(page.getByLabel("Testo 1", { exact: true })).not.toHaveValue(
    "Giraffa",
  );
  const fileInput = page.getByTestId("custom-decks-file");
  await fileInput.setInputFiles(file);
  await expect(page.getByRole("status")).toHaveText("File importato");
  await expect(page.getByLabel("Testo 1", { exact: true })).toHaveValue(
    "Giraffa",
  );

  // Un file sbagliato non cambia le carte e spiega cosa non va
  await fileInput.setInputFiles({
    name: "sbagliato.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ quiz: [{ domanda: "Ciao?" }] })),
  });
  await expect(page.locator("p[role=alert]")).toHaveText(
    "File non valido: quiz, carta 1: manca il testo della risposta",
  );
  await expect(page.getByLabel("Testo 1", { exact: true })).toHaveValue(
    "Giraffa",
  );
});

test("Domande personalizzate - porta alla carta sbagliata", async ({
  page,
}) => {
  await page.goto("/custom-decks");
  const answer = page.getByLabel("Risposta 3", { exact: true });
  await answer.fill("");
  // L'errore è su un altro mazzo: si torna al quiz
  await page.getByLabel("Mazzo").selectOption("mime");
  await page
    .getByRole("button", { name: "Applica e torna", exact: true })
    .click();

  await expect(page.getByLabel("Mazzo")).toHaveValue("quiz");
  await expect(page.locator("p[role=alert]")).toHaveText(
    "Quiz, carta 3: il testo della risposta non può essere vuoto",
  );
  await expect(answer).toBeFocused();
  await expect(answer).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByLabel("Domanda 3", { exact: true }),
  ).not.toHaveAttribute("aria-invalid");

  // Correggendo la carta l'evidenziazione sparisce
  await answer.fill("Sette");
  await expect(answer).not.toHaveAttribute("aria-invalid");
  await expect(page.locator("p[role=alert]")).toHaveCount(0);
});

test.describe("partita con domande personalizzate", () => {
  test.beforeEach(async ({ page }) => {
    const squares = Array.from({ length: 10 }, (_, i) => new QuizSquare(i));
    const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
    const game = new Game(new Board(squares, players), 6, true, "ai", {
      quiz: [{ domanda: QUESTION, risposta: ANSWER }],
    });
    await addZustandInitScript(page, game.toJSON());
  });

  test("il quiz mostra la domanda del docente", async ({ gamePage }) => {
    await gamePage.goto();
    await gamePage.playTurnButton.click();
    await gamePage.rollDiceButton.click();
    await expect(gamePage.turnResultModal).toBeVisible();
    await expect(gamePage.page.getByText(`Domanda: ${QUESTION}`)).toBeVisible();
    await gamePage.quizShowAnswerButton.click();
    await expect(gamePage.page.getByText(ANSWER)).toBeVisible();
  });
});
