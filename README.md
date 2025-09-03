# La Città degli Imprevisti

Questo progetto è un'applicazione web che implementa una versione digitale del gioco da tavolo "La Città degli Imprevisti".
Il gioco è stato creato e sviluppato dagli alunni dell'istituto CFPIL di Varese in collaborazione coi docenti.

La controparte digitale è sviluppata con Next.js e TypeScript.
La versione digitale del gioco permette ai giocatori di configurare una partita personalizzata con diversi tipi di caselle speciali e meccaniche di gioco interattive.

Il gioco è disponibile all'indirizzo
https://samueldebenedictis.github.io/tesi/

## Caratteristiche Principali

- **Configurazione partita**: Pagina iniziale per impostare i parametri del gioco
- **Gioco interattivo**: Pagina principale del gioco con plancia, pedine e meccaniche
- **Istruzioni**: Pagina dedicata con le regole del gioco
- **Salvataggio partite**: Sistema per salvare e caricare partite in corso

## Tecnologie Utilizzate

- **Next.js 15**: Framework React per applicazioni web
- **TypeScript**: Tipizzazione statica per JavaScript
- **Tailwind CSS**: Framework CSS per lo styling
- **Biome**: Linter e formatter per il codice
- **Vitest**: Framework di testing unitario
- **Playwright**: Testing end-to-end
- **Storybook**: Sviluppo e documentazione dei componenti UI
- **Husky**: Git hooks per qualità del codice

## Comandi Disponibili

### Sviluppo
```bash
npm run dev
```
Avvia il server di sviluppo Next.js sulla porta 3000.

### Build e Produzione
```bash
npm run build
```
Compila l'applicazione per la produzione.

```bash
npm run start
```
Avvia il server di produzione dopo aver eseguito il build sulla porta 3000.

### Testing
```bash
npm run test
```
Esegue tutti i test unitari utilizzando Vitest.

```bash
npm run coverage
```
Esegue i test unitari con report di copertura del codice.

### Testing End-to-End
```bash
npm run e2e:app
```
Esegue i test end-to-end dell'applicazione principale utilizzando Playwright.

```bash
npm run e2e:storybook
```
Esegue i test end-to-end dei componenti Storybook.

### Qualità del Codice
```bash
npm run lint
```
Esegue il linter Biome per identificare problemi di stile e qualità del codice, applicando automaticamente le correzioni.

```bash
npm run format
```
Formatta il codice utilizzando Biome per mantenere uno stile consistente.

```bash
npm run biome
```
Esegue un controllo completo del codice con Biome, applicando linting, formatting e altre regole di qualità.

### Storybook
```bash
npm run storybook
```
Avvia il server di sviluppo Storybook sulla porta 6006 per visualizzare e sviluppare i componenti UI in isolamento.

```bash
npm run build-storybook
```
Compila Storybook per la produzione, generando una versione statica della documentazione dei componenti.

### Installazione Dipendenze
```bash
npm install
```
Installa tutte le dipendenze del progetto e configura Husky per i git hooks.

## Struttura del Progetto

```
src/
├── app/                    # Pagine e componenti Next.js
│   ├── components/         # Componenti React
│   ├── game/              # Pagina principale del gioco
│   ├── instructions/      # Pagina delle istruzioni
│   └── restore-game/      # Pagina per caricare partite salvate
├── model/                 # Logica e modelli di dati
│   ├── deck/              # Sistema di carte (mimo, quiz)
│   ├── managers/          # Gestori di gioco (turni, battaglie, eccetera)
│   └── square/            # Tipi di caselle della plancia
└── tests/                 # Test automatici
    ├── e2e/               # Test end-to-end
    └── vitest/            # Test unitari
```

## Come Iniziare

1. **Clona il repository**:
   ```bash
   git clone https://github.com/samueldebenedictis/tesi.git
   cd tesi
   ```

2. **Installa le dipendenze**:
   ```bash
   npm install
   ```

3. **Avvia il server di sviluppo**:
   ```bash
   npm run dev
   ```

4. **Apri il browser** e vai su `http://localhost:3000`

## Testing

Per eseguire tutti i test:
```bash
npm run test
npm run coverage
```

Per i test end-to-end:
```bash
npm run e2e:app
```
