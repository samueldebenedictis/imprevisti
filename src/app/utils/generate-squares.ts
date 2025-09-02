import type {
  MoveSquareJSON,
  SquareJSON,
  SquareType,
} from "@/model/square/square";

// Funzione per generare le caselle all'avvio della partita
// Percentuale di caselle speciali (deve essere comprese tra 0 e 1)

const SPECIAL_PERCENTAGE = 0.4;

export const generateSquares = (
  numSquares: number,
  squareTypes: { mime: boolean; quiz: boolean; move: boolean },
): SquareJSON[] => {
  // Genera un array di caselle normali
  const squares: SquareJSON[] = Array.from(Array(numSquares).keys()).map(
    (i) => ({
      number: i,
      type: "normal",
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

  // Controllo le caselle speciali consentite
  const enabledSpecialTypes: string[] = [];
  if (squareTypes.mime) enabledSpecialTypes.push("mime");
  if (squareTypes.quiz) enabledSpecialTypes.push("quiz");
  if (squareTypes.move) enabledSpecialTypes.push("move");

  if (enabledSpecialTypes.length === 0) {
    return squares;
  }

  // Calcolo le caselle speciali da generare
  const specialSquaresToPlace = Math.min(
    Math.floor(numSquares * SPECIAL_PERCENTAGE),
    specialSquareIndices.length,
  );

  let currentSpecialTypeIndex = 0;
  // Fino a quando ci sono caselle speciali inseribili ciclo e creo una casella speciale
  for (let i = 0; i < specialSquaresToPlace; i++) {
    if (specialSquareIndices.length === 0) break;

    const randomIndex = specialSquareIndices.pop() || 0;
    const typeToAssign: SquareType = enabledSpecialTypes[
      currentSpecialTypeIndex % enabledSpecialTypes.length
    ] as SquareType;

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
      squares[randomIndex] = { number: randomIndex, type: typeToAssign };
    }

    currentSpecialTypeIndex++;
  }

  return squares;
};
