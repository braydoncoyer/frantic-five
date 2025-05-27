import React from "react";
import useGameStore from "../store/useGameStore";

const CongratsModal: React.FC = () => {
  const { showCongrats, secretWord, attempts, closeCongratsModal } =
    useGameStore();

  if (!showCongrats) return null;

  // Create a shareable results text (similar to Wordle)
  const generateShareText = () => {
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });

    return `Word Finder ${dateStr} - Found in ${attempts} ${
      attempts === 1 ? "try" : "tries"
    }!\n\nCan you find today's word? Play at wordfinder.example.com`;
  };

  // Copy results to clipboard
  const handleShare = () => {
    const shareText = generateShareText();
    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        alert("Results copied to clipboard!");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

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
        <p className="mb-4 text-gray-600">
          Come back tomorrow for a new word at midnight Central Time.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors"
          >
            Share Results
          </button>
          <button
            onClick={closeCongratsModal}
            className="flex-1 py-3 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CongratsModal;
