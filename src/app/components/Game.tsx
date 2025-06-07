"use client";

import React, { useEffect } from "react";
import useGameStore from "../store/useGameStore";
import GameBoard from "./GameBoard";
import Keyboard from "./Keyboard";
import CongratsModal from "./CongratsModal";
import HowToPlayModal from "./HowToPlayModal";
import HelpButton from "./HelpButton";

const Game: React.FC = () => {
  const {
    initializeGame,
    attempts,
    isLoading,
    todayCompleted,
    setWordList,
    error,
    clearError,
  } = useGameStore();

  // Load word list from injected script and initialize game
  useEffect(() => {
    // Get the word list from the injected script
    const wordListElement = document.getElementById("word-list-data");
    if (wordListElement) {
      try {
        const words = JSON.parse(wordListElement.innerHTML);
        if (Array.isArray(words) && words.length > 0) {
          setWordList(words);
          console.log(`Loaded ${words.length} words from script`);
        }
      } catch (error) {
        console.error("Error parsing word list:", error);
      }
    }

    // Initialize the game
    initializeGame();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key } = e;
      const {
        handleKeyPress,
        handleBackspace,
        handleSubmit,
        isGameWon,
        disabledLetters,
        getFilledPositions,
        todayCompleted,
      } = useGameStore.getState();

      if (todayCompleted || isGameWon) return;

      if (key.match(/^[a-z]$/i) && getFilledPositions() < 5) {
        const lowerKey = key.toLowerCase();
        if (!disabledLetters.includes(lowerKey)) {
          handleKeyPress(lowerKey);
        }
      } else if (key === "Backspace") {
        handleBackspace();
      } else if (key === "Enter") {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
        <div className="text-2xl font-bold text-indigo-700">
          Loading today&apos;s word...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Error</h2>
          <p className="mb-6 text-gray-700">{error}</p>
          <div className="flex gap-4">
            <button
              onClick={() => initializeGame()}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => clearError()}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-around min-h-screen bg-slate-900 p-4">
      <div className="flex justify-between w-full text-xl sm:text-3xl text-white/30 font-bold max-w-[625px]">
        <h2>Frantic Five</h2>
        <h3>Attempts: {attempts}</h3>
      </div>
      {!todayCompleted && (
        <div className="flex flex-col items-center">
          <div>
            <GameBoard />
          </div>
        </div>
      )}

      <Keyboard />
      <CongratsModal />
      <HowToPlayModal />
      <HelpButton />
    </div>
  );
};

export default Game;
