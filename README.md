# La Città degli Imprevisti

Questo progetto è un'applicazione web che implementa una versione digitale del gioco da tavolo "La Città degli Imprevisti".
Il gioco è stato creato e sviluppato dagli alunni dell'istituto CFPIL di Varese in collaborazione coi docenti.

La versione digitale è stata sviluppata in React con Next.js e TypeScript.
Questa versione permette ai giocatori di configurare la partita in maniera personalizzata, con diversi tipi di caselle speciali (quiz, mimo, caselle di movimento) e meccaniche di gioco automatiche.

Supporta due modalità di gioco:
- **Schermo singolo**: tutti i giocatori attorno allo stesso dispositivo
- **Multi-dispositivo**: ogni giocatore usa il proprio smartphone, un host coordina la partita

Il gioco è disponibile ai seguenti indirizzi:

- **v1.4.6** (schermo singolo): https://samueldebenedictis.github.io/tesi/
- **v2+** (schermo singolo + multi-dispositivo): https://tesi-nine.vercel.app/

## Caratteristiche Principali

- **Configurazione partita**: Home per impostare i parametri del gioco; numero di giocatori, nomi, caselle ammesse, eccetera.
- **Gioco interattivo**: Pagina del gioco con tabellone, pedine e stato del gioco
- **Modalità multi-dispositivo**: ogni giocatore usa il proprio smartphone; l'host coordina sul tabellone principale. Accesso tramite QR code. Sessioni server-side con long polling (riduce le invocazioni serverless di ~5×). Identità giocatore persistita nell'URL (`/player/[sessionId]/[playerId]`), sopravvive alla chiusura del tab.
- **Azioni di gioco**: quiz, mimo, scrivi sulla schiena, emozione facciale, emozione musicale, test fisico, cosa faresti se, disegno dettato, battaglia
- **Istruzioni**: Regole del gioco
- **Salvataggio partite**: Sistema di salvataggio e caricamento della partita (la partita viene salvata in formato JSON). Lo stato della partita è conservato nello StorageState del browser.
- **Effetti sonori**: Suoni di feedback per azioni dei giocatori (lancio dado, caselle speciali, combattimenti)
- **State management avanzato**: Utilizzo di Zustand per una gestione efficiente dello stato dell'applicazione

## Tecnologie Utilizzate

- **Next.js 16**: Framework React
- **TypeScript**: Tipizzazione per JavaScript
- **Zustand**: State management library
- **Tailwind CSS**: Framework CSS
- **Biome**: Linter e formatter
- **Vitest**: Framework per unit test
- **Playwright**: Framework per test end-to-end
- **Storybook**: Sviluppo dei componenti UI
- **Husky**: Git hooks
- **Vercel KV** (produzione) / **Redis + ioredis** (sviluppo locale): storage sessioni multiplayer con TTL 4 ore
- **Docker Compose**: Redis locale per sviluppo

## Comandi

### Installazione
```bash
npm install
```
Installa node modules, dipendenze e configura Husky.

### Sviluppo
```bash
npm run dev
```
Avvia la dev mode sulla porta 3000.

### Build e Produzione
```bash
npm run build
```

```bash
npm run start
```

### Testing
```bash
npm run test
```
Esegue gli unit test

```bash
npm run coverage
```
Esegue gli unit test con coverage report

### Testing End-to-End
```bash
npm run e2e:app
```
Esegue i test end to end con Playwright dell'applicazione.

```bash
npm run e2e:storybook
```
Esegue i test end to end con Playwright dei componenti in Storybook.

### Qualità del Codice
```bash
npm run lint
```
Esegue il linter per identificare i problemi sulla qualità del codice.

```bash
npm run format
```
Formatta il codice.

```bash
npm run biome
```
Lint e format.

### Storybook
```bash
npm run storybook
```
Avvia Storybook sulla porta 6006.

```bash
npm run build-storybook
```
Compila Storybook per la produzione.


## Struttura

```
src/
├── app/                   # Pagine e componenti Next.js
│   ├── api/               # API routes (multiplayer)
│   │   ├── sessions/      # Crea sessione, long polling, azioni
│   │   └── feedback/      # Raccolta feedback
│   ├── components/        # Componenti React condivisi
│   ├── game/              # Pagina principale (schermo singolo)
│   ├── multiplayer/       # Host: lobby e tabellone multi-dispositivo
│   ├── player/            # Player: schermata per ogni giocatore
│   ├── join/              # Redirect join tramite QR code
│   ├── instructions/      # Pagina delle istruzioni
│   └── restore-game/      # Pagina per caricare partite salvate
├── lib/                   # Librerie condivise
│   ├── session-store.ts   # Storage sessioni (Vercel KV / Redis / memory)
│   ├── use-session-polling.ts  # Hook long polling + idle detection
│   └── card-utils.ts      # Estrazione dati carta da pending action
├── model/                 # Logica e modelli di dati
│   ├── deck/              # Sistema di carte (mimo, quiz, eccetera)
│   ├── managers/          # Gestori di gioco (turni, battaglie, eccetera)
│   └── square/            # Tipi di caselle della plancia
├── store/                 # Zustand
│   ├── config-store.ts    # Game configuration state
│   └── game-store.ts      # Game state management
├── types/
│   └── session.ts         # Tipi SessionState, PendingAction, eccetera
└── utils/                 # Funzioni di utility
    └── sound-manager.ts   # Audio effects manager
tests/
├── e2e/                   # Test end-to-end (Playwright)
└── vitest/                # Test unitari (Vitest)
    └── multiplayer/       # Test API routes e session store
```

## Installazione

1. **Clone**:
   ```bash
   git clone https://github.com/samueldebenedictis/tesi.git
   cd tesi
   ```

2. **Install**:
   ```bash
   npm install
   ```

3. **Dev server** (schermo singolo, senza Redis):
   ```bash
   npm run dev
   ```
   Apri `http://localhost:3000`

4. **Dev server con multiplayer** (richiede Docker):
   ```bash
   docker compose up -d   # avvia Redis locale
   # crea .env.local con: REDIS_URL=redis://localhost:6379
   npm run dev
   ```

5. **Build**:
   ```bash
   npm run build
   ```

### Variabili d'ambiente

| Variabile | Descrizione | Default |
|-----------|-------------|---------|
| `REDIS_URL` | URL Redis locale (sviluppo) | — (fallback in-memory) |
| `KV_REST_API_URL` | Vercel KV REST URL (produzione) | — |
| `KV_REST_API_TOKEN` | Vercel KV token (produzione) | — |
