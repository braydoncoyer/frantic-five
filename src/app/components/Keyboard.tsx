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
          className="flex justify-center mb-8 gap-2.5 sm:mb-7 sm:gap-4"
        >
          {rowIndex === 2 && (
            <button
              onClick={handleSubmit}
              disabled={getFilledPositions() !== 5 || isGameWon}
              className={`w-[29px] sm:w-[56px] h-[44px] sm:h-[78px] rounded-md font-semibold flex-shrink-0 flex-grow-0 ${
                getFilledPositions() === 5 && !isGameWon
                  ? "bg-emerald-500 text-white hover:bg-green-600 cursor-pointer shadow-[0_4px_0_0_#006045] sm:shadow-[0_8px_0_0_#006045]"
                  : "bg-gray-300 text-gray-500 shadow-[0_4px_0_0_#B6B6B6] sm:shadow-[0_8px_0_0_#B6B6B6]"
              } transition-colors text-[32px]`}
            >
              ✓
            </button>
          )}

          {row.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              disabled={getFilledPositions() >= 5 || isGameWon}
              className={`w-[29px] sm:w-[56px] h-[44px] sm:h-[78px] rounded-md font-semibold flex-shrink-0 flex-grow-0 shadow-[0_4px_0_0_#D9D9D9] sm:shadow-[0_8px_0_0_#D9D9D9] ${
                getFilledPositions() < 5 && !isGameWon
                  ? "bg-white text-[#414141] hover:bg-slate-100 cursor-pointer"
                  : "bg-gray-300 text-gray-500"
              } transition-colors uppercase`}
            >
              <span className="text-2xl sm:text-4xl">{key}</span>
            </button>
          ))}

          {rowIndex === 2 && (
            <button
              onClick={handleBackspace}
              disabled={getFilledPositions() === 0 || isGameWon}
              className={`w-[29px] sm:w-[56px] h-[44px] sm:h-[78px] rounded-md font-semibold flex-shrink-0 flex-grow-0 ${
                getFilledPositions() > 0 && !isGameWon
                  ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer shadow-[0_4px_0_0_#C70036] sm:shadow-[0_8px_0_0_#C70036]"
                  : "bg-gray-300 text-gray-500 shadow-[0_4px_0_0_#B6B6B6] sm:shadow-[0_8px_0_0_#B6B6B6]"
              } transition-colors text-[32px]`}
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
