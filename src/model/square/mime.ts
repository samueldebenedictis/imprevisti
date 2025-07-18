import type { Card } from "../card";
import type { Player } from "../player";

export class Mime {
  /**
   * Crea una nuova istanza di Mime.
   * @param mimePlayer - Il giocatore che deve eseguire il mimo.
   * @param cardTopic - Il tema del mimo (simulato da una carta).
   */
  constructor(
    public mimePlayer: Player,
    public cardTopic: Card,
  ) {}
}

export const mimeAnimals = [
  {
    livello: "facile",
    animali: [
      { nome: "Gatto", emoji: "🐱" },
      { nome: "Cane", emoji: "🐶" },
      { nome: "Coniglio", emoji: "🐇" },
      { nome: "Mucca", emoji: "🐄" },
      { nome: "Uccello", emoji: "🐦" },
      { nome: "Pesce", emoji: "🐟" },
      { nome: "Cavallo", emoji: "🐴" },
    ],
  },
  {
    livello: "medio",
    animali: [
      { nome: "Elefante", emoji: "🐘" },
      { nome: "Leone", emoji: "🦁" },
      { nome: "Scimmia", emoji: "🐒" },
      { nome: "Delfino", emoji: "🐬" },
      { nome: "Serpente", emoji: "🐍" },
      { nome: "Pinguino", emoji: "🐧" },
      { nome: "Tartaruga", emoji: "🐢" },
    ],
  },
  {
    livello: "difficile",
    animali: [
      { nome: "Polpo", emoji: "🐙" },
      { nome: "Canguro", emoji: "🦘" },
      { nome: "Giraffa", emoji: "🦒" },
      { nome: "Pavone", emoji: "🦚" },
      { nome: "Ragno", emoji: "🕷️" },
      { nome: "Struzzo", emoji: "🐦" },
      { nome: "Ape", emoji: "🐝" },
    ],
  },
  {
    livello: "fantasia",
    animali: [
      { nome: "Drago", emoji: "🐉" },
      { nome: "Dinosauro", emoji: "🦖" },
      { nome: "Unicorno", emoji: "🦄" },
    ],
  },
];

export const mimeWorks = [
  {
    livello: "facile",
    lavori: [
      { nome: "Studente", emoji: "🧑‍🎓" },
      { nome: "Impiegato d'ufficio", emoji: "🧑‍💼" },
      { nome: "Insegnante", emoji: "🧑‍🏫" },
      { nome: "Cuoco", emoji: "🧑‍🍳" },
    ],
  },
  {
    livello: "medio",
    lavori: [
      { nome: "Contadino", emoji: "🧑‍🌾" },
      { nome: "Meccanico", emoji: "🧑‍🔧" },
      { nome: "Operaio di fabbrica", emoji: "🧑‍🏭" },
      { nome: "Scienziato", emoji: "🧑‍🔬" },
      { nome: "Programmatore", emoji: "🧑‍💻" },
    ],
  },
  {
    livello: "difficile",
    lavori: [
      { nome: "Poliziotto", emoji: "👮‍♂️" },
      { nome: "Pompieri", emoji: "👩‍🚒" },
      { nome: "Pilota", emoji: "🧑‍✈️" },
      { nome: "Astronauta", emoji: "🧑‍🚀" },
      { nome: "Giudice", emoji: "🧑‍⚖️" },
    ],
  },
  {
    livello: "fantasia",
    lavori: [
      { nome: "Ninja", emoji: "🥷" },
      { nome: "Cantante", emoji: "🧑‍🎤" },
      { nome: "Artista pittore", emoji: "🧑‍🎨" },
    ],
  },
];

export const mimeSports = [
  {
    livello: "facile",
    sport: [
      { nome: "Calcio", emoji: "⚽" },
      { nome: "Basket", emoji: "🏀" },
      { nome: "Nuoto", emoji: "🏊‍♂️" },
      { nome: "Corsa", emoji: "🏃‍♂️" },
    ],
  },
  {
    livello: "medio",
    sport: [
      { nome: "Tennis", emoji: "🎾" },
      { nome: "Boxe", emoji: "🥊" },
      { nome: "Sci", emoji: "⛷️" },
      { nome: "Pallavolo", emoji: "🏐" },
    ],
  },
  {
    livello: "difficile",
    sport: [
      { nome: "Golf", emoji: "🏌️‍♂️" },
      { nome: "Equitazione", emoji: "🏇" },
      { nome: "Scherma", emoji: "🤺" },
      { nome: "Skateboard", emoji: "🛹" },
    ],
  },
];

export const mimeObjects = [
  {
    livello: "facile",
    oggetti: [
      { nome: "Telefono", emoji: "📱" },
      { nome: "Libro", emoji: "📖" },
      { nome: "Tazza", emoji: "☕" },
      { nome: "Orologio", emoji: "⌚" },
    ],
  },
  {
    livello: "medio",
    oggetti: [
      { nome: "Macchina fotografica", emoji: "📷" },
      { nome: "Chitarra", emoji: "🎸" },
      { nome: "Ombrello", emoji: "☂️" },
      { nome: "Lente d’ingrandimento", emoji: "🔍" },
    ],
  },
  {
    livello: "difficile",
    oggetti: [
      { nome: "Trapano", emoji: "🛠️" },
      { nome: "Forbici", emoji: "✂️" },
      { nome: "Stampante", emoji: "🖨️" },
      { nome: "Joystick", emoji: "🕹️" },
    ],
  },
];
