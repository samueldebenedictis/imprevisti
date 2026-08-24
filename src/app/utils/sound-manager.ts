/**
 * Gestore audio per i feedback sonori.
 * Utilizza Web Audio API per generare suoni senza file esterni.
 */
export class SoundManager {
  private audioContext: AudioContext | null = null;

  /** Callback per ottenere lo stato del suono dal store */
  private getSoundEnabled: () => boolean;

  /** Callback per ottenere lo stato degli annunci vocali dal store */
  private getSpeechEnabled: () => boolean;

  /** Voce italiana di qualità selezionata per la sintesi vocale */
  private preferredVoice: SpeechSynthesisVoice | null = null;

  /**
   * Crea una nuova istanza di SoundManager.
   * Il contesto audio viene inizializzato solo lato client per evitare problemi SSR.
   * @param soundEnabledCallback - Callback per ottenere lo stato del suono dal store
   * @param speechEnabledCallback - Callback per ottenere lo stato degli annunci vocali dal store
   */
  constructor(
    soundEnabledCallback?: () => boolean,
    speechEnabledCallback?: () => boolean,
  ) {
    this.getSoundEnabled = soundEnabledCallback || (() => true);
    this.getSpeechEnabled = speechEnabledCallback || (() => false);
    if (typeof window !== "undefined") {
      this.initAudioContext();
      this.initPreferredVoice();
    }
  }

  /**
   * Seleziona la miglior voce italiana disponibile (es. Google/Natural),
   * evitando la voce robotica di default del sistema.
   * Le voci si caricano in modo asincrono su alcuni browser, quindi si
   * ascolta anche l'evento "voiceschanged".
   * @private
   */
  private initPreferredVoice(): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const italianVoices = voices.filter((v) => v.lang.startsWith("it"));

      // Scarta motori robotici noti (es. espeak su Linux, spesso duplicati a migliaia)
      const decentVoices = italianVoices.filter(
        (v) => !/espeak|mbrola|festival|pico/i.test(v.name),
      );
      const pool = decentVoices.length > 0 ? decentVoices : italianVoices;

