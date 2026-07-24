import { version as appVersion } from "../../../package.json";
import { expect, test } from "./fixtures";

test("Feedback form submission", async ({ page }) => {
  await page.route("**/api/feedback", async (route, request) => {
    if (request.method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, mocked: true }),
      });
    } else {
      await route.continue();
    }
  });

  await page.goto("/feedback");
  await expect(page.getByRole("heading", { name: "Feedback" })).toBeVisible();

  // Fill form
  await page.getByRole("textbox", { name: "Nome *" }).fill("Test User");

  const selectElements = page.locator("select");
  await selectElements.nth(0).selectOption("alunno");
  await selectElements.nth(1).selectOption("digitale");

  // Questionario SUS (10 affermazioni)
  for (let i = 1; i <= 10; i++) {
    await page.locator(`input[name="sus${i}"][value="4"]`).check();
  }

  // Valutazioni
  await page.locator('input[name="digitalVsPhysical"][value="4"]').check();
  await page.locator('input[name="gameplayClarity"][value="5"]').check();
  await page.locator('input[name="graphics"][value="5"]').check();
  await page.locator('input[name="enjoyment"][value="5"]').check();
  await page.locator('input[name="funLevel"][value="4"]').check();

  await page
    .getByRole("textbox", { name: "Cosa ha funzionato bene?" })
    .fill("The game mechanics were great!");
  await page
    .getByRole("textbox", { name: "Cosa ha funzionato male?" })
    .fill("Sometimes the interface was confusing.");
  await page
    .getByRole("textbox", { name: "Suggerimenti per miglioramenti" })
    .fill("Add more themes.");

  // Submit form
  const responsePromise = page.waitForResponse((r) =>
    r.url().includes("/api/feedback"),
  );
  await page.getByRole("button", { name: "Invia" }).click();
  const response = await responsePromise;
  const requestData = response.request().postDataJSON();
  const responseData = await response.json();

  // Wait for success
  await expect(
    page.getByRole("heading", { name: "Grazie per il feedback!" }),
  ).toBeVisible();
  await expect(
    page.getByText("Il tuo messaggio è stato inviato con successo."),
  ).toBeVisible();

  expect(requestData).not.toBeNull();
  expect(response.request().method()).toBe("POST");
  expect(responseData.ok).toBe(true);
  expect(responseData.mocked).toBe(true);

  expect(requestData).toEqual({
    name: "Test User",
    ageGroup: "alunno",
    gameExperience: "digitale",
    appVersion,
    digitalVsPhysical: 4,
    gameplayClarity: 5,
    graphics: 5,
    enjoyment: 5,
    funLevel: 4,
    sus1: 4,
    sus2: 4,
    sus3: 4,
    sus4: 4,
    sus5: 4,
    sus6: 4,
    sus7: 4,
    sus8: 4,
    sus9: 4,
    sus10: 4,
    whatWorkedWell: "The game mechanics were great!",
    challenges: "Sometimes the interface was confusing.",
    suggestions: "Add more themes.",
  });
});

test("Feedback form submission without optional digitalVsPhysical rating", async ({
  page,
}) => {
  await page.route("**/api/feedback", async (route, request) => {
    if (request.method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, mocked: true }),
      });
    } else {
      await route.continue();
    }
  });

  await page.goto("/feedback");

  await page.getByRole("textbox", { name: "Nome *" }).fill("Test User");

  const selectElements = page.locator("select");
  await selectElements.nth(0).selectOption("docente");
  await selectElements.nth(1).selectOption("fisico");

  for (let i = 1; i <= 10; i++) {
    await page.locator(`input[name="sus${i}"][value="3"]`).check();
  }

  await page.locator('input[name="gameplayClarity"][value="3"]').check();
  await page.locator('input[name="graphics"][value="3"]').check();
  await page.locator('input[name="enjoyment"][value="3"]').check();
  await page.locator('input[name="funLevel"][value="3"]').check();

  const responsePromise = page.waitForResponse((r) =>
    r.url().includes("/api/feedback"),
  );
  await page.getByRole("button", { name: "Invia" }).click();
  const response = await responsePromise;
  const requestData = response.request().postDataJSON();

  await expect(
    page.getByRole("heading", { name: "Grazie per il feedback!" }),
  ).toBeVisible();

  expect(requestData.digitalVsPhysical).toBeUndefined();
});
