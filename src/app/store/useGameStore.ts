// store/useGameStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getTodaysWord, getRandomWord, getAllWords } from "@/app/actions";

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
  isLoading: boolean;
  todayCompleted: boolean;
  gameDate: string | null;
  wordList: string[];
  error: string | null;

  // Actions
  initializeGame: () => Promise<void>;
  handleKeyPress: (key: string) => void;
  handleBackspace: () => void;
  removeLetter: (index: number) => void;
  getFilledPositions: () => number;
  handleSubmit: () => Promise<void>;
  handlePowerup: () => void;
  closeCongratsModal: () => void;
  clearError: () => void;
  setWordList: (words: string[]) => void;
}

// Create a game store with persistence for tracking completion status
const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
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
      isLoading: true,
      todayCompleted: false,
      gameDate: null,
      wordList: [],
      error: null,

      // Set the word list
      setWordList: (words: string[]) => set({ wordList: words }),

      // Clear error
      clearError: () => set({ error: null }),

      // Initialize game
      initializeGame: async () => {
        set({ isLoading: true, error: null });

        try {
          // Get all words for validation if we don't have them yet
          let wordList = get().wordList;
          if (wordList.length === 0) {
            console.log("Fetching all words...");
            const allWords = await getAllWords();
            console.log(`Fetched ${allWords.length} words`);

            if (allWords.length > 0) {
              wordList = allWords;
              set({ wordList });
            }
          }

          // Get today's date (or yesterday's if game already completed)
          const currentDate = new Date().toISOString().split("T")[0];
          const { gameDate: storedDate, todayCompleted } = get();

          // If game already completed for today, just restore state
          if (storedDate === currentDate && todayCompleted) {
            console.log("Game already completed for today, restoring state");
            set({ isLoading: false });
            return;
          }

          // Get today's word from the server
          console.log("Fetching today's word...");
          const { word, error } = await getTodaysWord();

          if (!word) {
            console.error("Error getting daily word:", error);

            // Try fallback to random word
            console.log("Trying fallback to random word...");
            const { word: fallbackWord } = await getRandomWord();

            if (!fallbackWord) {
              set({
                isLoading: false,
                error: "Could not get a word. Please try again later.",
              });
              return;
            }

            // Use fallback word
            console.log("Using fallback random word:", fallbackWord);
            setupGame(fallbackWord, currentDate, wordList);
            return;
          }

          // Successfully got daily word
          console.log("Using daily word:", word);
          setupGame(word, currentDate, wordList);
        } catch (error) {
          console.error("Error initializing game:", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
          });
        }

        // Helper function to set up the game
        function setupGame(
          secretWord: string,
          date: string,
          wordList: string[]
        ) {
          const { gameDate: storedDate } = get();
          const isNewDay = storedDate !== date;

          // Sort word list
          const sortedWords = [...wordList].sort();

          // Find words that come before and after the secret word
          const wordsBefore = sortedWords.filter((w) => w < secretWord);
          const wordsAfter = sortedWords.filter((w) => w > secretWord);

          console.log(
            `Words before: ${wordsBefore.length}, Words after: ${wordsAfter.length}`
          );

          // If we don't have words before or after, use fallbacks
          if (wordsBefore.length === 0 || wordsAfter.length === 0) {
            // Manually select words as fallback
            const topWord =
              wordsBefore.length > 0
                ? wordsBefore[Math.floor(Math.random() * wordsBefore.length)]
                : "aaaaa"; // Alphabetically before any word

            const bottomWord =
              wordsAfter.length > 0
                ? wordsAfter[Math.floor(Math.random() * wordsAfter.length)]
                : "zzzzz"; // Alphabetically after any word

            console.log(`Using fallback bounds: ${topWord} - ${bottomWord}`);

            // If it's a new day, reset the game state
            if (isNewDay) {
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
                gameDate: date,
                isLoading: false,
                todayCompleted: false,
                error: null,
              });
            } else {
              // Same day, just update the words
              set({
                topWord,
                secretWord,
                bottomWord,
                isLoading: false,
                error: null,
              });
            }
            return;
          }

          // Pick random words from before and after
          const topWord =
            wordsBefore[Math.floor(Math.random() * wordsBefore.length)];
          const bottomWord =
            wordsAfter[Math.floor(Math.random() * wordsAfter.length)];

          console.log(
            `Game bounds: ${topWord} - ${secretWord} - ${bottomWord}`
          );

          // If it's a new day, reset the game state
          if (isNewDay) {
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
              gameDate: date,
              isLoading: false,
              todayCompleted: false,
              error: null,
            });
          } else {
            // Same day, just update the words
            set({
              topWord,
              secretWord,
              bottomWord,
              isLoading: false,
              error: null,
            });
          }
        }
      },

      // Handle key press
      handleKeyPress: (key: string) => {
        const { isGameWon, disabledLetters, todayCompleted } =
          get();

        if (todayCompleted || isGameWon || disabledLetters.includes(key)) {
          return;
        }

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
      },

      // Handle backspace
      handleBackspace: () => {
        const { todayCompleted, isGameWon } = get();

        if (todayCompleted || isGameWon) return;

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
        const { todayCompleted, isGameWon } = get();

        if (todayCompleted || isGameWon) return;

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
      handleSubmit: async () => {
        const { currentGuess, secretWord, attempts, todayCompleted, wordList } =
          get();

        if (todayCompleted) return;

        // Check if all positions are filled
        if (get().getFilledPositions() === 5) {
          const word = currentGuess.join("");

          if (wordList.includes(word.toLowerCase())) {
            const newAttempts = attempts + 1;
            set({ attempts: newAttempts });

            if (word.toLowerCase() === secretWord.toLowerCase()) {
              set({
                isGameWon: true,
                showCongrats: true,
                todayCompleted: true,
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
        const {
          powerupAvailable,
          isGameWon,
          secretWord,
          disabledLetters,
          todayCompleted,
        } = get();

        if (todayCompleted || !powerupAvailable || isGameWon) return;

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
          const randomIndex = Math.floor(
            Math.random() * nonSecretLetters.length
          );
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
    }),
    {
      name: "word-finder-storage", // Local storage key
      partialize: (state) => ({
        // Only persist these fields
        todayCompleted: state.todayCompleted,
        gameDate: state.gameDate,
        attempts: state.attempts,
      }),
    }
  )
);

export default useGameStore;
