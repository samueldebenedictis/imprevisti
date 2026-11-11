import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  getSoundManager,
  SoundManager,
  soundManager,
  useSoundManager,
} from "@/app/utils/sound-manager";

/** Web Audio API finta: conta gli oscillatori creati. */
class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  state = "suspended";
  currentTime = 0;
  destination = {};
  oscillators: { frequency?: number; type: string }[] = [];
  resume = vi.fn(async () => {
    this.state = "running";
  });
  constructor() {
    FakeAudioContext.instances.push(this);
  }
  createOscillator() {
    const note: { frequency?: number; type: string } = { type: "" };
    this.oscillators.push(note);
    return {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: {
        setValueAtTime: (value: number) => {
          note.frequency = value;
        },
      },
      set type(value: string) {
        note.type = value;
      },
    };
  }
  createGain() {
    return {
      connect: vi.fn(),
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    };
  }
}

const voice = (name: string, lang = "it-IT") =>
  ({ name, lang }) as SpeechSynthesisVoice;

/** Sintesi vocale finta con le voci indicate. */
function fakeSpeech(voices: SpeechSynthesisVoice[]) {
  const listeners: (() => void)[] = [];
  const speech = {
    voices,
    getVoices: vi.fn(() => speech.voices),
    addEventListener: vi.fn((_: string, fn: () => void) => listeners.push(fn)),
    cancel: vi.fn(),
    speak: vi.fn(),
    fireVoicesChanged: () => {
      for (const fn of listeners) fn();
    },
  };
  vi.stubGlobal("speechSynthesis", speech);
  return speech;
}

class FakeUtterance {
  lang = "";
  rate = 0;
  pitch = 0;
  voice: SpeechSynthesisVoice | null = null;
  constructor(public text: string) {}
}

