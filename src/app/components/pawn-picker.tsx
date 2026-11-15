"use client";

import { useId } from "react";
import {
  PAWN_COLORS,
  PAWN_SHAPES,
  type PawnColor,
  type PawnShape,
  type PawnStyle,
} from "@/model/pawn";
import {
  LABEL_PAWN,
  LABEL_PAWN_COLOR,
  LABEL_PAWN_SHAPE,
  PAWN_COLOR_NAMES,
  PAWN_SHAPE_NAMES,
} from "../texts";
import Pawn from "./pawn";
import { colorToCss } from "./ui/color";

type PawnPickerProps = {
  /** Nome del giocatore, mostrato nell'anteprima. */
  name: string;
  value: PawnStyle;
  onChange: (pawn: PawnStyle) => void;
  /** Tutto centrato (pagina del telefono, finestra di scelta). */
  centered?: boolean;
  /** Mostra l'etichetta "Pedina:" (nella finestra c'è già il titolo). */
  showLabel?: boolean;
};

/** Scelta di colore e forma della pedina (radio native), con anteprima. */
export default function PawnPicker({
  name,
  value,
  onChange,
  centered = false,
  showLabel = true,
}: PawnPickerProps) {
  const id = useId();
  const setColor = (color: PawnColor) => onChange({ ...value, color });
  const setShape = (shape: PawnShape) => onChange({ ...value, shape });
  const justify = centered ? "justify-center" : "";

  return (
    <div className="mt-2">
      {showLabel && (
        <p
          className={`ui-text-dark ui-text-subtitle mb-1 ${centered ? "text-center" : ""}`}
        >
          {LABEL_PAWN}
        </p>
      )}
      <div className={`flex flex-wrap items-center gap-x-4 gap-y-3 ${justify}`}>
        <fieldset className={`flex flex-wrap gap-2 ${justify}`}>
          <legend className="sr-only">{LABEL_PAWN_COLOR}</legend>
          {PAWN_COLORS.map((color) => (
            <label key={color} title={PAWN_COLOR_NAMES[color]}>
              <input
                type="radio"
                name={`${id}-color`}
                value={color}
                checked={value.color === color}
                onChange={() => setColor(color)}
                aria-label={PAWN_COLOR_NAMES[color]}
                className="peer sr-only"
              />
              <span
                className={`block h-7 w-7 cursor-pointer rounded-full border-2 border-gray-800 peer-checked:ring-2 peer-checked:ring-gray-800 peer-checked:ring-offset-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 ${colorToCss(color)}`}
              />
            </label>
          ))}
        </fieldset>

        <fieldset className={`flex flex-wrap items-end gap-2 ${justify}`}>
          <legend className="sr-only">{LABEL_PAWN_SHAPE}</legend>
          {PAWN_SHAPES.map((shape) => (
            <label key={shape} title={PAWN_SHAPE_NAMES[shape]}>
              <input
                type="radio"
                name={`${id}-shape`}
                value={shape}
                checked={value.shape === shape}
                onChange={() => setShape(shape)}
                aria-label={PAWN_SHAPE_NAMES[shape]}
                className="peer sr-only"
              />
              <span className="block w-12 cursor-pointer p-1 peer-checked:bg-gray-200 peer-checked:ring-2 peer-checked:ring-gray-800 peer-focus-visible:outline-2">
                {/* Miniatura grigia: il colore si vede nell'anteprima. zoom (non
                    scale) riduce anche lo spazio occupato */}
                <div style={{ zoom: 0.8 }}>
                  <Pawn
                    name=" "
                    color="gray"
                    shape={shape}
                    isCurrentPlayerTurn={false}
                  />
                </div>
              </span>
            </label>
          ))}
        </fieldset>

        {/* Anteprima con il nome del giocatore */}
        <div className="w-32" aria-hidden="true">
          <Pawn
            name={name.trim() || "?"}
            color={value.color}
            shape={value.shape}
            isCurrentPlayerTurn={false}
          />
        </div>
      </div>
    </div>
  );
}
