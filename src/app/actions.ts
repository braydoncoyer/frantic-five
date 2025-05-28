// app/actions.ts
"use server";

import { createClient } from "@supabase/supabase-js";

// Simple function to get today's word from Supabase
export async function getTodaysWord() {
  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return {
        word: null,
        error: "Configuration error",
        serverDate: null,
        debugInfo: null,
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get timezone debug info
    const { data: tzDebugData, error: tzDebugError } = await supabase.rpc(
      "debug_all_timezone_info"
    );
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
    const { data: allDailyWords, error: allDailyWordsError } = await supabase
      .from("daily_words")
      .select(
        `
        date,
        word:words!inner(word)
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
        word:words!inner(word)
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
        const { data: setWordResult, error: setWordError } = await supabase.rpc(
          "set_central_time_daily_word"
        );

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

        // Try to get the word again
        const { data: retryData, error: retryError } = await supabase
          .from("daily_words")
          .select(
            `
            date,
            word:words!inner(word)
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
          word: retryData.word.word,
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
      word: data.word.word,
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
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { word: "clock", error: "Configuration error" }; // Hardcoded fallback
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current date from the server
    const { data: dateData } = await supabase.rpc("get_central_time_date");
    const serverDate = dateData || new Date().toISOString().split("T")[0];

    // Get any random word
    const { data, error } = await supabase
      .from("words")
      .select("word")
      .order("random()")
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
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return [];
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

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
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { success: false, message: "Missing Supabase credentials" };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

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
