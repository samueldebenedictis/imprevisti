import { expect, test } from "@playwright/test";

const TIMEOUT = 1000;

// Viewport dedicato, impostato a livello di file: il registratore video di
// Playwright alloca il canvas della registrazione in base al viewport del
// context al momento della sua creazione. Chiamare page.setViewportSize()
// dentro al test, a context già creato, ridimensiona solo la pagina: il
// video continua a usare le dimensioni originali (il default del progetto,
// 1280x720) e Chromium comprime/letterboxa il contenuto più grande dentro
// quel canvas, producendo bande nere e un tabellone rimpicciolito.
//
// Il riquadro dell'educatore è più largo di quello del giocatore: il
// tabellone (~1900px per stare comodamente su schermo) ha bisogno di molto
// più spazio orizzontale di una vista in stile smartphone. Senza esplicitare
// "size", Playwright dimezza automaticamente risoluzioni grandi (es.
// 1600x860 → 800x430), rendendo tutto minuscolo: qui la forziamo alla stessa
// risoluzione del viewport per una registrazione a piena definizione.
const VIEWPORT = { width: 2400, height: 1000 };
test.use({ viewport: VIEWPORT, video: { mode: "on", size: VIEWPORT } });

// Video dimostrativo della modalità multi-dispositivo: mostra in un unico
// filmato lo schermo dell'educatore (tabellone) e lo schermo del giocatore
// (smartphone) affiancati, sincronizzati tramite il polling reale dell'app.
// Sessione, giocatori e tabellone sono creati con chiamate reali alle API
// (non mock) cosicché l'intera interazione — lancio del dado, comparsa della
// sfida su entrambi gli schermi, risoluzione da parte dell'host — sia
// autentica.
test("management", async ({ page, request }) => {
  const created = await request.post("/api/sessions");
  const { sessionId, hostToken } = await created.json();

  await request.post(`/api/sessions/${sessionId}/join`, {
    data: { playerName: "Luca" },
  });
  await request.post(`/api/sessions/${sessionId}/join`, {
    data: { playerName: "Marco" },
  });

  // Tabellone breve in cui ogni casella intermedia è "Quiz": qualunque tiro
  // di dado (1-6) fa atterrare il giocatore su una sfida, garantendo un
  // esito deterministico per la registrazione.
  const numSquares = 8;
  const customSquares = Array.from({ length: numSquares }, (_, i) => ({
    number: i,
    type: i === 0 || i === numSquares - 1 ? "normal" : "quiz",
  }));

  await request.post(`/api/sessions/${sessionId}/start`, {
    data: { hostToken, boardConfig: { numSquares, customSquares } },
  });

  // L'hostToken deve trovarsi nel localStorage di ciascun frame della pagina
  // harness: addInitScript viene eseguito in ogni frame (compreso l'iframe
  // dell'host) prima che React monti.
  await page.addInitScript((token) => {
    try {
      window.localStorage.setItem("hostToken", token as string);
    } catch {}
  }, hostToken);

  // Harness con due iframe affiancati: schermo dell'educatore + schermo del
  // giocatore attivo (Luca, id "0" — primo ad essersi unito).
  //
  // La pagina harness viene servita dallo STESSO origin dell'app (via
  // page.route, non page.setContent/about:blank): se il documento di primo
  // livello avesse un origin diverso dagli iframe, Chromium instraderebbe
  // gli iframe in un renderer separato (out-of-process iframe) che lo
  // screencast usato da Playwright per registrare il video non cattura,
  // risultando in riquadri neri nel filmato.
  const harnessPath = "/__game-at-work-dual-screen-harness";
  await page.route(`**${harnessPath}`, async (route) => {
    await route.fulfill({
      contentType: "text/html",
      body: `<!doctype html>
<html>
<head>
<style>
  html,body{margin:0;height:100%;background:#f1f5f9;font-family:system-ui,sans-serif}
  .row{display:flex;height:100%}
  .col{display:flex;flex-direction:column;min-width:0}
  .col.host{flex:0 0 1845px}
  .col.player{flex:0 0 550px;border-left:2px solid #cbd5e1}
  h3{color:#334155;text-align:center;margin:0;padding:6px;font-size:14px;background:#e2e8f0}
  iframe{flex:1;border:0;width:100%}
</style>
</head>
<body>
  <div class="row">
    <div class="col host">
      <h3>Schermo dell'educatore (tabellone)</h3>
      <iframe name="host" src="/multiplayer/${sessionId}"></iframe>
    </div>
    <div class="col player">
      <h3>Schermo del giocatore (smartphone di Luca)</h3>
      <iframe name="player" src="/player/${sessionId}/0"></iframe>
    </div>
  </div>
</body>
</html>`,
    });
  });
  await page.goto(harnessPath);

  const host = page.frameLocator('iframe[name="host"]');
  const player = page.frameLocator('iframe[name="player"]');

  await expect(host.getByText("Luca").first()).toBeVisible();
  await expect(
    player.getByRole("button", { name: "Lancia il dado" }),
  ).toBeVisible();
  await page.waitForTimeout(2 * TIMEOUT);

  // Il giocatore lancia il dado dal proprio smartphone...
  await player.getByRole("button", { name: "Lancia il dado" }).click();
  await page.waitForTimeout(TIMEOUT);

  // ...la sfida compare in sincrono su entrambi gli schermi (polling ~1.5s).
  await expect(host.getByText("Quiz").first()).toBeVisible({ timeout: 5000 });
  await expect(player.getByText("Quiz").first()).toBeVisible({
    timeout: 5000,
  });
  await page.waitForTimeout(2 * TIMEOUT);

  // L'educatore rivela la risposta corretta solo sul proprio schermo...
  await host
    .getByRole("button", { name: /Mostra risposta|Mostra soluzione/ })
    .click();
  await page.waitForTimeout(2 * TIMEOUT);

  // ...e giudica la prova dal tabellone: l'esito si propaga subito sullo
  // smartphone del giocatore.
  await host.getByRole("button", { name: "Riuscito", exact: true }).click();
  await page.waitForTimeout(2 * TIMEOUT);
});
