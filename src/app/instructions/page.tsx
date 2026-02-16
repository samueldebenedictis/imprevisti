"use client";

import { useRouter } from "next/navigation";
import { MAX_PLAYERS, MIN_PLAYERS, URL_HOME } from "../../vars";
import Button from "../components/ui/button";
import { Video } from "../components/ui/video";
import { imagePrefix } from "../image-prefix";
import {
  LABEL_BACKWRITE,
  LABEL_BATTLE,
  LABEL_DICTATION_DRAW,
  LABEL_FACE_EMOTION,
  LABEL_MIME,
  LABEL_MOVE,
  LABEL_MUSIC_EMOTION,
  LABEL_PHYSICAL_TEST,
  LABEL_QUIZ,
  LABEL_WHAT_WOULD_YOU_DO,
  MODAL_SPECIAL_EFFECT_INFO_BACKWRITE,
  MODAL_SPECIAL_EFFECT_INFO_BATTLE,
  MODAL_SPECIAL_EFFECT_INFO_DICTATION_DRAW,
  MODAL_SPECIAL_EFFECT_INFO_FACE_EMOTION,
  MODAL_SPECIAL_EFFECT_INFO_MIME,
  MODAL_SPECIAL_EFFECT_INFO_MOVE,
  MODAL_SPECIAL_EFFECT_INFO_MUSIC_EMOTION,
  MODAL_SPECIAL_EFFECT_INFO_PHYSICAL_TEST,
  MODAL_SPECIAL_EFFECT_INFO_QUIZ,
  MODAL_SPECIAL_EFFECT_INFO_WHAT_WOULD_YOU_DO,
} from "../texts";

