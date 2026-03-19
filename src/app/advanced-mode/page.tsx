"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SquareJSON } from "../../model/square/square";
import { useConfigStore } from "../../store/config-store";
import { URL_HOME } from "../../vars";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import { Label } from "../components/ui/label";
import Select from "../components/ui/select";
import {
  LABEL_ADVANCED_MODE,
  LABEL_ADVANCED_MODE_APPLY,
  LABEL_ADVANCED_MODE_CANCEL,
  LABEL_ADVANCED_MODE_DESCRIPTION,
  LABEL_ADVANCED_MODE_RESET,
  LABEL_BACKWRITE,
  LABEL_DICTATION_DRAW,
  LABEL_FACE_EMOTION,
  LABEL_MIME,
  LABEL_MOVE_VALUE,
  LABEL_MUSIC_EMOTION,
  LABEL_PHYSICAL_TEST,
  LABEL_QUIZ,
  LABEL_SQUARE_MOVE,
  LABEL_SQUARE_NORMAL,
  LABEL_WHAT_WOULD_YOU_DO,
} from "../texts";

const squareTypeOptions = [
  { value: "normal", label: LABEL_SQUARE_NORMAL },
  { value: "move", label: LABEL_SQUARE_MOVE },
  { value: "mime", label: LABEL_MIME },
  { value: "quiz", label: LABEL_QUIZ },
  { value: "backwrite", label: LABEL_BACKWRITE },
  { value: "face-emotion", label: LABEL_FACE_EMOTION },
  { value: "music-emotion", label: LABEL_MUSIC_EMOTION },
  { value: "physical-test", label: LABEL_PHYSICAL_TEST },
  { value: "what-would-you-do", label: LABEL_WHAT_WOULD_YOU_DO },
  { value: "dictation-draw", label: LABEL_DICTATION_DRAW },
];

const typeBadgeColor: Record<string, string> = {
  normal: "bg-sky-500",
  mime: "bg-purple-500",
  quiz: "bg-amber-500",
  backwrite: "bg-orange-500",
  "face-emotion": "bg-violet-500",
  "music-emotion": "bg-pink-500",
  "physical-test": "bg-cyan-500",
  "what-would-you-do": "bg-lime-500",
  "dictation-draw": "bg-indigo-500",
  "move-positive": "bg-green-500",
  "move-negative": "bg-red-500",
};

function badgeColor(sq: SquareJSON): string {
  if (sq.type === "move") {
    return sq.moveValue !== undefined && sq.moveValue > 0
      ? typeBadgeColor["move-positive"]
      : typeBadgeColor["move-negative"];
  }
  return typeBadgeColor[sq.type] ?? "bg-gray-500";
}

function makeDefaultSquares(n: number): SquareJSON[] {
  return Array.from({ length: n }, (_, i) => ({
    number: i,
    type: "normal" as const,
  }));
}

export default function AdvancedMode() {
  const router = useRouter();
  const numSquares = useConfigStore((state) => state.numSquares);
  const customSquares = useConfigStore((state) => state.customSquares);
  const actions = useConfigStore((state) => state.actions);

  const [squares, setSquares] = useState<SquareJSON[]>(() => {
    if (customSquares && customSquares.length === numSquares) {
      return customSquares;
    }
    return makeDefaultSquares(numSquares);
  });

  useEffect(() => {
    setSquares((prev) => {
      if (prev.length === numSquares) return prev;
      if (customSquares && customSquares.length === numSquares)
        return customSquares;
      return makeDefaultSquares(numSquares);
    });
  }, [numSquares, customSquares]);

  const updateType = (index: number, type: string) => {
    setSquares((prev) => {
      const next = [...prev];
      if (type === "move") {
        next[index] = { number: index, type: "move", moveValue: 1 };
      } else {
        next[index] = { number: index, type: type as SquareJSON["type"] };
      }
      return next;
    });
  };

  const updateMoveValue = (index: number, raw: string) => {
    let val = parseInt(raw);
    if (Number.isNaN(val)) val = 1;
    if (val === 0) val = 1;
    if (val > 5) val = 5;
    if (val < -5) val = -5;
    setSquares((prev) => {
      const next = [...prev];
      next[index] = { number: index, type: "move", moveValue: val };
      return next;
    });
  };

  const handleApply = () => {
    actions.setCustomSquares(squares);
    router.push(URL_HOME);
  };

  const handleCancel = () => {
    router.push(URL_HOME);
  };

  const handleReset = () => {
    setSquares(makeDefaultSquares(numSquares));
  };

  return (
    <div className="ui-text-dark my-8 flex flex-col items-center justify-center p-2">
      <h1 className="ui-text-title m-2">{LABEL_ADVANCED_MODE}</h1>
      <p className="ui-text-normal mb-6 max-w-md text-center">
        {LABEL_ADVANCED_MODE_DESCRIPTION}
      </p>

      <div className="w-full max-w-2xl">
        <div className="ui-border-dark mb-4 max-h-[60vh] overflow-y-auto">
          {squares.map((sq, index) => {
            const isFirst = index === 0;
            const isLast = index === numSquares - 1;
            const isLocked = isFirst || isLast;
            const badge = badgeColor(sq);

            return (
              <div
                key={`square-${sq.number}`}
                className={`flex items-center gap-3 border-gray-200 border-b p-2 ${
                  isLocked ? "bg-teal-50" : "bg-white"
                }`}
              >
                {/* Badge numero con colore tipo */}
                <div
                  className={`ui-border-dark ui-text-light flex h-10 w-10 flex-shrink-0 items-center justify-center font-bold ${badge}`}
                >
                  <span className="ui-text-normal">{index}</span>
                </div>

                {isLocked ? (
                  <span className="ui-text-subtitle flex-1 text-teal-700">
                    {isFirst ? "START" : "FINE"}
                  </span>
                ) : (
                  <>
                    <div className="flex-1">
                      <Select
                        value={sq.type}
                        onChange={(e) => updateType(index, e.target.value)}
                        options={squareTypeOptions}
                      />
                    </div>

                    {sq.type === "move" && (
                      <div className="flex w-36 flex-shrink-0 items-center gap-1">
                        <Label htmlFor={`mv-${index}`}>
                          {LABEL_MOVE_VALUE}
                        </Label>
                        <Input
                          id={`mv-${index}`}
                          type="number"
                          value={sq.moveValue ?? 1}
                          min="-5"
                          max="5"
                          onChange={(e) =>
                            updateMoveValue(index, e.target.value)
                          }
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center">
          <Button color="red" onClick={handleReset}>
            {LABEL_ADVANCED_MODE_RESET}
          </Button>
          <Button color="green" onClick={handleApply}>
            {LABEL_ADVANCED_MODE_APPLY}
          </Button>
          <Button onClick={handleCancel}>{LABEL_ADVANCED_MODE_CANCEL}</Button>
        </div>
      </div>
    </div>
  );
}
