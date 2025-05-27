// app/admin/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminPage() {
  const [newWords, setNewWords] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Split the input by commas, new lines, or spaces
    const wordsArray = newWords
      .split(/[\n,\s]+/)
      .map((word) => word.trim().toLowerCase())
      .filter((word) => word.length === 5); // Only keep 5-letter words

    if (wordsArray.length === 0) {
      setMessage({
        text: "No valid 5-letter words provided",
        type: "error",
      });
      setIsLoading(false);
      return;
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-indigo-700">
          Word Finder Admin
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="newWords"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Add New 5-Letter Words
            </label>
            <textarea
              id="newWords"
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter 5-letter words separated by commas, spaces, or new lines"
              value={newWords}
              onChange={(e) => setNewWords(e.target.value)}
            />
            <p className="mt-1 text-sm text-gray-500">
              Only 5-letter words will be added. Words will be automatically
              converted to lowercase.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            }`}
          >
            {isLoading ? "Adding Words..." : "Add Words"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            <li>Add new 5-letter words to the game dictionary</li>
            <li>Words should be common English words</li>
            <li>Avoid slurs, offensive terms, or obscure words</li>
            <li>
              Words will be available for selection as the daily word once added
            </li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Return to Game
          </Link>
        </div>
      </div>
    </div>
  );
}
