import type {
  MoveSquareJSON,
  SquareJSON,
  SquareType,
} from "@/model/square/square";
import { EMOTION_VIDEO_ENABLED, FACE_EMOTION_ENABLED } from "@/vars";

/** Tipi di caselle speciali che si possono spuntare nella configurazione. */
export interface SpecialSquareTypes {
  mime: boolean;
  quiz: boolean;
  move: boolean;
  backwrite: boolean;
  "face-emotion": boolean;
  "emotion-video": boolean;
  "music-emotion": boolean;
  "physical-test": boolean;
  "what-would-you-do": boolean;
  "dictation-draw": boolean;
}

/** Tipi di caselle speciali abilitati (le sfide spente dai flag sono escluse). */
export function getEnabledSpecialTypes(
  squareTypes: SpecialSquareTypes,
): SquareType[] {
  const enabled: SquareType[] = [];
  if (squareTypes.mime) enabled.push("mime");
  if (squareTypes.quiz) enabled.push("quiz");
  if (squareTypes.move) enabled.push("move");
  if (squareTypes.backwrite) enabled.push("backwrite");
  if (squareTypes["face-emotion"] && FACE_EMOTION_ENABLED)
    enabled.push("face-emotion");
  if (squareTypes["emotion-video"] && EMOTION_VIDEO_ENABLED)
    enabled.push("emotion-video");
  if (squareTypes["music-emotion"]) enabled.push("music-emotion");
  if (squareTypes["physical-test"]) enabled.push("physical-test");
  if (squareTypes["what-would-you-do"]) enabled.push("what-would-you-do");
  if (squareTypes["dictation-draw"]) enabled.push("dictation-draw");
  return enabled;
}

/**
 * Quante caselle speciali avrà il tabellone generato: la percentuale delle
 * caselle, arrotondata per difetto, senza contare START e fine. Zero se non
 * c'è nessun tipo di casella speciale abilitato.
 */
export function countSpecialSquares(
  numSquares: number,
  squareTypes: SpecialSquareTypes,
  specialPercentage: number,
): number {
  if (getEnabledSpecialTypes(squareTypes).length === 0) return 0;
  return specialSquaresForPercentage(numSquares, specialPercentage);
}

/** Caselle disponibili per le sfide: tutte tranne START e fine. */
export const maxSpecialSquares = (numSquares: number) =>
  Number.isFinite(numSquares) && numSquares >= 3 ? numSquares - 2 : 0;

/**
 * Caselle speciali per una percentuale, arrotondate per difetto. Il margine
 * evita che una percentuale calcolata da un numero (es. 6 / 30) dia 5,999…
 */
export const specialSquaresForPercentage = (
  numSquares: number,
  specialPercentage: number,
) => {
  const max = maxSpecialSquares(numSquares);
  if (max === 0) return 0;
  return Math.min(Math.floor(numSquares * specialPercentage + 1e-9), max);
};

/** Percentuale (0–100) che dà esattamente `count` caselle speciali. */
export const percentageForSpecialSquares = (
  numSquares: number,
  count: number,
) => (numSquares > 0 ? (count / numSquares) * 100 : 0);

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
  squareTypes: SpecialSquareTypes,
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

  const enabledSpecialTypes = getEnabledSpecialTypes(squareTypes);

  // Se nessun tipo speciale è abilitato, restituisci solo caselle normali
  if (enabledSpecialTypes.length === 0) {
    return squares;
  }

  const specialSquaresToPlace = countSpecialSquares(
    numSquares,
    squareTypes,
    specialPercentage,
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
