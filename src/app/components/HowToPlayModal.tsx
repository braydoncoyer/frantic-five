import React from "react";
import useGameStore from "../store/useGameStore";

const HowToPlayModal: React.FC = () => {
  const { showHowToPlay, closeHowToPlayModal } = useGameStore();

  if (!showHowToPlay) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">How to Play</h2>

        <div className="space-y-4 text-gray-700">
          <p>
            Welcome to{" "}
            <span className="font-bold text-orange-500">Frantic Five</span>!
          </p>

          <div>
            <h3 className="font-semibold text-indigo-600 mb-2">The Rules:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Each guess must be a valid 5-letter word.</li>
              <li>
                The secret word comes{" "}
                <b>
                  <i>alphabetically</i>
                </b>{" "}
                between the top and bottom words.
              </li>
              <li>Use the keyboard to make a guess, then press Enter.</li>
              <li>
                Wrong guesses will{" "}
                <b>
                  <i>replace</i>
                </b>{" "}
                either the top or bottom word, narrowing your range.
              </li>
              <li>
                Letters in your guesses will be highlighted:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>
                    <span className="inline-block w-4 h-4 bg-green-500 rounded-sm mr-1"></span>
                    <span className="text-green-600 font-medium">Green</span>:
                    Letter is in the correct position
                  </li>
                  <li>
                    <span className="inline-block w-4 h-4 bg-yellow-500 rounded-sm mr-1"></span>
                    <span className="text-yellow-600 font-medium">Yellow</span>:
                    Letter is in the wrong position
                  </li>
                </ul>
              </li>
              <li>
                You have <b>5</b> attempts to find the secret word.
              </li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-indigo-600 mb-2">
              Daily Challenge:
            </h3>
            <p>
              A new word is available every day at midnight Central Time. Come
              back daily to keep your streak going!
            </p>
          </div>
        </div>

        <button
          onClick={closeHowToPlayModal}
          className="mt-6 w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default HowToPlayModal;
