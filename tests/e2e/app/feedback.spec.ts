import { expect, test } from "./fixtures";

test("Feedback form submission", async ({ page }) => {
  await page.route("**/formspree.io/f/**", async (route, request) => {
    if (request.method() === "POST") {
      // Fulfill with a success response
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, mocked: true }),
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

  await page.locator('input[name="accessibility"][value="5"]').check();
  await page.locator('input[name="digitalVsPhysical"][value="4"]').check();
  await page.locator('input[name="visualClarity"][value="5"]').check();
  await page.locator('input[name="soundComfort"][value="3"]').check();

  await page
    .getByRole("textbox", { name: "Cosa ha funzionato bene?" })
    .fill("The game mechanics were great!");
  await page
    .getByRole("textbox", { name: "Cosa è stato difficile?" })
    .fill("Sometimes the interface was confusing.");
  await page
    .getByRole("textbox", { name: "Suggerimenti per miglioramenti" })
    .fill("Add more themes.");

  // Submit form
  const responsePromise = page.waitForResponse((r) =>
    r.url().includes("formspree"),
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
  expect(responseData.success).toBe(true);
  expect(responseData.mocked).toBe(true);

  expect(requestData).toEqual({
    name: "Test User",
    ageGroup: "alunno",
    gameExperience: "digitale",
    accessibility: 5,
    digitalVsPhysical: 4,
    visualClarity: 5,
    soundComfort: 3,
    whatWorkedWell: "The game mechanics were great!",
    challenges: "Sometimes the interface was confusing.",
    suggestions: "Add more themes.",
    formVersion: 1,
  });
});
