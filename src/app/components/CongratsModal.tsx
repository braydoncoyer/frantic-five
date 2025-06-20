import React from "react";
import useGameStore from "../store/useGameStore";

const CongratsModal: React.FC = () => {
  const { showCongrats, secretWord, attempts, isGameWon } = useGameStore();

  if (!showCongrats) return null;

  const generateShareText = () => {
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });

    if (isGameWon) {
      return `Frantic Five ${dateStr} - Found in ${attempts} ${
        attempts === 1 ? "try" : "tries"
      }!\n\nCan you find today's word? Play at https://franticfive.com`;
    } else {
      return `Frantic Five ${dateStr} - Game Over!\n\nCan you find today's word? Play at https://franticfive.com`;
    }
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

  // Share results on Twitter
  const handleTweet = () => {
    const shareText = generateShareText();
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}`;
    window.open(tweetUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-orange-500 mb-4">
          {isGameWon ? "Congratulations!" : "Game Over!"}
        </h2>
        {isGameWon ? (
          <p className="mb-4 text-gray-600">
            You found the secret word{" "}
            <span className="font-bold uppercase">{secretWord}</span> in{" "}
            {attempts} {attempts === 1 ? "attempt" : "attempts"}!
          </p>
        ) : (
          <p className="mb-4 text-gray-600">
            The secret word was{" "}
            <span className="font-bold uppercase">{secretWord}</span>.
          </p>
        )}
        <p className="mb-4 text-gray-600">
          Come back tomorrow for a new Frantic Five puzzle!
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors cursor-pointer"
          >
            Share Results
          </button>
          <button
            onClick={handleTweet}
            className="flex-1 py-3 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Tweet Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default CongratsModal;
