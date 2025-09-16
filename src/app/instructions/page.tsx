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
              <strong>Caselle speciali:</strong> decidete quali tipi di caselle
              speciali includere per aggiungere varietà al gioco.
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

          <h3 className="mb-1 font-medium text-lg">Parola sulla schiena</h3>
          <p className="mb-2">
            Il giocatore dovrà scrivere una parola sulla schiena di un altro
            giocatore, se questo indovina entrambi potranno avanzare di una
            casella. Altrimenti, il giocatore che ha scritto salterà il prossimo
            turno.
          </p>

          <h3 className="mb-1 font-medium text-lg">Disegno dettato</h3>
          <p className="mb-2">
            Se un giocatore atterra su una casella "Disegno dettato", dovrà
            descrivere un'immagine a un altro giocatore che cercherà di
            disegnarla. Se il disegno è giudicato sufficientemente simile
            all'immagine originale, entrambi i giocatori potranno avanzare di
            una casella. Altrimenti, il giocatore che ha descritto salterà il
            prossimo turno.
          </p>

          <h3 className="mb-1 font-medium text-lg">Emozioni in musica</h3>
          <p className="mb-2">
            Il giocatore dovrà esprimere una specifica emozione attraverso una
            canzone. Gli altri giocatori dovranno valutare se l'emozione è
            rappresentata correttamente, in quel caso il giocatore potrà
            avanzare di una casella. Altrimenti, salterà il prossimo turno.
          </p>

          <h3 className="mb-1 font-medium text-lg">Test fisico</h3>
          <p className="mb-2">
            Il giocatore dovrà eseguire un test fisico proposto dalla carta. Se
            il test è completato con successo, il giocatore potrà avanzare di
            una casella. Altrimenti, salterà il prossimo turno.
          </p>

          <h3 className="mb-1 font-medium text-lg">Cosa faresti se...</h3>
          <p className="mb-2">
            Se un giocatore atterra su questa casella dovrà rispondere a una
            domanda ipotetica del tipo "Cosa faresti se...". Gli altri giocatori
            giudicheranno se la risposta è convincente. Se la risposta convince
            la maggioranza, il giocatore potrà avanzare di una casella.
            Altrimenti, salterà il prossimo turno.
          </p>

          <h3 className="mb-1 font-medium text-lg">Caselle movimento</h3>
          <p className="mb-2">
            Alcune caselle possono far avanzare o retrocedere il giocatore di un
            numero specifico di posizioni. Queste caselle non richiedono azioni
            particolari, ma modificano direttamente la posizione del giocatore.
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
