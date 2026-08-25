import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Interfaccia per lo stato del suono
 */
interface SoundState {
  /** Indica se gli effetti sonori sono abilitati */
  isSoundEnabled: boolean;

  /** Abilita/disabilita gli effetti sonori */
  setSoundEnabled: (enabled: boolean) => void;

  /** Inverte lo stato degli effetti sonori */
  toggleSound: () => void;

  /** Indica se gli annunci vocali (sintesi vocale) sono abilitati */
  isSpeechEnabled: boolean;

  /** Abilita/disabilita gli annunci vocali */
  setSpeechEnabled: (enabled: boolean) => void;

  /** Inverte lo stato degli annunci vocali */
  toggleSpeech: () => void;
}

/**
 * Store Zustand per la gestione delle impostazioni audio
 * Utilizza persistenza per salvare le preferenze dell'utente
 */
export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      // Stato iniziale - suono abilitato di default
      isSoundEnabled: true,

      // Setter per abilitare/disabilitare il suono
      setSoundEnabled: (enabled: boolean) => {
        set({ isSoundEnabled: enabled });
      },

      // Toggle per invertire lo stato corrente
      toggleSound: () => {
        const currentState = get().isSoundEnabled;
        set({ isSoundEnabled: !currentState });
      },

      // Stato iniziale - annunci vocali disabilitati di default
      isSpeechEnabled: false,

      // Setter per abilitare/disabilitare gli annunci vocali
      setSpeechEnabled: (enabled: boolean) => {
        set({ isSpeechEnabled: enabled });
      },

      // Toggle per invertire lo stato corrente
      toggleSpeech: () => {
        const currentState = get().isSpeechEnabled;
        set({ isSpeechEnabled: !currentState });
      },
    }),
    {
      name: "sound-settings", // Chiave per localStorage
      // Opzioni di persistenza
      partialize: (state) => ({
        isSoundEnabled: state.isSoundEnabled,
        isSpeechEnabled: state.isSpeechEnabled,
      }),
    },
  ),
);

/**
 * Hook per accedere facilmente alle impostazioni audio
 * @returns L'istanza del sound store
 */
export const useSoundSettings = () => {
  return useSoundStore();
};
