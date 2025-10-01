# La Città degli Imprevisti

Questo progetto è un'applicazione web che implementa una versione digitale del gioco da tavolo "La Città degli Imprevisti".
Il gioco è stato creato e sviluppato dagli alunni dell'istituto CFPIL di Varese in collaborazione coi docenti.

La versione digitale è stata sviluppata in React con Next.js e TypeScript.
Questa versione permette ai giocatori di configurare la partita in maniera personalizzata, con diversi tipi di caselle speciali (quiz, mimo, caselle di movimento) e meccaniche di gioco automatiche.

Il gioco è disponibile all'indirizzo
https://samueldebenedictis.github.io/tesi/

## Caratteristiche Principali

- **Configurazione partita**: Home per impostare i parametri del gioco; numero di giocatori, nomi, caselle ammesse, eccetera.

- **Gioco interattivo**: Pagina del gioco con tabellone, pedine e stato del gioco
- **Istruzioni**: Regole del gioco
- **Salvataggio partite**: Sistema di salvataggio e caricamento della partita (la partita viene salvata in formato JSON). Lo stato della partita è conservato nello StorageState del browser.
- **Effetti sonori**: Suoni di feedback per azioni dei giocatori (lancio dado, caselle speciali, combattimenti)
- **State management avanzato**: Utilizzo di Zustand per una gestione efficiente dello stato dell'applicazione

## Tecnologie Utilizzate

- **Next.js 15**: Framework React
- **TypeScript**: Tipizzazione per JavaScript
- **Zustand**: State management library
- **Tailwind CSS**: Framework CSS
- **Biome**: Linter e formatter
- **Vitest**: Framework per unit test
- **Playwright**: Framework per test end-to-end
- **Storybook**: Sviluppo dei componenti UI
- **Husky**: Git hooks

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
│   ├── components/        # Componenti React
│   ├── game/              # Pagina principale del gioco
│   ├── instructions/      # Pagina delle istruzioni
│   └── restore-game/      # Pagina per caricare partite salvate
├── model/                 # Logica e modelli di dati
│   ├── deck/              # Sistema di carte (mimo, quiz)
│   ├── managers/          # Gestori di gioco (turni, battaglie, eccetera)
│   └── square/            # Tipi di caselle della plancia
├── store/                 # Zustand
│   ├── config-store.ts    # Game configuration state
│   └── game-store.ts      # Game state management
├── utils/                 # Funzioni di utility
│   └── sound-manager.ts   # Audio effects manager
└── tests/                 # Test automatici
    ├── e2e/               # Test end-to-end
    └── vitest/            # Test unitari
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

3. **Dev server**:
   ```bash
   npm run dev
   ```
   goto `http://localhost:3000`

4. **Build**
   ```bash
   npm run build
   ```
