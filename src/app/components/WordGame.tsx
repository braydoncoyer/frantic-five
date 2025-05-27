"use client";

import { useState, useEffect } from "react";

const WordGame = () => {
  // List of 5-letter words
  const wordList = [
    "about",
    "above",
    "actor",
    "admit",
    "adopt",
    "adult",
    "after",
    "again",
    "agent",
    "agree",
    "ahead",
    "allow",
    "alone",
    "along",
    "alter",
    "among",
    "anger",
    "ankle",
    "apple",
    "apply",
    "arena",
    "argue",
    "arise",
    "aside",
    "asset",
    "avoid",
    "award",
    "aware",
    "bacon",
    "badge",
    "basic",
    "basis",
    "beach",
    "begin",
    "being",
    "below",
    "bench",
    "birth",
    "black",
    "blame",
    "blank",
    "blast",
    "blend",
    "blink",
    "block",
    "blood",
    "board",
    "boost",
    "booth",
    "brain",
    "brand",
    "brave",
    "bread",
    "break",
    "brick",
    "brief",
    "bring",
    "broad",
    "brown",
    "brush",
    "build",
    "bunch",
    "buyer",
    "cabin",
    "cable",
    "camel",
    "canal",
    "candy",
    "canoe",
    "cargo",
    "carry",
    "carve",
    "cause",
    "chain",
    "chair",
    "chalk",
    "charm",
    "chart",
    "check",
    "chest",
    "chief",
    "child",
    "chips",
    "choke",
    "chord",
    "claim",
    "class",
    "clean",
  ];

  // Game state
  const [topWord, setTopWord] = useState("");
  const [bottomWord, setBottomWord] = useState("");
  const [secretWord, setSecretWord] = useState("");
  const [currentGuess, setCurrentGuess] = useState(["", "", "", "", ""]);
  const [isGameWon, setIsGameWon] = useState(false);
  const [invalidWord, setInvalidWord] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [disabledLetters, setDisabledLetters] = useState<string[]>([]);
  const [powerupAvailable, setPowerupAvailable] = useState(true);

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.match(/^[a-z]$/i) && !isGameWon) {
        const key = e.key.toLowerCase();
        if (!disabledLetters.includes(key)) {
          handleKeyPress(key);
        }
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Enter") {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentGuess, isGameWon, disabledLetters]); // eslint-disable-line react-hooks/exhaustive-deps

  const startNewGame = () => {
    // Sort word list
    const sortedWords = [...wordList].sort();

    // Pick a random secret word
    const secretIndex = Math.floor(Math.random() * sortedWords.length);
    const secretWord = sortedWords[secretIndex];

    // Find words that come before and after the secret word
    const wordsBefore = sortedWords.filter((word) => word < secretWord);
    const wordsAfter = sortedWords.filter((word) => word > secretWord);

    // If we don't have words before or after, select new secret word
    if (wordsBefore.length === 0 || wordsAfter.length === 0) {
      startNewGame();
      return;
    }

    // Pick random words from before and after
    const topWord = wordsBefore[Math.floor(Math.random() * wordsBefore.length)];
    const bottomWord =
      wordsAfter[Math.floor(Math.random() * wordsAfter.length)];

    setTopWord(topWord);
    setSecretWord(secretWord);
    setBottomWord(bottomWord);
    setCurrentGuess(["", "", "", "", ""]);
    setIsGameWon(false);
    setInvalidWord(false);
    setAttempts(0);
    setShowCongrats(false);
    setDisabledLetters([]);
    setPowerupAvailable(true);
  };

  // Handle key press
  const handleKeyPress = (key: string) => {
    if (!isGameWon && !disabledLetters.includes(key)) {
      // Find the first empty position
      setCurrentGuess((prevGuess) => {
        const newGuess = [...prevGuess];
        for (let i = 0; i < 5; i++) {
          if (newGuess[i] === "") {
            newGuess[i] = key;
            return newGuess;
          }
        }
        return prevGuess; // All positions filled
      });
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    setCurrentGuess((prevGuess) => {
      // Find the rightmost non-empty position
      const newGuess = [...prevGuess];
      for (let i = 4; i >= 0; i--) {
        if (newGuess[i] !== "") {
          newGuess[i] = "";
          return newGuess;
        }
      }
      return prevGuess; // All positions empty
    });
  };

  // Check if word is valid
  const isValidWord = (word: string) => {
    return wordList.includes(word.toLowerCase());
  };

  // Count filled positions in the guess
  const getFilledPositions = () => {
    return currentGuess.filter((letter) => letter !== "").length;
  };

  // Handle word submission
  const handleSubmit = () => {
    // Check if all positions are filled
    if (getFilledPositions() === 5) {
      const word = currentGuess.join("");
      if (isValidWord(word)) {
        setAttempts(attempts + 1);

        if (word.toLowerCase() === secretWord.toLowerCase()) {
          setIsGameWon(true);
          setShowCongrats(true);
        } else {
          // Determine if guess goes above or below the secret word
          if (word.toLowerCase() < secretWord.toLowerCase()) {
            setTopWord(word.toLowerCase());
          } else {
            setBottomWord(word.toLowerCase());
          }
          setCurrentGuess(["", "", "", "", ""]);
        }
      } else {
        // Invalid word
        setInvalidWord(true);
        setTimeout(() => {
          setInvalidWord(false);
          setCurrentGuess(["", "", "", "", ""]);
        }, 1500);
      }
    }
  };

  // Handle power-up: remove 3 letters not in the secret word
  const handlePowerup = () => {
    if (!powerupAvailable || isGameWon) return;

    // Get all letters in the secret word
    const secretLetters = new Set(secretWord.split(""));

    // Get all letters not in the secret word
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const nonSecretLetters = alphabet
      .split("")
      .filter((letter) => !secretLetters.has(letter));

    // Randomly select 3 letters to disable
    const lettersToDisable = [];
    for (let i = 0; i < 3 && nonSecretLetters.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * nonSecretLetters.length);
      lettersToDisable.push(nonSecretLetters[randomIndex]);
      nonSecretLetters.splice(randomIndex, 1);
    }

    setDisabledLetters([...disabledLetters, ...lettersToDisable]);
    setPowerupAvailable(false);
  };

  // Keyboard layout
  const keyboard = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <h1 className="text-3xl font-bold mb-8 text-indigo-700">Frantic Five</h1>

      <div className="mb-8">
        <p className="text-sm text-gray-600 mb-2 text-center">
          Find the secret 5-letter word that falls alphabetically between the
          top and bottom words.
        </p>
        <p className="text-sm text-gray-600 mb-1 text-center">
          Use your keyboard or click the letters below.
        </p>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Attempts: {attempts}
        </p>
      </div>

      {/* Power-up button */}
      <div className="mb-4">
        <button
          onClick={handlePowerup}
          disabled={!powerupAvailable || isGameWon}
          className={`px-4 py-2 rounded-lg font-semibold ${
            powerupAvailable && !isGameWon
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-gray-300 text-gray-500"
          } transition-colors flex items-center gap-2`}
        >
          <span className="text-lg">⚡</span>
          <span>Remove 3 Useless Letters</span>
        </button>
      </div>

      {/* Game board */}
      <div className="mb-8 w-full max-w-md">
        {/* Top word */}
        <div className="flex justify-center mb-4">
          {topWord.split("").map((letter, index) => (
            <div
              key={`top-${index}`}
              className="w-12 h-12 border-2 border-indigo-400 rounded m-1 flex items-center justify-center text-xl font-semibold bg-white shadow-md uppercase text-slate-900"
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
                  // Remove the letter at this index
                  setCurrentGuess((prev) => {
                    const newGuess = [...prev];
                    newGuess[index] = "";
                    return newGuess;
                  });
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
              className="w-12 h-12 border-2 border-indigo-400 rounded m-1 flex items-center justify-center text-xl font-semibold bg-white shadow-md uppercase text-slate-900"
            >
              {letter}
            </div>
          ))}
        </div>
      </div>

      {/* Keyboard */}
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

      {/* Congratulations modal */}
      {showCongrats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">
              Congratulations!
            </h2>
            <p className="mb-4">
              You found the secret word{" "}
              <span className="font-bold uppercase">{secretWord}</span> in{" "}
              {attempts} {attempts === 1 ? "attempt" : "attempts"}!
            </p>
            <button
              onClick={startNewGame}
              className="w-full py-3 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Debug info (remove in production) */}
      {/* <div className="mt-8 text-sm text-gray-500">
        <p>Secret word: {secretWord}</p>
      </div> */}
    </div>
  );
};

export default WordGame;
