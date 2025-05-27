import React from "react";
import useGameStore from "../store/useGameStore";

const PowerUp: React.FC = () => {
  const { powerupAvailable, isGameWon, handlePowerup } = useGameStore();

  return (
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
  );
};

export default PowerUp;
