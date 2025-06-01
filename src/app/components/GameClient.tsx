"use client";

import React, { useEffect } from "react";
import useGameStore from "../store/useGameStore";
import GameBoard from "./GameBoard";
import Keyboard from "./Keyboard";
import CongratsModal from "./CongratsModal";
import HowToPlayModal from "./HowToPlayModal";

interface GameClientProps {
  initialWord: string;
  initialTopWord: string;
  initialBottomWord: string;
  wordList: string[];
  initialError: string | null;
}

const GameClient: React.FC<GameClientProps> = ({
  initialWord,
  initialTopWord,
  initialBottomWord,
  wordList,
  initialError,
}) => {
  const {
    initializeGame,
    attempts,
    isLoading,
    todayCompleted,
    setWordList,
    error,
    clearError,
    gameDate,
    secretWord,
  } = useGameStore();

  // Initialize game with server data
  useEffect(() => {
    // Set the word list immediately
    setWordList(wordList);

    // Initialize game with server data
    const currentDate = new Date().toISOString().split("T")[0];

    // If we have an error from the server, set it
    if (initialError) {
      useGameStore.setState({ error: initialError, isLoading: false });
      return;
    }

    // Check if game was already completed today
    const savedState = localStorage.getItem("word-finder-storage");
    let wasCompletedToday = false;
    let savedAttempts = 0;
    let wasGameWon = false;
    let storedDate = null;

    if (savedState) {
      try {
        const {
          todayCompleted: completed,
          attempts: savedAttemptsCount,
          isGameWon: won,
          gameDate: date,
        } = JSON.parse(savedState);
        wasCompletedToday = completed;
        savedAttempts = savedAttemptsCount;
        wasGameWon = won;
        storedDate = date;
      } catch (error) {
        console.error("Error parsing saved state:", error);
      }
    }

    // If it's a new day, reset the game state
    if (storedDate !== currentDate) {
      useGameStore.setState({
        topWord: initialTopWord,
        secretWord: initialWord,
        bottomWord: initialBottomWord,
        currentGuess: ["", "", "", "", ""],
        isGameWon: false,
        invalidWord: false,
        attempts: 0,
        showCongrats: false,
        disabledLetters: [],
        gameDate: currentDate,
        isLoading: false,
        todayCompleted: false,
        error: null,
      });
      return;
    }

    // If game was completed today, restore the completed state
    if (wasCompletedToday) {
      useGameStore.setState({
        topWord: initialTopWord,
        secretWord: initialWord,
        bottomWord: initialBottomWord,
        currentGuess: [...initialWord],
        isGameWon: wasGameWon,
        invalidWord: false,
        attempts: savedAttempts,
        showCongrats: true,
        disabledLetters: [],
        gameDate: currentDate,
        isLoading: false,
        todayCompleted: true,
        error: null,
      });
      return;
    }

    // Otherwise, set up a new game
    useGameStore.setState({
      topWord: initialTopWord,
      secretWord: initialWord,
      bottomWord: initialBottomWord,
      currentGuess: ["", "", "", "", ""],
      isGameWon: false,
      invalidWord: false,
      attempts: 0,
      showCongrats: false,
      disabledLetters: [],
      gameDate: currentDate,
      isLoading: false,
      todayCompleted: false,
      error: null,
    });
  }, [
    initialWord,
    initialTopWord,
    initialBottomWord,
    wordList,
    initialError,
    setWordList,
  ]);

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <h1 className="text-5xl font-bold mb-8 text-orange-500">Frantic Five</h1>

      {!todayCompleted && (
        <>
          <GameBoard />
          <p className="text-gray-600">Attempts: {attempts}</p>
          <Keyboard />
        </>
      )}
      <CongratsModal />
      <HowToPlayModal />

      {/* Daily Word Timer */}
      {todayCompleted && (
        <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-indigo-700 mb-2">
            Come back tomorrow!
          </h2>
          <p className="text-gray-600">
            New word available at midnight Central Time.
          </p>
          <div className="mt-4 text-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Check for new word
            </button>
          </div>
        </div>
      )}

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-white rounded-lg shadow-md text-xs text-gray-500">
          <p>Game Date: {gameDate}</p>
          <p>Secret Word: {secretWord}</p>
        </div>
      )}
    </div>
  );
};

export default GameClient;
