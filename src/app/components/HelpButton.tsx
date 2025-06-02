import React from "react";
import useGameStore from "../store/useGameStore";

const HelpButton: React.FC = () => {
  const { openHowToPlayModal } = useGameStore();

  return (
    <button
      onClick={openHowToPlayModal}
      className="fixed bottom-6 right-6 w-10 h-10 bg-orange-400 text-white rounded-full sm:flex items-center justify-center text-xl font-bold shadow-lg hover:bg-orange-500 transition-colors z-40 cursor-pointer hidden"
      aria-label="How to Play"
    >
      ?
    </button>
  );
};

export default HelpButton;
