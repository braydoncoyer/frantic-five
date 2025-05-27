"use client";
import React, { useEffect } from "react";
import useGameStore from "../store/useGameStore";
import GameInfo from "./GameInfo";
import GameBoard from "./GameBoard";
import Keyboard from "./Keyboard";
import PowerUp from "./PowerUp";
import CongratsModal from "./CongratsModal";

const Game: React.FC = () => {
  const { startNewGame } = useGameStore();

  // Initialize game and set up keyboard event listener
  useEffect(() => {
    startNewGame();

    // Add keyboard event listener
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key } = e;
      const {
        handleKeyPress,
        handleBackspace,
        handleSubmit,
        isGameWon,
        disabledLetters,
        getFilledPositions,
      } = useGameStore.getState();

      if (key.match(/^[a-z]$/i) && !isGameWon && getFilledPositions() < 5) {
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <h1 className="text-3xl font-bold mb-8 text-indigo-700">Word Finder</h1>

      <GameInfo />
      <PowerUp />
      <GameBoard />
      <Keyboard />
      <CongratsModal />
    </div>
  );
};

export default Game;
