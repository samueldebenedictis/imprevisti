# Aggiornamento progetto – v2.0.0: Modalità Multiscreen e Multiplayer

Riepilogo modifiche funzionali introdotte con l'ultimo aggiornamento del progetto (versione 2.0.0).

## 1. Modalità multiplayer multiscreen

Cambiamento principale di questa versione. È ora possibile giocare con più dispositivi collegati alla stessa partita: ogni giocatore partecipa dalla propria schermata (telefono, tablet, PC), mentre il conduttore gestisce il tabellone su uno schermo principale.

## 2. Creazione e gestione sessioni lato server

Le sessioni di gioco vengono ora create e gestite server-side tramite Redis. Ogni sessione ha un identificativo univoco e viene sincronizzata tra tutti i dispositivi connessi tramite polling. Nuove API:

- Creazione sessione (`POST /api/sessions`)
- Accesso alla sessione, lancio dadi, scelta azione, avvio partita

## 3. Accesso tramite QR Code

L'host della partita visualizza un QR Code che i giocatori possono scannerizzare per accedere direttamente alla propria schermata di gioco, senza dover inserire URL manualmente.

## 4. Schermata giocatore dedicata

Ogni giocatore ha una propria vista ottimizzata: vede il proprio turno, lancia il dado, e riceve le istruzioni per l'azione da svolgere (quiz, mimo, ecc.) in modo autonomo rispetto agli altri schermi.

## 5. Selezione modalità dalla home

La home page ora mostra una selezione esplicita tra modalità singolo schermo (classica) e multiplayer, prima di avviare la partita.

## 6. Feedback ora salvato internamente

Il sistema di raccolta feedback è stato spostato dal servizio esterno Formspree a uno storage interno (Redis), mantenendo i dati nel proprio backend.

## 7. Fix menu su mobile

Sistemato un problema di visualizzazione del menu su dispositivi mobili.
