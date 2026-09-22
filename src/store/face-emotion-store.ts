import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Interfaccia per lo stato delle impostazioni della sfida "Indovina l'emozione"
 */
interface FaceEmotionState {
  /** Indica se mostrare la gif animata (neutro -> espressione) invece della foto statica */
  isAnimated: boolean;

  /** Abilita/disabilita la gif animata */
  setAnimated: (enabled: boolean) => void;

  /** Inverte lo stato corrente */
  toggleAnimated: () => void;
}

/**
 * Store Zustand per la gestione delle impostazioni della sfida "Indovina l'emozione"
 * Utilizza persistenza per salvare la preferenza dell'utente
 */
export const useFaceEmotionStore = create<FaceEmotionState>()(
  persist(
    (set, get) => ({
      // Stato iniziale - gif animata disabilitata di default
      isAnimated: false,

      setAnimated: (enabled: boolean) => {
        set({ isAnimated: enabled });
      },

      toggleAnimated: () => {
        set({ isAnimated: !get().isAnimated });
      },
    }),
    {
      name: "face-emotion-settings", // Chiave per localStorage
      partialize: (state) => ({ isAnimated: state.isAnimated }),
    },
  ),
);
