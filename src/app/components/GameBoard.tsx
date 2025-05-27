import React from "react";
import useGameStore from "../store/useGameStore";

const GameBoard: React.FC = () => {
  const {
    topWord,
    bottomWord,
    currentGuess,
    invalidWord,
    isGameWon,
    removeLetter,
  } = useGameStore();

  return (
    <div className="mb-8 w-full max-w-md">
      {/* Top word */}
      <div className="flex justify-center mb-4">
        {topWord.split("").map((letter, index) => (
          <div
            key={`top-${index}`}
            className="w-12 h-12 border-2 border-indigo-400 rounded m-1 flex items-center justify-center text-xl font-semibold bg-white shadow-md uppercase"
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Current guess */}
      <div className="flex justify-center mb-4">
        {currentGuess.map((letter, index) => (
          <div
            key={`guess-${index}`}
            className={`w-12 h-12 border-2 ${
              invalidWord
                ? "border-red-500 bg-red-100"
                : letter
                ? "border-indigo-600 bg-white hover:bg-indigo-100 cursor-pointer"
                : "border-gray-300 bg-gray-50"
            } rounded m-1 flex items-center justify-center text-xl font-semibold shadow-md uppercase`}
            onClick={() => {
              if (letter && !isGameWon) {
                removeLetter(index);
              }
            }}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Bottom word */}
      <div className="flex justify-center">
        {bottomWord.split("").map((letter, index) => (
          <div
            key={`bottom-${index}`}
            className="w-12 h-12 border-2 border-indigo-400 rounded m-1 flex items-center justify-center text-xl font-semibold bg-white shadow-md uppercase"
          >
            {letter}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
