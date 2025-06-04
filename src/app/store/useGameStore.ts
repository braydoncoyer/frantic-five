// store/useGameStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getTodaysWord, getRandomWord, getInitialWords, getAllWords } from "@/app/actions";
import { wordList as localWordList } from "@/utils/wordList";

interface GameState {
  // Game state
  topWord: string;
  bottomWord: string;
  secretWord: string;
  currentGuess: string[];
  isGameWon: boolean;
  isGameOver: boolean;
  invalidWord: boolean;
  attempts: number;
  showCongrats: boolean;
  showHowToPlay: boolean;
  disabledLetters: string[];
  isLoading: boolean;
  todayCompleted: boolean;
  gameDate: string | null;
  wordList: string[];
  error: string | null;
  feedbackMessage: string | null;
  updatedTopWord: boolean;
  updatedBottomWord: boolean;

  // Actions
  initializeGame: () => Promise<void>;
  handleKeyPress: (key: string) => void;
  handleBackspace: () => void;
  removeLetter: (index: number) => void;
  getFilledPositions: () => number;
  handleSubmit: () => Promise<void>;
  closeCongratsModal: () => void;
  closeHowToPlayModal: () => void;
  openHowToPlayModal: () => void;
  clearError: () => void;
  setWordList: (words: string[]) => void;
  clearFeedback: () => void;
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
      isGameOver: false,
      invalidWord: false,
      attempts: 0,
      showCongrats: false,
      showHowToPlay: true,
      disabledLetters: [],
      isLoading: true,
      todayCompleted: false,
      gameDate: null,
      wordList: [],
      error: null,
      feedbackMessage: null,
      updatedTopWord: false,
      updatedBottomWord: false,

