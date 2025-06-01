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
    <div className="mb-8 w-full max-w-md text-slate-900">
      {/* Top word */}
      <div className="flex justify-center mb-8">
        {topWord.split("").map((letter, index) => (
          <div
            key={`top-${index}`}
            className={`w-13 h-13 border-2 border-indigo-100 rounded-md m-1 flex items-center justify-center text-xl font-semibold shadow-md uppercase ${getLetterColor(
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
      <div className="flex justify-center mb-8">
        {currentGuess.map((letter, index) => (
          <div
            key={`guess-${index}`}
            className={`w-16 h-16 border-2 ${
              invalidWord
                ? "border-red-500 bg-red-100"
                : letter
                ? "border-orange-400 bg-white hover:bg-indigo-100 cursor-pointer"
                : "border-gray-300 bg-gray-50"
            } rounded-md mx-2 flex items-center justify-center text-xl font-semibold shadow-md uppercase`}
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
            className={`w-13 h-13 border-2 border-indigo-100 rounded-md m-1 flex items-center justify-center text-xl font-semibold shadow-md uppercase ${getLetterColor(
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
        <div className="text-center mb-4 text-red-600 font-medium">
          {feedbackMessage}
        </div>
      )}
    </div>
  );
};

export default GameBoard;