beforeEach(() => {
  vi.useFakeTimers();
  FakeAudioContext.instances = [];
  vi.stubGlobal("AudioContext", FakeAudioContext);
  vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const lastContext = () => FakeAudioContext.instances.at(-1) as FakeAudioContext;

describe("effetti sonori", () => {
  test.each([
    ["playButtonClick", 1],
    ["playPawnMove", 1],
    ["playDiceRoll", 5],
    ["playTurnSkip", 3],
    ["playSpecialSquare", 3],
    ["playBattle", 6],
    ["playVictory", 5],
  ] as const)("%s suona %i note", async (method, notes) => {
    const manager = new SoundManager();
    await manager[method]();
    await vi.runAllTimersAsync();
    const ctx = lastContext();
    expect(ctx.oscillators).toHaveLength(notes);
    expect(ctx.resume).toHaveBeenCalled();
  });

  test("contesto già attivo: nessun resume", async () => {
    const manager = new SoundManager();
    lastContext().state = "running";
    await manager.playButtonClick();
    expect(lastContext().resume).not.toHaveBeenCalled();
    expect(lastContext().oscillators[0]).toEqual({
      frequency: 600,
      type: "sine",
    });
  });

  test("suono disattivato: nessuna nota", async () => {
    const manager = new SoundManager(() => false);
    await manager.playDiceRoll();
    await vi.runAllTimersAsync();
    expect(lastContext().oscillators).toHaveLength(0);
  });

  test("senza Web Audio non si rompe, e il contesto nasce quando arriva", async () => {
    vi.stubGlobal("AudioContext", undefined);
    const manager = new SoundManager();
    await expect(manager.playButtonClick()).resolves.toBeUndefined();
    expect(FakeAudioContext.instances).toHaveLength(0);

    vi.stubGlobal("AudioContext", FakeAudioContext);
    await manager.playButtonClick();
    expect(lastContext().oscillators).toHaveLength(1);
  });

  test("usa webkitAudioContext se manca AudioContext", async () => {
    vi.stubGlobal("AudioContext", undefined);
    vi.stubGlobal("webkitAudioContext", FakeAudioContext);
    await new SoundManager().playButtonClick();
    expect(lastContext().oscillators).toHaveLength(1);
  });

  test("errore nel creare il contesto: avviso e niente suono", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "AudioContext",
      class {
        constructor() {
          throw new Error("no audio");
        }
      },
    );
    const manager = new SoundManager();
    await manager.playButtonClick();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("scelta della voce", () => {
  const chosen = (voices: SpeechSynthesisVoice[]) => {
    const speech = fakeSpeech(voices);
    new SoundManager(undefined, () => true).speakVictory("Lucia");
    return (speech.speak.mock.calls[0][0] as FakeUtterance).voice?.name;
  };

  test("preferisce le voci naturali, poi Google, poi online", () => {
    const base = [voice("Base"), voice("English Natural", "en-US")];
    expect(
      chosen([...base, voice("Google italiano"), voice("Elsa Natural")]),
    ).toBe("Elsa Natural");
    expect(
      chosen([...base, voice("Online Isabella"), voice("Google italiano")]),
    ).toBe("Google italiano");
    expect(chosen([...base, voice("Online Isabella")])).toBe("Online Isabella");
    expect(chosen(base)).toBe("Base");
  });

  test("scarta i motori robotici, salvo se sono gli unici", () => {
    expect(chosen([voice("espeak Natural"), voice("Paola")])).toBe("Paola");
    expect(chosen([voice("espeak-ng italian")])).toBe("espeak-ng italian");
  });

  test("senza voci italiane non imposta la voce", () => {
    expect(chosen([voice("Samantha", "en-US")])).toBeUndefined();
  });

  test("aggiorna la scelta quando le voci arrivano dopo", () => {
    const speech = fakeSpeech([]);
    const manager = new SoundManager(undefined, () => true);
    speech.voices = [voice("Google italiano")];
    speech.fireVoicesChanged();
    manager.speakTurnSkip("Renzo");
    const utterance = speech.speak.mock.calls[0][0] as FakeUtterance;
    expect(utterance.voice?.name).toBe("Google italiano");
  });
});

describe("annunci vocali", () => {
  test("disattivati di default", () => {
    const speech = fakeSpeech([]);
    new SoundManager().speakVictory("Lucia");
    expect(speech.speak).not.toHaveBeenCalled();
  });

  test("testi degli annunci, in italiano", () => {
    const speech = fakeSpeech([]);
    const manager = new SoundManager(undefined, () => true);
    manager.speakDiceResult("Lucia", 3, 7);
    manager.speakDiceResult("Lucia", 2, 9, "Quiz");
    manager.speakTurnSkip("Renzo");
    manager.speakVictory("Agnese");

    const said = speech.speak.mock.calls.map(
      ([u]) => (u as FakeUtterance).text,
    );
    expect(said).toEqual([
      "Lucia ha lanciato un 3, la nuova posizione è 7",
      "Lucia ha lanciato un 2, la nuova posizione è 9, casella Quiz",
      "Renzo salta il turno",
      "Agnese ha vinto la partita!",
    ]);
    const first = speech.speak.mock.calls[0][0] as FakeUtterance;
    expect(first.lang).toBe("it-IT");
    expect(first.voice).toBeNull();
    expect(speech.cancel).toHaveBeenCalledTimes(4);
  });

  test("senza sintesi vocale non si rompe", () => {
    vi.stubGlobal("speechSynthesis", undefined);
    const manager = new SoundManager(undefined, () => true);
    expect(() => manager.speakVictory("Lucia")).not.toThrow();
  });
});

describe("impostazioni", () => {
  test("callback di suono e voce", () => {
    const manager = new SoundManager();
    expect(manager.isSoundEnabled()).toBe(true);
    expect(manager.isSpeechEnabled()).toBe(false);
    manager.setSoundEnabledCallback(() => false);
    manager.setSpeechEnabledCallback(() => true);
    expect(manager.isSoundEnabled()).toBe(false);
    expect(manager.isSpeechEnabled()).toBe(true);
  });

  test("istanza globale unica", () => {
    expect(getSoundManager()).toBe(soundManager);
    expect(useSoundManager()).toBe(soundManager);
  });
});