      // Set the word list
      setWordList: (words: string[]) => {
        console.log(`Setting word list with ${words.length} words`);
        set({ wordList: words });
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Clear feedback message
      clearFeedback: () => set({ feedbackMessage: null }),

      // Initialize game
      initializeGame: async () => {
        set({ 
          isLoading: true, 
          error: null,
          updatedTopWord: false,
          updatedBottomWord: false,
          isGameOver: false
        });

        try {
          // Get words from Supabase
          console.log("Fetching words from Supabase...");
          const supabaseWords = await getAllWords();
          console.log(`Fetched ${supabaseWords.length} words from Supabase`);

          // Combine Supabase words with local word list, removing duplicates
          const combinedWordList = [...new Set([...supabaseWords, ...localWordList])].sort();
          console.log(`Combined word list has ${combinedWordList.length} unique words`);
          set({ wordList: combinedWordList });

          // Get today's date (or yesterday's if game already completed)
          const currentDate = new Date().toISOString().split("T")[0];
          const { gameDate: storedDate, todayCompleted } = get();

          // Get today's word and initial words from the server
          console.log("Fetching today's word and initial words...");
          const [{ word, error }, { topWord, bottomWord }] = await Promise.all([
            getTodaysWord(),
            getInitialWords()
          ]);

          // If it's a new day, reset all game state
          if (storedDate !== currentDate) {
            console.log("New day detected, resetting game state");
            set({ 
              isLoading: true, 
              error: null,
              updatedTopWord: false,
              updatedBottomWord: false,
              isGameOver: false,
              showCongrats: false,
              todayCompleted: false,
              attempts: 0,
              isGameWon: false,
              currentGuess: ["", "", "", "", ""],
              disabledLetters: [],
              gameDate: currentDate
            });
            
            // If we have initial words from Supabase, use them
            if (topWord && bottomWord) {
              console.log("Using initial words from Supabase:", { topWord, bottomWord });
              setupGameWithInitialWords(word || "", topWord, bottomWord, currentDate);
              // Save initial words to local storage (excluding secret word)
              localStorage.setItem(`frantic-five-words-${currentDate}`, JSON.stringify({
                topWord,
                bottomWord,
                updatedTopWord: false,
                updatedBottomWord: false
              }));
            } else {
              // Fallback to the old method of selecting initial words
              console.log("Falling back to local initial word selection");
              setupGame(word || "", currentDate, localWordList);
            }
            return;
          }

          // If game already completed for today, just restore state
          if (storedDate === currentDate && todayCompleted) {
            console.log("Game already completed for today, restoring state");
            set({
              isLoading: false,
              secretWord: word || "",
              currentGuess: word ? [...word] : ["", "", "", "", ""],
              showCongrats: true,
            });
            return;
          }

          // Check if we have saved words in local storage
          const savedWords = localStorage.getItem(`frantic-five-words-${currentDate}`);
          if (savedWords) {
            try {
              const { topWord: savedTopWord, bottomWord: savedBottomWord, updatedTopWord, updatedBottomWord } = JSON.parse(savedWords);
              if (savedTopWord && savedBottomWord) {
                console.log("Restoring saved words from local storage:", { savedTopWord, savedBottomWord });
                setupGameWithInitialWords(word || "", savedTopWord, savedBottomWord, currentDate);
                // Restore the update flags
                set({ updatedTopWord, updatedBottomWord });
                return;
              }
            } catch (error) {
              console.error("Error parsing saved words:", error);
            }
          }

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
            setupGame(fallbackWord, currentDate, localWordList);
            return;
          }

          // Successfully got daily word
          console.log("Using daily word:", word);
          
          // If we have initial words from Supabase, use them
          if (topWord && bottomWord) {
            console.log("Using initial words from Supabase:", { topWord, bottomWord });
            setupGameWithInitialWords(word, topWord, bottomWord, currentDate);
            // Save initial words to local storage (excluding secret word)
            localStorage.setItem(`frantic-five-words-${currentDate}`, JSON.stringify({
              topWord,
              bottomWord,
              updatedTopWord: false,
              updatedBottomWord: false
            }));
          } else {
            // Fallback to the old method of selecting initial words
            console.log("Falling back to local initial word selection");
            setupGame(word, currentDate, localWordList);
          }
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

        // Helper function to set up the game with initial words from Supabase
        function setupGameWithInitialWords(
          secretWord: string,
          initialTopWord: string,
          initialBottomWord: string,
          date: string
        ) {
          const { gameDate: storedDate } = get();
          const isNewDay = storedDate !== date;

          // If it's a new day, reset the game state
          if (isNewDay) {
            set({
              topWord: initialTopWord,
              secretWord,
              bottomWord: initialBottomWord,
              currentGuess: ["", "", "", "", ""],
              isGameWon: false,
              invalidWord: false,
              attempts: 0,
              showCongrats: false,
              disabledLetters: [],
              gameDate: date,
              isLoading: false,
              todayCompleted: false,
              error: null,
            });
          } else {
            // Same day, just update the words and ensure game state is correct
            set({
              topWord: initialTopWord,
              secretWord,
              bottomWord: initialBottomWord,
              isLoading: false,
              error: null,
              // Reset game state if it was previously won
              isGameWon: false,
              showCongrats: false,
              currentGuess: ["", "", "", "", ""],
            });
          }
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
                gameDate: date,
                isLoading: false,
                todayCompleted: false,
                error: null,
              });
            } else {
              // Same day, just update the words and ensure game state is correct
              set({
                topWord,
                secretWord,
                bottomWord,
                isLoading: false,
                error: null,
                // Reset game state if it was previously won
                isGameWon: false,
                showCongrats: false,
                currentGuess: ["", "", "", "", ""],
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
              gameDate: date,
              isLoading: false,
              todayCompleted: false,
              error: null,
            });
          } else {
            // Same day, just update the words and ensure game state is correct
            set({
              topWord,
              secretWord,
              bottomWord,
              isLoading: false,
              error: null,
              // Reset game state if it was previously won
              isGameWon: false,
              showCongrats: false,
              currentGuess: ["", "", "", "", ""],
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
        const { currentGuess, topWord, bottomWord, secretWord, attempts, wordList, todayCompleted } = get();

        if (todayCompleted) return;

        // Check if all positions are filled
        if (get().getFilledPositions() === 5) {
          const word = currentGuess.join("").toLowerCase();
          console.log('Validating word:', word);
          console.log('Word list length:', wordList.length);
          console.log('Word exists in list:', wordList.includes(word));

          if (!wordList.includes(word)) {
            // Word not in dictionary
            set({ 
              invalidWord: true,
              feedbackMessage: "Word not found in dictionary"
            });
            setTimeout(() => {
              set({
                invalidWord: false,
                currentGuess: ["", "", "", "", ""],
                feedbackMessage: null
              });
            }, 1500);
            return;
          }

          // Check if word is within valid range
          if (word <= topWord) {
            // Word comes before top word
            set({ 
              invalidWord: true,
              feedbackMessage: "Word must come after the top word"
            });
            setTimeout(() => {
              set({
                invalidWord: false,
                currentGuess: ["", "", "", "", ""],
                feedbackMessage: null
              });
            }, 1500);
            return;
          }

          if (word >= bottomWord) {
            // Word comes after bottom word
            set({ 
              invalidWord: true,
              feedbackMessage: "Word must come before the bottom word"
            });
            setTimeout(() => {
              set({
                invalidWord: false,
                currentGuess: ["", "", "", "", ""],
                feedbackMessage: null
              });
            }, 1500);
            return;
          }

          const newAttempts = attempts + 1;
          set({ attempts: newAttempts });

          if (word === secretWord.toLowerCase()) {
            set({
              isGameWon: true,
              showCongrats: true,
              todayCompleted: true,
              currentGuess: secretWord.split("")
            });
          } else {
            // Determine if guess goes above or below the secret word
            if (word < secretWord.toLowerCase()) {
              set({
                topWord: word,
                currentGuess: ["", "", "", "", ""],
                updatedTopWord: true,
              });
              // Save updated words to local storage (excluding secret word)
              const currentDate = new Date().toISOString().split("T")[0];
              localStorage.setItem(`frantic-five-words-${currentDate}`, JSON.stringify({
                topWord: word,
                bottomWord,
                updatedTopWord: true,
                updatedBottomWord: get().updatedBottomWord
              }));
            } else {
              set({
                bottomWord: word,
                currentGuess: ["", "", "", "", ""],
                updatedBottomWord: true,
              });
              // Save updated words to local storage (excluding secret word)
              const currentDate = new Date().toISOString().split("T")[0];
              localStorage.setItem(`frantic-five-words-${currentDate}`, JSON.stringify({
                topWord,
                bottomWord: word,
                updatedTopWord: get().updatedTopWord,
                updatedBottomWord: true
              }));
            }
          }
        }
      },

      // Close congrats modal
      closeCongratsModal: () => set({ showCongrats: false }),

      // Close how to play modal
      closeHowToPlayModal: () => set({ showHowToPlay: false }),

      // Open how to play modal
      openHowToPlayModal: () => set({ showHowToPlay: true }),
    }),
    {
      name: "word-finder-storage", // Local storage key
      partialize: (state) => ({
        // Only persist these fields
        todayCompleted: state.todayCompleted,
        gameDate: state.gameDate,
        attempts: state.attempts,
        showHowToPlay: state.showHowToPlay,
        showCongrats: state.showCongrats,
        isGameWon: state.isGameWon,
      }),
    }
  )
);

export default useGameStore;
