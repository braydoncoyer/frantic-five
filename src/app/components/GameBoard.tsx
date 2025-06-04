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
  const [shakeCenter, setShakeCenter] = useState(false);

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

  // Trigger shake animation when there's an error
  useEffect(() => {
    if (invalidWord || feedbackMessage) {
      setShakeCenter(true);
      setTimeout(() => setShakeCenter(false), 500);
    }
  }, [invalidWord, feedbackMessage]);

  const [topWordColors, setTopWordColors] = useState<string[]>([]);
  const [bottomWordColors, setBottomWordColors] = useState<string[]>([]);

  // Update letter colors when words change
  useEffect(() => {
    if (secretWord && topWord) {
      const colors = calculateLetterColors(topWord, secretWord);
      setTopWordColors(colors);
    }
  }, [topWord, secretWord]);

  useEffect(() => {
    if (secretWord && bottomWord) {
      const colors = calculateLetterColors(bottomWord, secretWord);
      setBottomWordColors(colors);
    }
  }, [bottomWord, secretWord]);

  // Function to calculate letter colors for a word
  const calculateLetterColors = (word: string, secret: string): string[] => {
    const wordLetters = word.toLowerCase().split("");
    const secretLetters = secret.toLowerCase().split("");
    const colors = new Array(wordLetters.length).fill("bg-white");

    // Create a map to track letter frequencies in the secret word
    const letterFrequencies = new Map<string, number>();
    secretLetters.forEach((letter) => {
      letterFrequencies.set(letter, (letterFrequencies.get(letter) || 0) + 1);
    });

    // Create a map to track used letters
    const usedLetters = new Map<string, number>();
    secretLetters.forEach((letter) => {
      usedLetters.set(letter, 0);
    });

    // First pass: mark correct positions (green)
    wordLetters.forEach((letter, i) => {
      if (letter === secretLetters[i]) {
        colors[i] = "bg-emerald-500 text-white";
        usedLetters.set(letter, (usedLetters.get(letter) || 0) + 1);
      }
    });

    // Second pass: mark wrong positions (orange)
    wordLetters.forEach((letter, i) => {
      if (colors[i] === "bg-white") {
        // Only check letters that aren't already green
        const usedCount = usedLetters.get(letter) || 0;
        const totalCount = letterFrequencies.get(letter) || 0;

        if (usedCount < totalCount) {
          colors[i] = "bg-orange-400 text-white";
          usedLetters.set(letter, usedCount + 1);
        }
      }
    });

    return colors;
  };

  const getLetterColor = (
    letter: string,
    index: number,
    isTopWord: boolean
  ) => {
    if (!secretWord) return "bg-white";

    // Only show highlights for words that have been updated by player guesses
    if (isTopWord && !updatedTopWord) return "bg-white";
    if (!isTopWord && !updatedBottomWord) return "bg-white";

    // Get the color from the stored colors
    const colors = isTopWord ? topWordColors : bottomWordColors;
    return colors[index] || "bg-white";
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
        className={`flex-1 min-w-[60px] sm:min-w-[80px] border-2 border-indigo-100 rounded-lg flex items-center justify-center text-2xl sm:text-3xl font-semibold shadow-md uppercase aspect-square ${getLetterColor(
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
      <motion.div
        key={`center-${index}`}
        className={`flex-1 min-w-[60px] sm:min-w-[80px] border-2 ${
          invalidWord
            ? "border-red-500 bg-red-100"
            : letter
            ? "border-orange-400 bg-white hover:bg-indigo-100 cursor-pointer"
            : "border-gray-300 bg-white"
        } rounded-lg flex items-center justify-center text-2xl sm:text-3xl font-semibold shadow-md uppercase aspect-square`}
        onClick={() => {
          if (letter && !isGameWon) {
            removeLetter(index);
          }
        }}
        animate={
          shakeCenter
            ? {
                x: [0, -8, 8, -8, 8, -4, 4, 0],
                transition: {
                  duration: 0.7,
                  ease: [0.36, 0, 0.66, -0.56],
                  times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 0.95, 1],
                },
              }
            : {}
        }
      >
        {letter}
      </motion.div>
    );
  };

  return (
    <div className="mb-8 w-full max-w-3xl mx-auto text-slate-900 font-sans">
      {/* Top word */}
      <div className="flex gap-3 sm:gap-4 w-full mb-6 sm:mb-8">
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
      <div className="flex gap-3 sm:gap-4 w-full mb-6 sm:mb-8">
        {currentGuess.map((letter, index) => (
          <CenterLetterBox
            key={`center-${index}`}
            letter={letter}
            index={index}
          />
        ))}
      </div>

      {/* Bottom word */}
      <div className="flex gap-3 sm:gap-4 w-full">
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
