// app/actions.ts
"use server";

import { createClient } from "@supabase/supabase-js";

// Helper to get the right Supabase client based on operation type
function getSupabaseClient(isAdminOperation = false) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (isAdminOperation) {
    // Use service role for admin operations (bypasses RLS)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) throw new Error("Missing service role key");
    return createClient(supabaseUrl!, serviceKey!);
  } else {
    // Use anon key for regular operations
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey) throw new Error("Missing anon key");
    return createClient(supabaseUrl!, anonKey!);
  }
}

// Simple function to get today's word from Supabase
export async function getTodaysWord() {
  try {
    // Create Supabase client - READ operation, but calls create_daily_puzzle if needed
    const supabase = getSupabaseClient(false); // Start with anon for reads
    const adminSupabase = getSupabaseClient(true); // Admin client for mutations

    // Get client's local date
    const clientDate = new Date().toISOString().split("T")[0];
    console.log("Client date:", clientDate);

    // Get timezone debug info
    const { data: tzDebugData } = await supabase.rpc("debug_all_timezone_info");
    console.log("Timezone debug info:", tzDebugData);

    // Get all daily words for debugging
    const { data: allDailyWords } = await supabase
      .from("daily_words")
      .select(
        `
        date,
        word:words!daily_words_word_id_fkey(word)
      `
      )
      .order("date", { ascending: false })
      .limit(5);

    console.log("Recent daily words:", allDailyWords);

    // Simple raw SQL query to get today's word
    const { data, error } = await supabase
      .from("daily_words")
      .select(
        `
        date,
        word:words!daily_words_word_id_fkey(word)
      `
      )
      .eq("date", clientDate)
      .single();

    if (error) {
      console.error("Error fetching daily word:", error);
      // If no word found for today, try to set it
      if (error.code === "PGRST116") {
        // No rows found
        console.log("No word found for today, trying to set it...");
        // USE ADMIN CLIENT for the mutation
        const { data: setWordResult, error: setWordError } =
          await adminSupabase.rpc("create_daily_puzzle", { target_date: clientDate });

        if (setWordError) {
          console.error("Error setting daily word:", setWordError);
          return {
            word: null,
            error: "Could not set daily word: " + setWordError.message,
            serverDate: clientDate,
            debugInfo: {
              tzInfo: tzDebugData,
              recentWords: allDailyWords,
              setWordAttempt: "Failed: " + setWordError.message,
            },
          };
        }

        console.log("Set word result:", setWordResult);

        type RetryWordResponse = {
          date: string;
          word: {
            word: string;
          };
        };

        // Try to get the word again (can use regular client for read)
        const { data: retryData, error: retryError } = await supabase
          .from("daily_words")
          .select(
            `
            date,
            word:words!daily_words_word_id_fkey(word)
          `
          )
          .eq("date", clientDate)
          .single();

        if (retryError || !retryData || !retryData.word) {
          console.error("Error fetching daily word after setting:", retryError);
          return {
            word: null,
            error: "Could not get word after setting",
            serverDate: clientDate,
            debugInfo: {
              tzInfo: tzDebugData,
              recentWords: allDailyWords,
              setWordAttempt: setWordResult,
            },
          };
        }

        return {
          word: (retryData as unknown as RetryWordResponse).word.word,
          error: null,
          serverDate: clientDate,
          debugInfo: {
            tzInfo: tzDebugData,
            recentWords: allDailyWords,
            setWordAttempt: setWordResult,
          },
        };
      }

      return {
        word: null,
        error: error.message,
        serverDate: clientDate,
        debugInfo: {
          tzInfo: tzDebugData,
          recentWords: allDailyWords,
        },
      };
    }

    type DailyWordResponse = {
      date: string;
      word: {
        word: string;
      };
    };

    return {
      word: (data as unknown as DailyWordResponse).word.word,
      error: null,
      serverDate: clientDate,
      debugInfo: {
        tzInfo: tzDebugData,
        recentWords: allDailyWords,
      },
    };
  } catch (error) {
    console.error("Exception in getTodaysWord:", error);
    return {
      word: null,
      error: "Server error",
      serverDate: null,
      debugInfo: null,
    };
  }
}

// Fallback function to get any random word
export async function getRandomWord() {
  try {
    // READ operation - use anon client
    const supabase = getSupabaseClient(false);

    // Get client's local date
    const clientDate = new Date().toISOString().split("T")[0];

    // Get any random word
    const { data, error } = await supabase
      .from("words")
      .select("word")
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error("Error fetching random word:", error);
      return { word: "table", error: error?.message, serverDate: clientDate }; // Hardcoded fallback
    }

    return { word: data.word, error: null, serverDate: clientDate };
  } catch (error) {
    console.error("Exception in getRandomWord:", error);
    return { word: "house", error: "Server error", serverDate: null }; // Hardcoded fallback
  }
}

// Get all words for validation
export async function getAllWords() {
  try {
    // READ operation - use anon client
    const supabase = getSupabaseClient(false);

    // Get all words with pagination
    let allWords: string[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from("words")
        .select("word")
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error("Error fetching words:", error);
        break;
      }

      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        allWords = [...allWords, ...data.map((item) => item.word)];
        page++;
      }
    }

    return allWords;
  } catch (error) {
    console.error("Exception in getAllWords:", error);
    return [];
  }
}

// Admin function to set today's word manually
export async function setTodaysWord() {
  try {
    // MUTATION operation - use admin client
    const supabase = getSupabaseClient(true);

    // Get client's local date
    const clientDate = new Date().toISOString().split("T")[0];

    // Call the create_daily_puzzle function with the client's date
    const { data, error } = await supabase.rpc("create_daily_puzzle", { target_date: clientDate });

    if (error) {
      console.error("Error setting today's word:", error);
      return { success: false, message: error.message };
    }

    return { success: true, message: data };
  } catch (error) {
    console.error("Exception in setTodaysWord:", error);
    return { success: false, message: "Server error" };
  }
}

// Get the initial top and bottom words for today
export async function getInitialWords() {
  try {
    // READ operation - use anon client
    const supabase = getSupabaseClient(false);

    // Get client's local date
    const clientDate = new Date().toISOString().split("T")[0];
    console.log("Client date for initial words:", clientDate);

    // Get today's daily words with initial top and bottom words
    const { data, error } = await supabase
      .from("daily_words")
      .select(
        `
        date,
        word:words!daily_words_word_id_fkey(word),
        initial_top_word:words!daily_words_initial_top_word_id_fkey(word),
        initial_bottom_word:words!daily_words_initial_bottom_word_id_fkey(word)
      `
      )
      .eq("date", clientDate)
      .single();

    if (error) {
      console.error("Error fetching initial words:", error);
      return {
        topWord: null,
        bottomWord: null,
        error: error.message,
      };
    }

    type InitialWordsResponse = {
      date: string;
      word: { word: string };
      initial_top_word: { word: string };
      initial_bottom_word: { word: string };
    };

    if (!data || !data.initial_top_word || !data.initial_bottom_word) {
      return {
        topWord: null,
        bottomWord: null,
        error: "No initial words found for today",
      };
    }

    const typedData = data as unknown as InitialWordsResponse;

    return {
      topWord: typedData.initial_top_word.word,
      bottomWord: typedData.initial_bottom_word.word,
      error: null,
    };
  } catch (error) {
    console.error("Exception in getInitialWords:", error);
    return {
      topWord: null,
      bottomWord: null,
      error: "Server error",
    };
  }
}