export default function InstructionsPage() {
  const router = useRouter();

  const specialEffects = [
    {
      title: LABEL_BATTLE,
      description: MODAL_SPECIAL_EFFECT_INFO_BATTLE,
    },
    {
      title: LABEL_MIME,
      description: MODAL_SPECIAL_EFFECT_INFO_MIME,
    },
    {
      title: LABEL_QUIZ,
      description: MODAL_SPECIAL_EFFECT_INFO_QUIZ,
    },
    {
      title: LABEL_BACKWRITE,
      description: MODAL_SPECIAL_EFFECT_INFO_BACKWRITE,
    },
    {
      title: LABEL_DICTATION_DRAW,
      description: MODAL_SPECIAL_EFFECT_INFO_DICTATION_DRAW,
    },
    {
      title: LABEL_MUSIC_EMOTION,
      description: MODAL_SPECIAL_EFFECT_INFO_MUSIC_EMOTION,
    },
    {
      title: LABEL_PHYSICAL_TEST,
      description: MODAL_SPECIAL_EFFECT_INFO_PHYSICAL_TEST,
    },
    {
      title: LABEL_WHAT_WOULD_YOU_DO,
      description: MODAL_SPECIAL_EFFECT_INFO_WHAT_WOULD_YOU_DO,
    },
    {
      title: LABEL_FACE_EMOTION,
      description: MODAL_SPECIAL_EFFECT_INFO_FACE_EMOTION,
    },
    {
      title: LABEL_MOVE,
      description: MODAL_SPECIAL_EFFECT_INFO_MOVE,
    },
  ];

  return (
    <div className="ui-text-dark my-8 flex flex-col items-center justify-center p-4">
      <h1 className="ui-text-title m-2">Istruzioni di gioco</h1>

      <div className="m-2 w-full max-w-4xl p-6">
        <nav className="mb-6 pb-4">
          <h2 className="mb-2 font-semibold text-xl">Indice</h2>
          <ul className="mb-2 list-inside list-disc">
            <li>
              <a
                href="#introduzione"
                className="ui-text-dark hover:text-sky-600"
              >
                Introduzione al gioco
              </a>
            </li>
            <li>
              <a
                href="#configurazione"
                className="ui-text-dark hover:text-sky-600"
              >
                Configurazione della Partita
              </a>
            </li>
            <li>
              <a href="#turno" className="ui-text-dark hover:text-sky-600">
                Svolgimento del turno
              </a>
            </li>
            <li>
              <a
                href="#caselle-speciali"
                className="ui-text-dark hover:text-sky-600"
              >
                Caselle speciali
              </a>
            </li>
            <li>
              <a
                href="#fine-partita"
                className="ui-text-dark hover:text-sky-600"
              >
                Fine della partita
              </a>
            </li>
            <li>
              <a href="#altro" className="ui-text-dark hover:text-sky-600">
                Altro
              </a>
            </li>
          </ul>
        </nav>

        <section id="introduzione" className="mb-6">
          <h2 className="mb-2 font-semibold text-xl">
            1. Introduzione al gioco
          </h2>
          <p className="mb-2">
            Benvenuti nella versione digitale del gioco da tavolo "La Città
            degli Imprevisti"!
            <br />
            Il gioco è stato realizzato dagli alunni dell'istituto CFPIL di
            Varese in collaborazione coi docenti.
            <br />
            Preparatevi a un'avventura emozionante dove strategia, fortuna e
            abilità si mescolano.
            <br />
            L'obiettivo è essere il primo giocatore a raggiungere l'ultima
            casella del tabellone.
            <br />
            Lungo il percorso, affronterete sfide, risponderete a quiz e vi
            cimenterete in divertenti mimi.
          </p>
        </section>

        <section id="configurazione" className="mb-6">
          <h2 className="mb-2 font-semibold text-xl">
            2. Configurazione della Partita
          </h2>
          <p className="mb-2">
            Prima di iniziare, configurate la vostra partita dalla schermata
            iniziale:
          </p>
          <ul className="mb-2 list-inside list-disc">
            <li>
              <strong>Numero di giocatori:</strong> scegliete da{" "}
              {`${MIN_PLAYERS}`} a {`${MAX_PLAYERS}`} giocatori.
            </li>
            <li>
              <strong>Nomi dei giocatori:</strong> inserite i nomi per ciascun
              partecipante.
            </li>
            <li>
              <strong>Numero di caselle:</strong> determinate la lunghezza del
              tabellone.
            </li>
            <li>
              <strong>Caselle speciali:</strong> decidete quali tipi di caselle
              speciali includere per aggiungere varietà al gioco.
            </li>
          </ul>
          <p className="mb-2">
            Una volta configurato, cliccate su "Inizia Gioco" per avviare la
            partita.
          </p>
          <Video
            src={`${imagePrefix}/videos/game-at-work-setup-chromium.webm`}
            text="Un video che mostra l'applicativo durante la configurazione senza caselle speciali"
          />
          <Video
            src={`${imagePrefix}/videos/game-at-work-setup-with-special-squares-chromium.webm`}
            text="Un video che mostra l'applicativo durante la configurazione con l'aggiunta di caselle speciali"
          />
        </section>

        <section id="turno" className="mb-6">
          <h2 className="mb-2 font-semibold text-xl">
            3. Svolgimento del turno
          </h2>
          <p className="mb-2">
            Il gioco procede a turni. Ogni giocatore, quando è il suo turno,
            deve:
          </p>
          <ul className="mb-2 list-inside list-disc">
            <li>Cliccare sul pulsante "Gioca un turno".</li>
            <li>
              Verrà lanciato un dado e il giocatore si sposterà del numero di
              caselle indicato.
            </li>
            <li>
              Se un giocatore deve saltare un turno (a causa di un effetto di
              una casella speciale), il suo turno verrà automaticamente saltato.
            </li>
          </ul>
          <Video
            src={`${imagePrefix}/videos/game-at-work-play-turn-chromium.webm`}
            text="Un video che mostra un giocatore giocare il proprio turno"
          />
          <Video
            src={`${imagePrefix}/videos/game-at-work-skip-turn-chromium.webm`}
            text="Un video che mostra un giocatore saltare il proprio turno"
          />
        </section>

        <section id="caselle-speciali" className="mb-6">
          <h2 className="mb-2 font-semibold text-xl">4. Caselle speciali</h2>
          <p className="mb-2">
            Il tabellone può contenere diverse tipologie di caselle speciali:
          </p>

          {specialEffects.map((effect) => (
            <div key={effect.title}>
              <h3 className="mb-1 font-bold">{effect.title}</h3>
              <p className="mb-2">{effect.description}</p>
            </div>
          ))}
        </section>

        <section id="fine-partita" className="mb-6">
          <h2 className="mb-2 font-semibold text-xl">5. Fine della partita</h2>
          <p className="mb-2">
            La partita termina quando un giocatore raggiunge l'ultima casella
            del tabellone. Quel giocatore sarà dichiarato il vincitore!
          </p>
          <Video
            src={`${imagePrefix}/videos/game-at-work-end-game-chromium.webm`}
            text="Un video che mostra l'applicativo a termine partita"
          />
        </section>
        <section id="altro" className="mb-6">
          <h2 className="mb-2 font-semibold text-xl">6. Altro</h2>
          <p className="mb-2">
            Tutto il codice sorgente del sito è disponile su{" "}
            <a
              className="font-semibold"
              href="https://github.com/samueldebenedictis/tesi"
            >
              GitHub
            </a>
          </p>
        </section>
      </div>

      <Button
        onClick={() => router.push(URL_HOME)}
        color="blue"
        className="mx-auto"
      >
        Torna alla Home
      </Button>
    </div>
  );
}
