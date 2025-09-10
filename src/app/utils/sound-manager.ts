/**
 * Gestore audio per i feedback sonori.
 * Utilizza Web Audio API per generare suoni senza file esterni.
 */
export class SoundManager {
  private audioContext: AudioContext | null = null;

  /** Callback per ottenere lo stato del suono dal store */
  private getSoundEnabled: () => boolean;

  /**
   * Crea una nuova istanza di SoundManager.
   * Il contesto audio viene inizializzato solo lato client per evitare problemi SSR.
   * @param soundEnabledCallback - Callback per ottenere lo stato del suono dal store
   */
  constructor(soundEnabledCallback?: () => boolean) {
    this.getSoundEnabled = soundEnabledCallback || (() => true);
    if (typeof window !== "undefined") {
      this.initAudioContext();
    }
  }

  /**
   * Inizializza il contesto Web Audio API.
   * Chiamato solo lato client per evitare problemi SSR.
   * @private
   */
  private initAudioContext(): void {
    if (typeof window === "undefined") return;
    try {
      this.audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
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
   * Verifica se gli effetti sonori sono abilitati.
   */
  isSoundEnabled(): boolean {
    return this.getSoundEnabled();
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
