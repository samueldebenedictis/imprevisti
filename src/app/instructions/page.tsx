"use client";

import { useRouter } from "next/navigation";
import { MAX_PLAYERS, MIN_PLAYERS, URL_HOME } from "../../vars";
import Button from "../components/ui/button";

export default function InstructionsPage() {
  const router = useRouter();

  return (
    <div className="my-8 flex flex-col items-center justify-center p-4">
      <h1 className="ui-text-dark ui-text-title m-2">Istruzioni di gioco</h1>

      <div className="ui-text-dark m-2 w-full max-w-4xl p-6">
        <section className="mb-6">
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

        <section className="mb-6">
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
              <strong>Caselle speciali:</strong> decidete se includere caselle
              "Mimo" e/o "Quiz" per aggiungere varietà al gioco.
            </li>
          </ul>
          <p className="mb-2">
            Una volta configurato, cliccate su "Inizia Gioco" per avviare la
            partita.
          </p>
        </section>

        <section className="mb-6">
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
        </section>

        <section className="mb-6">
          <h2 className="mb-2 font-semibold text-xl">4. Caselle speciali</h2>
          <p className="mb-2">
            Il tabellone può contenere diverse tipologie di caselle speciali:
          </p>
          <h3 className="mb-1 font-medium text-lg">Battaglia</h3>
          <p className="mb-2">
            Se un giocatore atterra su una casella già occupata da un altro
            giocatore, si verifica una battaglia. I giocatori coinvolti dovranno
            decidere un vincitore. Il giocatore vincente potrà avanzare di una
            casella.
          </p>
          <h3 className="mb-1 font-medium text-lg">Mimo</h3>
          <p className="mb-2">
            Se un giocatore atterra su una casella Mimo, dovrà mimare una parola
            o una frase. Gli altri giocatori cercheranno di indovinare. Se
            qualcuno indovina, il giocatore che ha mimato e quello che ha
            indovinato potranno avanzare di una casella.
          </p>
          <h3 className="mb-1 font-medium text-lg">Quiz</h3>
          <p className="mb-2">
            Se un giocatore atterra su una casella Quiz, gli verrà posta una
            domanda. Se risponde correttamente, potrà avanzare di una casella.
            Se sbaglia, dovrà saltare un turno.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 font-semibold text-xl">5. Fine della partita</h2>
          <p className="mb-2">
            La partita termina quando un giocatore raggiunge l'ultima casella
            del tabellone. Quel giocatore sarà dichiarato il vincitore!
          </p>
        </section>
        <section className="mb-6">
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
