import React from "react";
import useGameStore from "../store/useGameStore";

const Keyboard: React.FC = () => {
  const {
    handleKeyPress,
    handleBackspace,
    handleSubmit,
    getFilledPositions,
    isGameWon,
  } = useGameStore();

  // Keyboard layout
  const keyboard: string[][] = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];

  return (
    <div className="w-full max-w-[95vw] sm:max-w-md  px-2 sm:px-0 font-sans">
      {keyboard.map((row, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex justify-center mb-2 sm:mb-3 gap-1 sm:gap-2"
        >
          {rowIndex === 2 && (
            <button
              onClick={handleSubmit}
              disabled={getFilledPositions() !== 5 || isGameWon}
              className={`w-10 sm:w-16 h-8 sm:h-14 rounded font-semibold flex-shrink-0 flex-grow-0 ${
                getFilledPositions() === 5 && !isGameWon
                  ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
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
              disabled={getFilledPositions() >= 5 || isGameWon}
              className={`w-7 sm:w-11 h-8 sm:h-14 rounded font-semibold flex-shrink-0 flex-grow-0 ${
                getFilledPositions() < 5 && !isGameWon
                  ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-800 hover:text-indigo-100 cursor-pointer"
                  : "bg-gray-300 text-gray-500"
              } transition-colors uppercase text-xs sm:text-base`}
            >
              {key}
            </button>
          ))}

          {rowIndex === 2 && (
            <button
              onClick={handleBackspace}
              disabled={getFilledPositions() === 0 || isGameWon}
              className={`w-10 sm:w-16 h-8 sm:h-14 rounded font-semibold flex-shrink-0 flex-grow-0 ${
                getFilledPositions() > 0 && !isGameWon
                  ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
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
