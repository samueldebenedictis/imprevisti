import { useEffect, useState } from "react";

interface DiceProps {
  isRolling: boolean;
  result?: number | null;
}

// Configurazioni facce dado
const diceFaces = [
  { number: 1, dots: [4] },
  { number: 2, dots: [0, 8] },
  { number: 3, dots: [0, 4, 8] },
  { number: 4, dots: [0, 2, 6, 8] },
  { number: 5, dots: [0, 2, 4, 6, 8] },
  { number: 6, dots: [0, 2, 3, 5, 6, 8] },
];

export default function Dice({ isRolling, result }: DiceProps) {
  const [currentFace, setCurrentFace] = useState(0);

  useEffect(() => {
    if (isRolling) {
      // Roll
      const interval = setInterval(() => {
        setCurrentFace(Math.floor(Math.random() * 6));
      }, 100);

      return () => clearInterval(interval);
    } else {
      if (result && result >= 1 && result <= 6) {
        setCurrentFace(result - 1);
      }
    }
  }, [isRolling, result]);

  return (
    <div className="dice-container">
      <div className={`dice ${isRolling ? "rolling" : ""}`}>
        {diceFaces.map((face, index) => (
          <div
            key={face.number}
            className={`dice-face dice-face-${index + 1} ${
              currentFace === index ? "active" : ""
            }`}
          >
            <div className="dice-dots">
              {Array.from({ length: 9 }, (_, i) => (
                <div
                  key={`face-${face.number}-dot-${i}`}
                  className={`dot ${face.dots.includes(i) ? "filled" : ""}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
