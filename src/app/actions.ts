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
      return { word: null, error: "Configuration error" };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current date in database timezone
    const { data: dateData } = await supabase.rpc("get_database_date");
    console.log("Database date:", dateData);

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
      return { word: null, error: error.message };
    }

    if (!data || !data.word) {
      console.error("No word found for today");
      return { word: null, error: "No word found" };
    }

    return { word: data.word.word, error: null };
  } catch (error) {
    console.error("Exception in getTodaysWord:", error);
    return { word: null, error: "Server error" };
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

    // Get any random word
    const { data, error } = await supabase
      .from("words")
      .select("word")
      .order("random()")
      .limit(1)
      .single();

    if (error || !data) {
      console.error("Error fetching random word:", error);
      return { word: "table", error: error?.message }; // Hardcoded fallback
    }

    return { word: data.word, error: null };
  } catch (error) {
    console.error("Exception in getRandomWord:", error);
    return { word: "house", error: "Server error" }; // Hardcoded fallback
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

    // Get all words
    const { data, error } = await supabase.from("words").select("word");

    if (error || !data) {
      console.error("Error fetching words:", error);
      return [];
    }

    return data.map((item) => item.word);
  } catch (error) {
    console.error("Exception in getAllWords:", error);
    return [];
  }
}
