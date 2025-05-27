import React from "react";
import useGameStore from "../store/useGameStore";

const GameInfo: React.FC = () => {
  const { attempts } = useGameStore();

  return (
    <div className="mb-8">
      <p className="text-sm text-gray-600 mb-2 text-center">
        Find the secret 5-letter word that falls alphabetically between the top
        and bottom words.
      </p>
      <p className="text-sm text-gray-600 mb-1 text-center">
        Use your keyboard or click the letters below.
      </p>
      <p className="text-sm text-gray-600 mb-1 text-center">
        Click on any letter in the middle row to remove it.
      </p>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Attempts: {attempts}
      </p>
    </div>
  );
};

export default GameInfo;
