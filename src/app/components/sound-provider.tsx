"use client";

import { useEffect } from "react";
import { useSoundSettings } from "../../store/sound-store";
import { getSoundManager } from "../utils/sound-manager";

/**
 * Provider per inizializzare il SoundManager con il sound store.
 * Questo componente deve essere montato all'inizio nel layout
 */
export default function SoundProvider() {
  const { isSoundEnabled, isSpeechEnabled } = useSoundSettings();

  useEffect(() => {
    // Ottieni l'istanza del sound manager
    const soundManager = getSoundManager();

    // Aggiorna i callback per ottenere lo stato di suoni e annunci vocali dal store
    soundManager.setSoundEnabledCallback(() => isSoundEnabled);
    soundManager.setSpeechEnabledCallback(() => isSpeechEnabled);
  }, [isSoundEnabled, isSpeechEnabled]);

  // Questo componente non renderizza nulla
  return null;
}
