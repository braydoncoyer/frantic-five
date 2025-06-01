import React, { useEffect, useState, useRef } from "react";
import useGameStore from "@/app/store/useGameStore";
import { motion } from "framer-motion";

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

  // Track which row should animate
  const [animateTop, setAnimateTop] = useState(false);
  const [animateBottom, setAnimateBottom] = useState(false);

  // Keep track of previous words
  const prevTopWord = useRef(topWord);
  const prevBottomWord = useRef(bottomWord);

  // Check for word changes and trigger animations
  useEffect(() => {
    if (topWord !== prevTopWord.current) {
      setAnimateTop(true);
      setTimeout(() => setAnimateTop(false), 1000);
      prevTopWord.current = topWord;
    }
  }, [topWord]);

  useEffect(() => {
    if (bottomWord !== prevBottomWord.current) {
      setAnimateBottom(true);
      setTimeout(() => setAnimateBottom(false), 1000);
      prevBottomWord.current = bottomWord;
    }
  }, [bottomWord]);

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

  const LetterBox = ({
    letter,
    index,
    isTopWord,
  }: {
    letter: string;
    index: number;
    isTopWord: boolean;
  }) => {
    // Only animate if this row's animation flag is true
    const shouldAnimate =
      (isTopWord && animateTop) || (!isTopWord && animateBottom);

    return (
      <motion.div
        key={`${isTopWord ? "top" : "bottom"}-${index}`}
        className={`w-12 h-12 sm:w-13 sm:h-13 lg:w-16 lg:h-16 border-2 border-indigo-100 rounded-md m-0.5 sm:m-1 flex items-center justify-center text-lg sm:text-xl font-semibold shadow-md uppercase aspect-square ${getLetterColor(
          letter,
          index,
          isTopWord
        )}`}
        animate={
          shouldAnimate
            ? {
                y: [0, -10, 0],
                transition: {
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                },
              }
            : {}
        }
      >
        {letter}
      </motion.div>
    );
  };

  const CenterLetterBox = ({
    letter,
    index,
  }: {
    letter: string;
    index: number;
  }) => {
    return (
      <div
        key={`center-${index}`}
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
    );
  };

  return (
    <div className="mb-8 w-full max-w-[95vw] sm:max-w-md text-slate-900 font-sans">
      {/* Top word */}
      <div className="flex justify-center mb-4 sm:mb-8">
        {topWord.split("").map((letter, index) => (
          <LetterBox
            key={`top-${index}`}
            letter={letter}
            index={index}
            isTopWord={true}
          />
        ))}
      </div>

      {/* Current guess */}
      <div className="flex justify-center mb-4 sm:mb-8">
        {currentGuess.map((letter, index) => (
          <CenterLetterBox
            key={`center-${index}`}
            letter={letter}
            index={index}
          />
        ))}
      </div>

      {/* Bottom word */}
      <div className="flex justify-center">
        {bottomWord.split("").map((letter, index) => (
          <LetterBox
            key={`bottom-${index}`}
            letter={letter}
            index={index}
            isTopWord={false}
          />
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
