// store/useGameStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getTodaysWord, getInitialWords, getAllWords } from "@/app/actions";
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
  showLetterColors: boolean;
  autoFilledPositions: boolean[]; // Track which positions are auto-filled

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
  calculateAutoFillLetters: () => string[]; // New function to calculate auto-fill letters
  applyAutoFill: () => void; // New function to apply auto-fill
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
      showHowToPlay: false,
      disabledLetters: [],
      isLoading: true,
      todayCompleted: false,
      gameDate: null,
      wordList: [],
      error: null,
      feedbackMessage: null,
      updatedTopWord: false,
      updatedBottomWord: false,
      showLetterColors: false,
      autoFilledPositions: [false, false, false, false, false],

      // Set the word list
      setWordList: (words: string[]) => {
        console.log(`Setting word list with ${words.length} words`);
        set({ wordList: words });
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Clear feedback message
      clearFeedback: () => set({ feedbackMessage: null }),

      // Calculate which letters should be auto-filled based on top and bottom words
      calculateAutoFillLetters: () => {
        const { topWord, bottomWord } = get();
        const autoFillLetters = ["", "", "", "", ""];
        
        console.log(`Calculating auto-fill letters for: ${topWord} - ${bottomWord}`);
        
        // Find the longest common prefix between top and bottom words
        let commonPrefixLength = 0;
        for (let i = 0; i < 5; i++) {
          if (topWord[i] === bottomWord[i]) {
            commonPrefixLength = i + 1;
          } else {
            break;
          }
        }
        
        // Auto-fill the common prefix
        for (let i = 0; i < commonPrefixLength; i++) {
          autoFillLetters[i] = topWord[i];
        }
        
        console.log(`Auto-fill letters: ${autoFillLetters.join('')} (common prefix length: ${commonPrefixLength})`);
        return autoFillLetters;
      },

      // Apply auto-fill to the current guess
      applyAutoFill: () => {
        const { currentGuess, autoFilledPositions } = get();
        const autoFillLetters = get().calculateAutoFillLetters();
        const newGuess = [...currentGuess];
        const newAutoFilledPositions = [...autoFilledPositions];
        let hasChanges = false;
        
        console.log(`Applying auto-fill. Current guess: ${currentGuess.join('')}, Auto-fill letters: ${autoFillLetters.join('')}`);
        
        // Apply auto-fill letters to empty positions
        for (let i = 0; i < 5; i++) {
          if (autoFillLetters[i] && newGuess[i] === "") {
            newGuess[i] = autoFillLetters[i];
            newAutoFilledPositions[i] = true;
            hasChanges = true;
            console.log(`Auto-filled position ${i} with letter: ${autoFillLetters[i]}`);
          }
        }
        
        if (hasChanges) {
          console.log(`Auto-fill applied. New guess: ${newGuess.join('')}`);
          set({ 
            currentGuess: newGuess,
            autoFilledPositions: newAutoFilledPositions
          });
        } else {
          console.log('No auto-fill changes needed');
        }
      },

      // Initialize game
      initializeGame: async () => {
        // Check if this is the user's first visit
        const hasSeenHowToPlay = localStorage.getItem("has-seen-how-to-play");
        if (!hasSeenHowToPlay) {
          set({ showHowToPlay: true });
          localStorage.setItem("has-seen-how-to-play", "true");
        }

        set({ 
          isLoading: true, 
          error: null,
          updatedTopWord: false,
          updatedBottomWord: false,
          isGameOver: false
        });

        try {
          // Get today's date from client
          const currentDate = new Date().toISOString().split("T")[0];
          const { gameDate: storedDate, todayCompleted } = get();

          // Check if we have saved words in local storage for today
          const savedWords = localStorage.getItem(`frantic-five-words-${currentDate}`);
          let savedState = null;
          
          if (savedWords) {
            try {
              savedState = JSON.parse(savedWords);
              // If we have saved state and either word has been updated, use it
              if (savedState.updatedTopWord || savedState.updatedBottomWord) {
                console.log("Using saved words from local storage:", savedState);
                const { word, error } = await getTodaysWord();
                if (error) {
                  throw new Error(error);
                }
                setupGameWithInitialWords(word || "", savedState.topWord, savedState.bottomWord, currentDate);
                set({ 
                  updatedTopWord: savedState.updatedTopWord,
                  updatedBottomWord: savedState.updatedBottomWord
                });
                
                // Apply auto-fill after restoring saved words
                get().applyAutoFill();
                return;
              }
            } catch (error) {
              console.error("Error parsing saved words:", error);
            }
          }

          // If no saved state or no updates, proceed with normal initialization
          // Get words from Supabase
          console.log("Fetching words from Supabase...");
          const supabaseWords = await getAllWords();
          console.log(`Fetched ${supabaseWords.length} words from Supabase`);

          // Combine Supabase words with local word list, removing duplicates
          const combinedWordList = [...new Set([...supabaseWords, ...localWordList])].sort();
          console.log(`Combined word list has ${combinedWordList.length} unique words`);
          set({ wordList: combinedWordList });

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
          }

          // Get today's word and initial words from the server
          console.log("Fetching today's word and initial words...");
          const [{ word, error: wordError }, { topWord, bottomWord }] = await Promise.all([
            getTodaysWord(),
            getInitialWords()
          ]);

          if (wordError) {
            throw new Error(wordError);
          }
            
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
              updatedTopWord: false,
              updatedBottomWord: false,
              autoFilledPositions: [false, false, false, false, false],
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
              updatedTopWord: false,
              updatedBottomWord: false,
              autoFilledPositions: [false, false, false, false, false],
            });
          }
          
          // Apply auto-fill after setting up the game
          get().applyAutoFill();
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
                autoFilledPositions: [false, false, false, false, false],
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
                autoFilledPositions: [false, false, false, false, false],
              });
            }
            
            // Apply auto-fill after setting up the game
            get().applyAutoFill();
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
              autoFilledPositions: [false, false, false, false, false],
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
              autoFilledPositions: [false, false, false, false, false],
            });
          }
          
          // Apply auto-fill after setting up the game
          get().applyAutoFill();
        }
      },

      // Handle key press
      handleKeyPress: (key: string) => {
        const { isGameWon, disabledLetters, todayCompleted, autoFilledPositions } =
          get();

        if (todayCompleted || isGameWon || disabledLetters.includes(key)) {
          return;
        }

        set((state) => {
          const newGuess = [...state.currentGuess];
          for (let i = 0; i < 5; i++) {
            if (newGuess[i] === "" && !autoFilledPositions[i]) {
              newGuess[i] = key;
              return { currentGuess: newGuess };
            }
          }
          return {}; // All positions filled
        });
      },

      // Handle backspace
      handleBackspace: () => {
        const { todayCompleted, isGameWon, autoFilledPositions } = get();

        if (todayCompleted || isGameWon) return;

        set((state) => {
          const newGuess = [...state.currentGuess];
          for (let i = 4; i >= 0; i--) {
            if (newGuess[i] !== "" && !autoFilledPositions[i]) {
              newGuess[i] = "";
              return { currentGuess: newGuess };
            }
          }
          return {}; // All positions empty or auto-filled
        });
      },

      // Remove letter at specific index
      removeLetter: (index: number) => {
        const { todayCompleted, isGameWon, autoFilledPositions } = get();

        if (todayCompleted || isGameWon || autoFilledPositions[index]) return;

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
                feedbackMessage: null,
              });
              // Reapply auto-fill after clearing the error
              get().applyAutoFill();
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
                feedbackMessage: null,
              });
              // Reapply auto-fill after clearing the error
              get().applyAutoFill();
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
                feedbackMessage: null,
              });
              // Reapply auto-fill after clearing the error
              get().applyAutoFill();
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
                autoFilledPositions: [false, false, false, false, false],
              });
              // Save updated words to local storage (excluding secret word)
              const currentDate = new Date().toISOString().split("T")[0];
              localStorage.setItem(`frantic-five-words-${currentDate}`, JSON.stringify({
                topWord: word,
                bottomWord,
                updatedTopWord: true,
                updatedBottomWord: get().updatedBottomWord
              }));
              
              // Apply auto-fill after updating the top word
              get().applyAutoFill();
            } else {
              set({
                bottomWord: word,
                currentGuess: ["", "", "", "", ""],
                updatedBottomWord: true,
                autoFilledPositions: [false, false, false, false, false],
              });
              // Save updated words to local storage (excluding secret word)
              const currentDate = new Date().toISOString().split("T")[0];
              localStorage.setItem(`frantic-five-words-${currentDate}`, JSON.stringify({
                topWord,
                bottomWord: word,
                updatedTopWord: get().updatedTopWord,
                updatedBottomWord: true
              }));
              
              // Apply auto-fill after updating the bottom word
              get().applyAutoFill();
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
      name: "frantic-five-storage", // Local storage key
      partialize: (state) => {
        // Check if it's a new day by comparing with current date
        const currentDate = new Date().toISOString().split("T")[0];
        
        // If it's a new day, clear the storage
        if (state.gameDate !== currentDate) {
          // Clear the storage by returning an empty object
          localStorage.removeItem("frantic-five-storage");
          return {};
        }
        
        // Otherwise, persist the current state
        return {
          todayCompleted: state.todayCompleted,
          gameDate: state.gameDate,
          attempts: state.attempts,
          showCongrats: state.showCongrats,
          isGameWon: state.isGameWon,
          autoFilledPositions: state.autoFilledPositions,
          currentGuess: state.currentGuess,
        };
      },
      // Add version to force clear on new day
      version: 1,
      onRehydrateStorage: () => (state) => {
        // Check if it's a new day when rehydrating
        if (state) {
          const currentDate = new Date().toISOString().split("T")[0];
          if (state.gameDate !== currentDate) {
            // Clear the storage if it's a new day
            localStorage.removeItem("frantic-five-storage");
            // Reset the state
            useGameStore.setState({
              topWord: "",
              bottomWord: "",
              secretWord: "",
              currentGuess: ["", "", "", "", ""],
              isGameWon: false,
              isGameOver: false,
              invalidWord: false,
              attempts: 0,
              showCongrats: false,
              showHowToPlay: false, // Don't show how to play on new day
              disabledLetters: [],
              isLoading: true,
              todayCompleted: false,
              gameDate: currentDate,
              wordList: [],
              error: null,
              feedbackMessage: null,
              updatedTopWord: false,
              updatedBottomWord: false,
              showLetterColors: false,
              autoFilledPositions: [false, false, false, false, false],
            });
          } else {
            // Same day, restore the saved state
            useGameStore.setState({
              currentGuess: state.currentGuess || ["", "", "", "", ""],
              autoFilledPositions: state.autoFilledPositions || [false, false, false, false, false],
              attempts: state.attempts || 0,
              showCongrats: state.showCongrats || false,
              isGameWon: state.isGameWon || false,
              todayCompleted: state.todayCompleted || false,
            });
            
            // Apply auto-fill after restoring state (but only if game is not completed)
            if (!state.todayCompleted && !state.isGameWon) {
              const store = useGameStore.getState();
              if (store.topWord && store.bottomWord) {
                store.applyAutoFill();
              }
            }
          }
        }
      },
    }
  )
);

export default useGameStore;
