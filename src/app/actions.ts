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
    return createClient(supabaseUrl, serviceKey);
  } else {
    // Use anon key for regular operations
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey) throw new Error("Missing anon key");
    return createClient(supabaseUrl, anonKey);
  }
}

// Simple function to get today's word from Supabase
export async function getTodaysWord() {
  try {
    // Create Supabase client - READ operation, but calls set_central_time_daily_word if needed
    const supabase = getSupabaseClient(false); // Start with anon for reads
    const adminSupabase = getSupabaseClient(true); // Admin client for mutations

    // Get timezone debug info
    const { data: tzDebugData } = await supabase.rpc("debug_all_timezone_info");
    console.log("Timezone debug info:", tzDebugData);

    // Get current date in Central Time timezone (properly converted)
    const { data: dateData, error: dateError } = await supabase.rpc(
      "get_central_time_date"
    );

    if (dateError || !dateData) {
      console.error("Error getting central time date:", dateError);
      return {
        word: null,
        error: "Failed to get server date",
        serverDate: null,
        debugInfo: tzDebugData,
      };
    }

    console.log("Server date (Central Time):", dateData);

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
      .eq("date", dateData)
      .single();

    if (error) {
      console.error("Error fetching daily word:", error);
      // If no word found for today, try to set it
      if (error.code === "PGRST116") {
        // No rows found
        console.log("No word found for today, trying to set it...");
        // USE ADMIN CLIENT for the mutation
        const { data: setWordResult, error: setWordError } =
          await adminSupabase.rpc("set_central_time_daily_word");

        if (setWordError) {
          console.error("Error setting daily word:", setWordError);
          return {
            word: null,
            error: "Could not set daily word: " + setWordError.message,
            serverDate: dateData,
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
          .eq("date", dateData)
          .single();

        if (retryError || !retryData || !retryData.word) {
          console.error("Error fetching daily word after setting:", retryError);
          return {
            word: null,
            error: "Could not get word after setting",
            serverDate: dateData,
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
          serverDate: dateData,
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
        serverDate: dateData,
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

    if (!data || !data.word) {
      console.error("No word found for today");
      return {
        word: null,
        error: "No word found",
        serverDate: dateData,
        debugInfo: {
          tzInfo: tzDebugData,
          recentWords: allDailyWords,
        },
      };
    }

    return {
      word: (data as unknown as DailyWordResponse).word.word,
      error: null,
      serverDate: dateData,
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

    // Get current date from the server
    const { data: dateData } = await supabase.rpc("get_central_time_date");
    const serverDate = dateData || new Date().toISOString().split("T")[0];

    // Get any random word
    const { data, error } = await supabase
      .from("words")
      .select("word")
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error("Error fetching random word:", error);
      return { word: "table", error: error?.message, serverDate }; // Hardcoded fallback
    }

    return { word: data.word, error: null, serverDate };
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

    // Call the set_daily_word function
    const { data, error } = await supabase.rpc("set_central_time_daily_word");

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

    // Get current date in Central Time
    const { data: dateData, error: dateError } = await supabase.rpc(
      "get_central_time_date"
    );

    if (dateError || !dateData) {
      console.error("Error getting central time date:", dateError);
      return {
        topWord: null,
        bottomWord: null,
        error: "Failed to get server date",
      };
    }

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
      .eq("date", dateData)
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
