import type {
  MoveSquareJSON,
  SquareJSON,
  SquareType,
} from "@/model/square/square";

/**
 * Genera un array di caselle per l'avvio di una nuova partita.
 *
 * Questa funzione crea un tabellone di gioco con caselle normali e speciali.
 * Le caselle speciali vengono distribuite casualmente mantenendo la percentuale
 * richiesta e rispettando i tipi di caselle abilitati.
 *
 * @param numSquares - Il numero totale di caselle da generare (deve essere ≥ 3)
 * @param squareTypes - Oggetto che specifica quali tipi di caselle speciali sono abilitati
 * @param specialPercentage - Percentuale di caselle che dovrebbero essere speciali (tra 0 e 1, default 0.4)
 * @returns Array di oggetti SquareJSON rappresentante tutte le caselle del gioco
 *
 * @example
 * ```typescript
 * // Genera 20 caselle con 30% di caselle speciali (mime e quiz abilitati)
 * const squares = generateSquares(20, { mime: true, quiz: true, move: false }, 0.3);
 *
 * // Genera 15 caselle con tutte le tipologie speciali abilitate
 * const squares2 = generateSquares(15, { mime: true, quiz: true, move: true }, 0.5);
 * ```
 *
 * @throws {Error} Se numSquares è minore di 3 (serve almeno START, una casella intermedia, END)
 */
export const generateSquares = (
  numSquares: number,
  squareTypes: {
    mime: boolean;
    quiz: boolean;
    move: boolean;
    backwrite: boolean;
    "music-emotion": boolean;
    "physical-test": boolean;
    "what-would-you-do": boolean;
  },
  specialPercentage: number = 0.4,
): SquareJSON[] => {
  // Validazione input
  if (numSquares < 3) {
    throw new Error(
      "Il numero di caselle deve essere almeno 3 (START, intermedia, END)",
    );
  }

  if (specialPercentage < 0 || specialPercentage > 1) {
    throw new Error("La percentuale speciale deve essere compresa tra 0 e 1");
  }

  // Genera un array di caselle normali come base
  const squares: SquareJSON[] = Array.from(Array(numSquares).keys()).map(
    (i) => ({
      number: i,
      type: "normal" as SquareType,
    }),
  );

  const specialSquareIndices: number[] = [];

  // Prendo tutti gli indici tra la prima casella diversa da START e l'ultima diversa da END
  for (let i = 1; i < numSquares - 1; i++) {
    specialSquareIndices.push(i);
  }

  // Randomizzo gli indici
  for (let i = specialSquareIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [specialSquareIndices[i], specialSquareIndices[j]] = [
      specialSquareIndices[j],
      specialSquareIndices[i],
    ];
  }

  // Determina quali tipi di caselle speciali sono abilitati
  const enabledSpecialTypes: SquareType[] = [];
  if (squareTypes.mime) enabledSpecialTypes.push("mime");
  if (squareTypes.quiz) enabledSpecialTypes.push("quiz");
  if (squareTypes.move) enabledSpecialTypes.push("move");
  if (squareTypes.backwrite) enabledSpecialTypes.push("backwrite");
  if (squareTypes["music-emotion"]) enabledSpecialTypes.push("music-emotion");
  if (squareTypes["physical-test"]) enabledSpecialTypes.push("physical-test");
  if (squareTypes["what-would-you-do"])
    enabledSpecialTypes.push("what-would-you-do");

  // Se nessun tipo speciale è abilitato, restituisci solo caselle normali
  if (enabledSpecialTypes.length === 0) {
    return squares;
  }

  // Calcola quante caselle speciali posizionare
  const specialSquaresToPlace = Math.min(
    Math.floor(numSquares * specialPercentage),
    specialSquareIndices.length,
  );

  let currentSpecialTypeIndex = 0;
  // Fino a quando ci sono caselle speciali inseribili ciclo e creo una casella speciale
  for (
    let i = 0;
    i < specialSquaresToPlace && specialSquareIndices.length > 0;
    i++
  ) {
    const randomIndex = specialSquareIndices.pop();
    if (randomIndex === undefined) break;

    const typeToAssign =
      enabledSpecialTypes[currentSpecialTypeIndex % enabledSpecialTypes.length];

    // Se la casella è move
    if (typeToAssign === "move") {
      // Genero un valore random tra -5 e 5 (escluso lo 0)
      let moveValue = 0;
      while (moveValue === 0) {
        moveValue = Math.floor(Math.random() * 11) - 5;
      }

      squares[randomIndex] = {
        number: randomIndex,
        type: typeToAssign,
        moveValue: moveValue,
      } as MoveSquareJSON;
    } else {
      // Caselle mime o quiz standard
      squares[randomIndex] = {
        number: randomIndex,
        type: typeToAssign,
      };
    }

    currentSpecialTypeIndex++;
  }

  return squares;
};
