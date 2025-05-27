// store/useGameStore.ts
import { create } from "zustand";
import wordList from "@/utils/wordList";

interface GameState {
  // Game state
  topWord: string;
  bottomWord: string;
  secretWord: string;
  currentGuess: string[];
  isGameWon: boolean;
  invalidWord: boolean;
  attempts: number;
  showCongrats: boolean;
  disabledLetters: string[];
  powerupAvailable: boolean;

  // Actions
  startNewGame: () => void;
  handleKeyPress: (key: string) => void;
  handleBackspace: () => void;
  removeLetter: (index: number) => void;
  getFilledPositions: () => number;
  handleSubmit: () => void;
  handlePowerup: () => void;
  closeCongratsModal: () => void;
}

const useGameStore = create<GameState>((set, get) => ({
  // Game state
  topWord: "",
  bottomWord: "",
  secretWord: "",
  currentGuess: ["", "", "", "", ""],
  isGameWon: false,
  invalidWord: false,
  attempts: 0,
  showCongrats: false,
  disabledLetters: [],
  powerupAvailable: true,

  // Initialize game
  startNewGame: () => {
    // Sort word list
    const sortedWords = [...wordList].sort();

    // Pick a random secret word
    const secretIndex = Math.floor(Math.random() * sortedWords.length);
    const secretWord = sortedWords[secretIndex];

    // Find words that come before and after the secret word
    const wordsBefore = sortedWords.filter((word) => word < secretWord);
    const wordsAfter = sortedWords.filter((word) => word > secretWord);

    // If we don't have words before or after, try again
    if (wordsBefore.length === 0 || wordsAfter.length === 0) {
      return get().startNewGame();
    }

    // Pick random words from before and after
    const topWord = wordsBefore[Math.floor(Math.random() * wordsBefore.length)];
    const bottomWord =
      wordsAfter[Math.floor(Math.random() * wordsAfter.length)];

    set({
      topWord,
      secretWord,
      bottomWord,
      currentGuess: ["", "", "", "", ""],
      isGameWon: false,
      invalidWord: false,
      attempts: 0,
      showCongrats: false,
      disabledLetters: [],
      powerupAvailable: true,
    });
  },

  // Handle key press
  handleKeyPress: (key: string) => {
    const { currentGuess, isGameWon, disabledLetters } = get();

    if (!isGameWon && !disabledLetters.includes(key)) {
      set((state) => {
        const newGuess = [...state.currentGuess];
        for (let i = 0; i < 5; i++) {
          if (newGuess[i] === "") {
            newGuess[i] = key;
            return { currentGuess: newGuess };
          }
        }
        return {}; // All positions filled
      });
    }
  },

  // Handle backspace
  handleBackspace: () => {
    set((state) => {
      const newGuess = [...state.currentGuess];
      for (let i = 4; i >= 0; i--) {
        if (newGuess[i] !== "") {
          newGuess[i] = "";
          return { currentGuess: newGuess };
        }
      }
      return {}; // All positions empty
    });
  },

  // Remove letter at specific index
  removeLetter: (index: number) => {
    set((state) => {
      const newGuess = [...state.currentGuess];
      newGuess[index] = "";
      return { currentGuess: newGuess };
    });
  },

  // Get filled positions count
  getFilledPositions: () => {
    return get().currentGuess.filter((letter) => letter !== "").length;
  },

  // Handle word submission
  handleSubmit: () => {
    const { currentGuess, secretWord, attempts } = get();

    // Check if all positions are filled
    if (get().getFilledPositions() === 5) {
      const word = currentGuess.join("");

      if (wordList.includes(word.toLowerCase())) {
        set({ attempts: attempts + 1 });

        if (word.toLowerCase() === secretWord.toLowerCase()) {
          set({
            isGameWon: true,
            showCongrats: true,
          });
        } else {
          // Determine if guess goes above or below the secret word
          if (word.toLowerCase() < secretWord.toLowerCase()) {
            set({
              topWord: word.toLowerCase(),
              currentGuess: ["", "", "", "", ""],
            });
          } else {
            set({
              bottomWord: word.toLowerCase(),
              currentGuess: ["", "", "", "", ""],
            });
          }
        }
      } else {
        // Invalid word
        set({ invalidWord: true });

        setTimeout(() => {
          set({
            invalidWord: false,
            currentGuess: ["", "", "", "", ""],
          });
        }, 1500);
      }
    }
  },

  // Handle power-up: remove 3 letters not in the secret word
  handlePowerup: () => {
    const { powerupAvailable, isGameWon, secretWord, disabledLetters } = get();

    if (!powerupAvailable || isGameWon) return;

    // Get all letters in the secret word
    const secretLetters = new Set(secretWord.split(""));

    // Get all letters not in the secret word
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const nonSecretLetters = alphabet
      .split("")
      .filter(
        (letter) =>
          !secretLetters.has(letter) && !disabledLetters.includes(letter)
      );

    // Randomly select 3 letters to disable
    const lettersToDisable: string[] = [];
    for (let i = 0; i < 3 && nonSecretLetters.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * nonSecretLetters.length);
      lettersToDisable.push(nonSecretLetters[randomIndex]);
      nonSecretLetters.splice(randomIndex, 1);
    }

    set({
      disabledLetters: [...disabledLetters, ...lettersToDisable],
      powerupAvailable: false,
    });
  },

  // Close congrats modal
  closeCongratsModal: () => set({ showCongrats: false }),
}));

export default useGameStore;
