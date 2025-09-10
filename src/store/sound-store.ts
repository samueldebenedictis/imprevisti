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
    }),
    {
      name: "sound-settings", // Chiave per localStorage
      // Opzioni di persistenza
      partialize: (state) => ({
        isSoundEnabled: state.isSoundEnabled,
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
