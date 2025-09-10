"use client";

import { useEffect } from "react";
import { useSoundSettings } from "../../store/sound-store";
import { getSoundManager } from "../utils/sound-manager";

/**
 * Provider per inizializzare il SoundManager con il sound store.
 * Questo componente deve essere montato all'inizio nel layout
 */
export default function SoundProvider() {
  const { isSoundEnabled } = useSoundSettings();

  useEffect(() => {
    // Ottieni l'istanza del sound manager
    const soundManager = getSoundManager();

    // Aggiorna il callback per ottenere lo stato del suono dal store
    (soundManager as any).getSoundEnabled = () => isSoundEnabled;
  }, [isSoundEnabled]);

  // Questo componente non renderizza nulla
  return null;
}
