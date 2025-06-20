# Frantic Five

A daily word puzzle game where you guess a secret word by narrowing down the range between two boundary words.

## How to Play

1. You're given a top word and a bottom word
2. Guess a word that comes alphabetically between them
3. Your guess will become the new top or bottom word, narrowing the range
4. **Auto-fill Feature**: When the top and bottom words share common letters at the beginning, those letters are automatically filled in for you
5. Continue guessing until you find the secret word!

## Auto-Fill Feature

The game automatically fills in letters that are guaranteed to be correct based on the current top and bottom words. For example:

- If the top word is "TEARS" and the bottom word is "TEMPTS"
- Both words start with "TE", so "T" and "E" will be auto-filled in the first two positions
- Auto-filled letters are shown with a gray background and a blue checkmark
- You cannot edit or delete auto-filled letters

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Daily word puzzles
- Auto-fill functionality for common letters
- Visual feedback with color-coded letters
- Keyboard and mouse input support
- Persistent game state
- Responsive design

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Supabase](https://supabase.com) - Backend database

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
