"use client";

import { useEffect, useId, useState } from "react";
import type { PawnStyle } from "@/model/pawn";
import { LABEL_PAWN_DONE, LABEL_PAWN_EDIT, LABEL_PAWN_TITLE } from "../texts";
import Pawn from "./pawn";
import PawnPicker from "./pawn-picker";
import Button from "./ui/button";

type PawnPickerButtonProps = {
  /** Nome del giocatore: anteprima e titolo della finestra. */
  name: string;
  value: PawnStyle;
  onChange: (pawn: PawnStyle) => void;
};

/**
 * Anteprima della pedina accanto al nome (schermo singolo): cliccandola si
 * apre una piccola finestra con la scelta di colore e forma.
 */
export default function PawnPickerButton({
  name,
  value,
  onChange,
}: PawnPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const trimmed = name.trim();

  // Esc chiude la finestra
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={LABEL_PAWN_EDIT(trimmed)}
        title={LABEL_PAWN_EDIT(trimmed)}
        className="w-36 shrink-0 cursor-pointer [&>div]:mb-0"
      >
        <Pawn
          name={trimmed || "?"}
          color={value.color}
          shape={value.shape}
          isCurrentPlayerTurn={false}
        />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Sfondo: un clic fuori dalla finestra la chiude */}
          <button
            type="button"
            aria-label={LABEL_PAWN_DONE}
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-black/50"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="ui-border-dark relative mx-4 w-full max-w-md bg-white p-6"
          >
            <h2 id={titleId} className="ui-text-subtitle mb-4 text-center">
              {LABEL_PAWN_TITLE(trimmed)}
            </h2>
            <PawnPicker
              centered
              showLabel={false}
              name={name}
              value={value}
              onChange={onChange}
            />
            <Button
              color="green"
              onClick={() => setOpen(false)}
              className="mx-auto mt-6"
            >
              {LABEL_PAWN_DONE}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
