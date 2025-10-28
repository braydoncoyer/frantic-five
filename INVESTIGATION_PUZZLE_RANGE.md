# Investigation: Daily Puzzle Range Limited to A-D

**Date:** October 28, 2025
**Issue:** Daily puzzles appear to be limited to words alphabetically between A and D

## Summary

The issue is that the daily puzzle secret words are consistently falling within the alphabetical range A-D, which represents only about 24.6% of the available word dictionary. This investigation has identified that the problem originates from the **Supabase backend RPC function `create_daily_puzzle`**, which is not defined in this Git repository.

## Investigation Findings

### 1. Word Dictionary Analysis

The local word list (`src/utils/wordList.ts`) contains **10,656 words** properly distributed across the entire alphabet:

| Letter Range | Word Count | Percentage |
|--------------|------------|------------|
| A-D | 2,630 | 24.6% |
| E-Z | 8,026 | 75.4% |

**Distribution by Letter:**
```
a: 596    n: 288
b: 736    o: 221
c: 724    p: 717
d: 574    q: 55
e: 231    r: 523
f: 462    s: 1,199
g: 523    t: 666
h: 420    u: 156
i: 131    v: 199
j: 182    w: 330
k: 356    x: 16
l: 489    y: 175
m: 586    z: 101
```

The local word list is **properly distributed** and includes words from A-Z, so the issue is **not** in the client-side codebase.

### 2. Puzzle Generation Flow

The daily puzzle is created through this flow:

```
getTodaysWord() (src/app/actions.ts:24-185)
  └─> Calls Supabase RPC: create_daily_puzzle(target_date)
      └─> Returns: daily_words row with word_id (secret word)
```

**Key code location:** `src/app/actions.ts:64`
```typescript
await adminSupabase.rpc("create_daily_puzzle", { target_date: clientDate });
```

### 3. Root Cause

The `create_daily_puzzle` function is a **PostgreSQL function stored in Supabase**, not in this Git repository. This function is responsible for:
- Selecting a random word from the `words` table
- Creating a new entry in the `daily_words` table
- Selecting appropriate initial top and bottom boundary words

### 4. Possible Causes

The limitation to A-D range could be caused by:

#### A. **Limited Word Selection Query**
The RPC function might contain SQL that limits word selection:
```sql
-- Potential problematic queries:
SELECT * FROM words WHERE word < 'E' ORDER BY RANDOM() LIMIT 1;
SELECT * FROM words LIMIT 2630;  -- Only first 2630 words (A-D range)
SELECT * FROM words WHERE id < 2631 ORDER BY RANDOM() LIMIT 1;
```

#### B. **Incomplete Database Seeding**
The Supabase `words` table might only contain A-D words, despite the local codebase having all words A-Z.

#### C. **Incorrect Random Selection**
The random selection logic might not be properly randomizing across the full word range.

## How to Fix

### Step 1: Access the Supabase SQL Function

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Query to view the function definition:
```sql
SELECT pg_get_functiondef('create_daily_puzzle'::regproc);
```

### Step 2: Check the Words Table

Verify what words are actually in the database:
```sql
-- Count total words
SELECT COUNT(*) FROM words;

-- Check distribution by first letter
SELECT
  LEFT(word, 1) as first_letter,
  COUNT(*) as count
FROM words
GROUP BY LEFT(word, 1)
ORDER BY first_letter;

-- Check if there are any words after 'D'
SELECT COUNT(*) FROM words WHERE word >= 'E';
```

### Step 3: Review the create_daily_puzzle Function

Look for patterns in the function definition such as:
- `WHERE word < 'E'` - Filters to A-D only
- `LIMIT 2630` - Restricts to first 2,630 rows
- `WHERE id < 2631` - Restricts by ID range
- Incorrect random selection logic

### Step 4: Fix the Function

The function should select from the **entire word range**:
```sql
-- Example correct implementation
CREATE OR REPLACE FUNCTION create_daily_puzzle(target_date date)
RETURNS void AS $$
DECLARE
  selected_word_id integer;
  top_word_id integer;
  bottom_word_id integer;
BEGIN
  -- Select a random word from the FULL range
  SELECT id INTO selected_word_id
  FROM words
  ORDER BY RANDOM()  -- Ensure proper randomization
  LIMIT 1;

  -- Select appropriate boundary words...
  -- (rest of implementation)
END;
$$ LANGUAGE plpgsql;
```

### Step 5: Verify the Fix

After updating the function:
1. Create a new daily puzzle manually (or wait for the next day)
2. Check the `daily_words` table:
```sql
SELECT
  dw.date,
  w.word,
  LEFT(w.word, 1) as first_letter
FROM daily_words dw
JOIN words w ON dw.word_id = w.id
ORDER BY dw.date DESC
LIMIT 10;
```

## Files Investigated

- `src/app/actions.ts` - Server actions calling `create_daily_puzzle`
- `src/utils/wordList.ts` - Local word dictionary (properly distributed A-Z)
- `src/lib/supabase/database.types.ts` - Database schema types
- `src/app/store/useGameStore.ts` - Game state management

## Next Steps

1. **Access Supabase Dashboard** and inspect the `create_daily_puzzle` function
2. **Verify the words table** contains all 10,656 words from A-Z
3. **Update the function** to select from the full word range
4. **Test the fix** by generating a new daily puzzle
5. **Monitor results** over several days to ensure proper distribution

## Additional Notes

- The local codebase is **not the problem** - it has proper A-Z word distribution
- The issue is **entirely in the Supabase backend**
- The `create_daily_puzzle` RPC function is **not version-controlled** in this repository
- Database functions in Supabase are managed through the dashboard or Supabase CLI

## Contact

If you need help accessing or modifying the Supabase function, you may need to:
- Check your Supabase project dashboard at https://supabase.com
- Use the Supabase CLI: `supabase functions list`
- Review Supabase migration files (if using migrations)
