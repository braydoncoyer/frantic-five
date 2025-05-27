import React from "react";
import useGameStore from "../store/useGameStore";

const Keyboard: React.FC = () => {
  const {
    handleKeyPress,
    handleBackspace,
    handleSubmit,
    getFilledPositions,
    isGameWon,
    disabledLetters,
  } = useGameStore();

  // Keyboard layout
  const keyboard: string[][] = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];

  return (
    <div className="w-full max-w-md">
      {keyboard.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex justify-center mb-2">
          {rowIndex === 2 && (
            <button
              onClick={handleSubmit}
              disabled={getFilledPositions() !== 5 || isGameWon}
              className={`px-3 py-3 mx-1 rounded font-semibold ${
                getFilledPositions() === 5 && !isGameWon
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-300 text-gray-500"
              } transition-colors`}
            >
              ✓
            </button>
          )}

          {row.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              disabled={
                getFilledPositions() >= 5 ||
                isGameWon ||
                disabledLetters.includes(key)
              }
              className={`w-8 h-10 mx-1 rounded font-semibold ${
                disabledLetters.includes(key)
                  ? "bg-gray-300 text-gray-400 line-through"
                  : getFilledPositions() < 5 && !isGameWon
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-300 text-gray-500"
              } transition-colors uppercase`}
            >
              {key}
            </button>
          ))}

          {rowIndex === 2 && (
            <button
              onClick={handleBackspace}
              disabled={getFilledPositions() === 0 || isGameWon}
              className={`px-3 py-3 mx-1 rounded font-semibold ${
                getFilledPositions() > 0 && !isGameWon
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-300 text-gray-500"
              } transition-colors`}
            >
              ←
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
