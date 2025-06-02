// app/page.tsx
import { Suspense } from "react";
import Game from "./components/Game";
import { getAllWords } from "./actions";
import wordList from "../utils/wordList";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  // Try to fetch all words from Supabase for client-side validation
  let words: string[] = [];
  try {
    words = await getAllWords();
    console.log(`Fetched ${words.length} words from Supabase`);
    console.log("Sample Supabase words:", words.slice(0, 5));
  } catch (error) {
    console.error("Error fetching words from Supabase:", error);
    // Fallback to local word list if Supabase fails
    words = wordList;
    console.log(`Using local word list with ${words.length} words`);
    console.log("Sample local words:", words.slice(0, 5));
  }

  // If no words from Supabase, use the local list
  if (words.length === 0) {
    words = wordList;
    console.log(`Using local word list with ${words.length} words`);
    console.log("Sample local words:", words.slice(0, 5));
  }

  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            Loading...
          </div>
        }
      >
        <Game />
      </Suspense>

      {/* Inject the word list for client-side validation */}
      <script
        id="word-list-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(words),
        }}
      />
    </main>
  );
}