      this.preferredVoice =
        pool.find((v) => /natural/i.test(v.name)) ||
        pool.find((v) => /google/i.test(v.name)) ||
        pool.find((v) => /online/i.test(v.name)) ||
        pool[0] ||
        null;
    };

    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
  }

  /**
   * Inizializza il contesto Web Audio API.
   * Chiamato solo lato client per evitare problemi SSR.
   * @private
   */
  private initAudioContext(): void {
    if (typeof window === "undefined") return;
    try {
      // Type assertion for legacy webkitAudioContext support
      const AudioContextClass =
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    } catch (error) {
      console.warn("Web Audio API not supportato:", error);
    }
  }

  /**
   * Assicura che il contesto audio sia disponibile.
   * Inizializza il contesto se necessario, lo riprende se sospeso.
   * @private
   */
  private async ensureAudioContext(): Promise<void> {
    if (typeof window === "undefined") return;
    if (!this.audioContext) {
      this.initAudioContext();
    }
    if (this.audioContext?.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  /**
   * Genera e riproduce un tono semplice utilizzando Web Audio API.
   * @param frequency - La frequenza del tono in Hz
   * @param duration - La durata del tono in secondi
   * @param type - Il tipo di oscillatore (sine, square, sawtooth, triangle)
   * @private
   */
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
  ): void {
    if (!this.getSoundEnabled() || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime,
    );
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration,
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * Riproduce l'effetto sonoro del clic del pulsante.
   */
  async playButtonClick(): Promise<void> {
    await this.ensureAudioContext();
    this.playTone(600, 0.1, "sine");
  }

  /**
   * Riproduce l'effetto sonoro del balzo della pedina tra due caselle.
   */
  async playPawnMove(): Promise<void> {
    await this.ensureAudioContext();
    this.playTone(500, 0.08, "triangle");
  }

  /**
   * Riproduce l'effetto sonoro del lancio del dado.
   */
  async playDiceRoll(): Promise<void> {
    await this.ensureAudioContext();
    const frequencies = [400, 500, 600, 500, 400];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, "sine");
      }, index * 100);
    });
  }

  /**
   * Riproduce l'effetto sonoro del salto turno.
   */
  async playTurnSkip(): Promise<void> {
    await this.ensureAudioContext();
    setTimeout(() => this.playTone(300, 0.3, "sawtooth"), 0);
    setTimeout(() => this.playTone(250, 0.3, "sawtooth"), 150);
    setTimeout(() => this.playTone(200, 0.3, "sawtooth"), 300);
  }

  /**
   * Riproduce l'effetto sonoro dell'attivazione casella speciale.
   */
  async playSpecialSquare(): Promise<void> {
    await this.ensureAudioContext();
    setTimeout(() => this.playTone(600, 0.2, "triangle"), 0);
    setTimeout(() => this.playTone(700, 0.2, "triangle"), 100);
    setTimeout(() => this.playTone(800, 0.2, "triangle"), 200);
  }

  /**
   * Riproduce l'effetto sonoro della battaglia.
   */
  async playBattle(): Promise<void> {
    await this.ensureAudioContext();
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.playTone(400 + (i % 2) * 200, 0.1, "square");
      }, i * 80);
    }
  }

  /**
   * Riproduce un effetto sonoro per lavittoria.
   */
  async playVictory(): Promise<void> {
    await this.ensureAudioContext();
    const frequencies = [500, 600, 700, 800, 900];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, "triangle");
      }, index * 150);
    });
  }

  /**
   * Sintetizza e riproduce un testo tramite Web Speech API,
   * usando la voce italiana preferita se disponibile.
   * @private
   */
  private speak(text: string): void {
    if (!this.getSpeechEnabled()) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "it-IT";
    utterance.rate = 1;
    utterance.pitch = 1;
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Annuncia vocalmente esito del turno tramite sintesi vocale.
   * @param playerName - Nome del giocatore che ha lanciato il dado
   * @param diceResult - Il numero uscito dal dado (1-6)
   * @param newPosition - La nuova posizione del giocatore sul tabellone
   * @param squareLabel - Nome della casella speciale su cui è finito il giocatore (es. "Quiz"), se presente
   */
  speakDiceResult(
    playerName: string,
    diceResult: number,
    newPosition: number,
    squareLabel: string | null = null,
  ): void {
    this.speak(
      `${playerName} ha lanciato un ${diceResult}, la nuova posizione è ${newPosition}${
        squareLabel ? `, casella ${squareLabel}` : ""
      }`,
    );
  }

  /**
   * Annuncia vocalmente il salto turno di un giocatore.
   * @param playerName - Nome del giocatore che salta il turno
   */
  speakTurnSkip(playerName: string): void {
    this.speak(`${playerName} salta il turno`);
  }

  /**
   * Annuncia vocalmente la vittoria di un giocatore.
   * @param winnerName - Nome del giocatore vincitore
   */
  speakVictory(winnerName: string): void {
    this.speak(`${winnerName} ha vinto la partita!`);
  }

  /**
   * Verifica se gli effetti sonori sono abilitati.
   */
  isSoundEnabled(): boolean {
    return this.getSoundEnabled();
  }

  /**
   * Aggiorna il callback per ottenere lo stato del suono.
   * @param callback - Nuovo callback per ottenere lo stato del suono
   */
  setSoundEnabledCallback(callback: () => boolean): void {
    this.getSoundEnabled = callback;
  }

  /**
   * Verifica se gli annunci vocali sono abilitati.
   */
  isSpeechEnabled(): boolean {
    return this.getSpeechEnabled();
  }

  /**
   * Aggiorna il callback per ottenere lo stato degli annunci vocali.
   * @param callback - Nuovo callback per ottenere lo stato degli annunci vocali
   */
  setSpeechEnabledCallback(callback: () => boolean): void {
    this.getSpeechEnabled = callback;
  }
}

/**
 * Crea un'istanza del SoundManager che utilizza il sound store.
 * Questa funzione viene chiamata quando il sound store è disponibile.
 */
let soundManagerInstance: SoundManager | null = null;

/**
 * Ottiene l'istanza globale del gestore audio.
 * Se non esiste, ne crea una nuova che utilizza il sound store.
 */
export const getSoundManager = (): SoundManager => {
  if (!soundManagerInstance) {
    soundManagerInstance = new SoundManager(() => true);
  }
  return soundManagerInstance;
};

/** Istanza globale del gestore audio per l'intera applicazione */
export const soundManager = getSoundManager();

/**
 * Hook React per accedere al gestore audio globale.
 *
 * @returns L'istanza globale di SoundManager
 *
 * @example
 * ```typescript
 * const MioComponente = () => {
 *   const suono = useSoundManager();
 *
 *   const gestisciClick = () => {
 *     suono.playButtonClick();
 *   };
 *
 *   return <button onClick={gestisciClick}>Cliccami!</button>;
 * };
 * ```
 */
export const useSoundManager = () => {
  return soundManager;
};
