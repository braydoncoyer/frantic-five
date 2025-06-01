import React from "react";
import useGameStore from "@/app/store/useGameStore";

const GameBoard: React.FC = () => {
  const {
    topWord,
    bottomWord,
    secretWord,
    currentGuess,
    invalidWord,
    isGameWon,
    removeLetter,
    feedbackMessage,
    updatedTopWord,
    updatedBottomWord,
  } = useGameStore();

  const getLetterColor = (
    letter: string,
    index: number,
    isTopWord: boolean
  ) => {
    if (!secretWord) return "bg-white";

    // Only show highlights for words that have been updated by player guesses
    if (isTopWord && !updatedTopWord) return "bg-white";
    if (!isTopWord && !updatedBottomWord) return "bg-white";

    const secretLetters = secretWord.toLowerCase().split("");
    const currentLetter = letter.toLowerCase();

    if (currentLetter === secretLetters[index]) {
      return "bg-green-500 text-white";
    } else if (secretLetters.includes(currentLetter)) {
      return "bg-yellow-500 text-white";
    }
    return "bg-white";
  };

  return (
    <div className="mb-8 w-full max-w-[95vw] sm:max-w-md text-slate-900">
      {/* Top word */}
      <div className="flex justify-center mb-4 sm:mb-8">
        {topWord.split("").map((letter, index) => (
          <div
            key={`top-${index}`}
            className={`w-12 h-12 sm:w-13 sm:h-13 lg:w-16 lg:h-16 border-2 border-indigo-100 rounded-md m-0.5 sm:m-1 flex items-center justify-center text-lg sm:text-xl font-semibold shadow-md uppercase aspect-square ${getLetterColor(
              letter,
              index,
              true
            )}`}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Current guess */}
      <div className="flex justify-center mb-4 sm:mb-8">
        {currentGuess.map((letter, index) => (
          <div
            key={`guess-${index}`}
            className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 border-2 ${
              invalidWord
                ? "border-red-500 bg-red-100"
                : letter
                ? "border-orange-400 bg-white hover:bg-indigo-100 cursor-pointer"
                : "border-gray-300 bg-gray-50"
            } rounded-md mx-1 sm:mx-2 flex items-center justify-center text-xl sm:text-2xl lg:text-2xl font-semibold shadow-md uppercase aspect-square`}
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
            className={`w-12 h-12 sm:w-13 sm:h-13 lg:w-16 lg:h-16 border-2 border-indigo-100 rounded-md m-0.5 sm:m-1 flex items-center justify-center text-lg sm:text-xl font-semibold shadow-md uppercase aspect-square ${getLetterColor(
              letter,
              index,
              false
            )}`}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Feedback message */}
      {feedbackMessage && (
        <div className="text-center mb-4 text-red-600 font-medium text-sm sm:text-base">
          {feedbackMessage}
        </div>
      )}
    </div>
  );
};

export default GameBoard;
