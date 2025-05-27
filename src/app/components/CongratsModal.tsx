import React from "react";
import useGameStore from "../store/useGameStore";

const CongratsModal: React.FC = () => {
  const { showCongrats, secretWord, attempts, startNewGame } = useGameStore();

  if (!showCongrats) return null;

  return (
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
  );
};

export default CongratsModal;
