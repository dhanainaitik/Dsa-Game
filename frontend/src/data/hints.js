/**
 * hints.js - Progressive Hint System Database
 *
 * Each question has 3 progressive hint tiers:
 * - LEVEL 1: Conceptual Direction (concept & intuition without revealing algorithm)
 * - LEVEL 2: Approach Guidance (algorithmic technique, observations, data structures)
 * - LEVEL 3: Implementation Guidance (structure, edge cases, complexity, pseudocode)
 */

export const HINTS_DATABASE = {
  // ==========================================
  // 1. LOGIC LAB CHALLENGES (Mapped by Topic ID & Title Slug)
  // ==========================================

  // Arrays: Find the Missing Number
  'arrays': {
    id: 'arrays',
    topicId: 'arrays',
    title: 'Find the Missing Number',
    hints: [
      {
        level: 1,
        title: 'CONCEPTUAL DIRECTION',
        content: 'Think about the relationship between the expected sequence of numbers (from 0 to n) and the numbers actually present in the array. If no numbers were missing, what would their total sum be?',
      },
      {
        level: 2,
        title: 'APPROACH GUIDANCE',
        content: 'Consider the mathematical summation formula: Sum(0..n) = (n * (n + 1)) / 2. Alternatively, consider the XOR property where (x ^ x = 0) and (x ^ 0 = x), allowing duplicates to cancel out.',
      },
      {
        level: 3,
        title: 'IMPLEMENTATION GUIDANCE',
        content: '1. Calculate expected sum = (n * (n + 1)) / 2, where n is array length.\n2. Compute the actual sum of the array using arr.reduce((a, b) => a + b, 0).\n3. Return expected - actual.\nComplexity: O(n) Time, O(1) Space.',
      },
    ],
  },

  // Strings: Count Vowels
  'strings': {
    id: 'strings',
    topicId: 'strings',
    title: 'Count Vowels',
    hints: [
      {
        level: 1,
        title: 'CONCEPTUAL DIRECTION',
        content: 'Think about which characters are classified as vowels (both lowercase and uppercase: a, e, i, o, u) and how to systematically inspect each character in the sequence.',
      },
      {
        level: 2,
        title: 'APPROACH GUIDANCE',
        content: 'You can iterate over the characters and test membership against a lookup string or Set of vowels. Alternatively, use a regular expression match like /[aeiou]/gi to extract all occurrences in a single pass.',
      },
      {
        level: 3,
        title: 'IMPLEMENTATION GUIDANCE',
        content: 'Option A (Regex): return (s.match(/[aeiou]/gi) || []).length;\nOption B (Loop): Initialize count = 0. Iterate through s, check "aeiouAEIOU".includes(char), and increment count.\nComplexity: O(n) Time, O(1) Space.',
      },
    ],
  },

  // Linked Lists: Middle of the List
  'linked-lists': {
    id: 'linked-lists',
    topicId: 'linked-lists',
    title: 'Middle of the List',
    hints: [
      {
        level: 1,
        title: 'CONCEPTUAL DIRECTION',
        content: 'A singly-linked list does not allow random index lookups like an array. How can two pointers moving through the list at different speeds help you identify the halfway point?',
      },
      {
        level: 2,
        title: 'APPROACH GUIDANCE',
        content: 'Use the Fast and Slow Pointer pattern (Tortoise and Hare). Advance the slow pointer by 1 step (slow = slow.next) while advancing the fast pointer by 2 steps (fast = fast.next.next) on each iteration.',
      },
      {
        level: 3,
        title: 'IMPLEMENTATION GUIDANCE',
        content: '1. Initialize slow = head and fast = head.\n2. Loop while (fast && fast.next) are not null.\n3. In loop: slow = slow.next, fast = fast.next.next.\n4. When fast reaches the end, slow is at the middle. Return slow.val.\nComplexity: O(n) Time, O(1) Space.',
      },
    ],
  },

  // Stack & Queue: Valid Parentheses
  'stack-queue': {
    id: 'stack-queue',
    topicId: 'stack-queue',
    title: 'Valid Parentheses',
    hints: [
      {
        level: 1,
        title: 'CONCEPTUAL DIRECTION',
        content: 'Every closing bracket must match the most recently opened unmatched bracket. What Last-In, First-Out (LIFO) structure keeps track of open scopes in reverse order?',
      },
      {
        level: 2,
        title: 'APPROACH GUIDANCE',
        content: 'Use a Stack. Push opening brackets onto the stack. When encountering a closing bracket, pop the top element from the stack and verify that it matches the corresponding opening type.',
      },
      {
        level: 3,
        title: 'IMPLEMENTATION GUIDANCE',
        content: '1. Maintain a map: const pairs = { ")": "(", "]": "[", "}": "{" }.\n2. For each char: if "([{".includes(ch) stack.push(ch); else if (stack.pop() !== pairs[ch]) return false.\n3. Return stack.length === 0 (to ensure no leftover unclosed brackets).\nComplexity: O(n) Time, O(n) Space.',
      },
    ],
  },

  // Trees: Maximum Depth
  'trees': {
    id: 'trees',
    topicId: 'trees',
    title: 'Maximum Depth',
    hints: [
      {
        level: 1,
        title: 'CONCEPTUAL DIRECTION',
        content: 'The depth of any tree node depends on the heights of its subtrees. If you already knew the maximum depth of the left child and right child, how would you determine the root depth?',
      },
      {
        level: 2,
        title: 'APPROACH GUIDANCE',
        content: 'Use Depth-First Search (DFS) via recursion. The base case is when a node is null (depth = 0). For any valid node, its depth is 1 plus the maximum depth between its left and right subtrees.',
      },
      {
        level: 3,
        title: 'IMPLEMENTATION GUIDANCE',
        content: '1. Base case: if (!root) return 0;\n2. Recursive step: return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\nEdge cases: Empty tree returns 0; single-node tree returns 1.\nComplexity: O(n) Time, O(h) Space where h is tree height.',
      },
    ],
  },

  // Graphs: Number of Islands
  'graphs': {
    id: 'graphs',
    topicId: 'graphs',
    title: 'Number of Islands',
    hints: [
      {
        level: 1,
        title: 'CONCEPTUAL DIRECTION',
        content: 'Treat the 2D grid as a graph where each "1" is a node connected horizontally and vertically to its neighbours. The challenge is to count the number of separate connected components.',
      },
      {
        level: 2,
        title: 'APPROACH GUIDANCE',
        content: 'Scan every cell (r, c) in the grid. When you encounter a "1", increment your island count, then trigger a flood fill (DFS or BFS) to visit and mark all connected land cells as "0" to avoid double-counting.',
      },
      {
        level: 3,
        title: 'IMPLEMENTATION GUIDANCE',
        content: '1. In dfs(r, c): verify boundary bounds (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== "1") and return.\n2. Mark visited: grid[r][c] = "0".\n3. Recurse in 4 directions: (r+1,c), (r-1,c), (r,c+1), (r,c-1).\n4. Return total count after grid traversal.\nComplexity: O(M * N) Time, O(M * N) Space.',
      },
    ],
  },

  // Dynamic Programming: Climbing Stairs
  'dynamic-programming': {
    id: 'dynamic-programming',
    topicId: 'dynamic-programming',
    title: 'Climbing Stairs',
    hints: [
      {
        level: 1,
        title: 'CONCEPTUAL DIRECTION',
        content: 'To reach step n, you can only arrive by taking a 1-step jump from step (n - 1) or a 2-step jump from step (n - 2). How do the ways to reach step n relate to the previous steps?',
      },
      {
        level: 2,
        title: 'APPROACH GUIDANCE',
        content: 'Notice the recurrence relation: ways(n) = ways(n - 1) + ways(n - 2). This matches the Fibonacci sequence! The base cases are ways(1) = 1 and ways(2) = 2.',
      },
      {
        level: 3,
        title: 'IMPLEMENTATION GUIDANCE',
        content: 'Use bottom-up tabulation with two rolling variables:\n1. If n <= 2 return n.\n2. Initialize a = 1 (step 1), b = 2 (step 2).\n3. Loop i from 3 to n: [a, b] = [b, a + b].\n4. Return b.\nComplexity: O(n) Time, O(1) Space.',
      },
    ],
  },

  // Recursion: Power Function
  'recursion': {
    id: 'recursion',
    topicId: 'recursion',
    title: 'Power Function',
    hints: [
      {
        level: 1,
        title: 'CONCEPTUAL DIRECTION',
        content: 'Rather than multiplying base by itself n times in O(n) steps, think about how squaring a previously computed value allows you to divide the exponent by 2 at each step.',
      },
      {
        level: 2,
        title: 'APPROACH GUIDANCE',
        content: 'Use Binary Exponentiation (Fast Power). If the exponent is even, x^n = (x^(n/2))^2. If odd, x^n = x * x^(n-1). For negative exponents, x^(-n) = 1 / (x^n).',
      },
      {
        level: 3,
        title: 'IMPLEMENTATION GUIDANCE',
        content: '1. Base case: if (exp === 0) return 1;\n2. Negative exponent: if (exp < 0) return 1 / pow(base, -exp);\n3. Even exponent: const half = pow(base, Math.floor(exp / 2)); return half * half;\n4. Odd exponent: return base * pow(base, exp - 1);\nComplexity: O(log n) Time, O(log n) Space.',
      },
    ],
  },

  // ==========================================
  // 2. CANONICAL DSA CHALLENGES (Mapped by slug/ID)
  // ==========================================

  // Two Sum
  'two-sum': {
    id: 'two-sum',
    title: 'Two Sum',
    hints: [
      {
        level: 1,
        title: 'CONCEPTUAL DIRECTION',
        content: 'Think about whether you can remember elements you have already visited instead of searching the rest of the array with a nested loop.',
      },
      {
        level: 2,
        title: 'APPROACH GUIDANCE',
        content: 'Consider using a HashMap to look up the complement of the current element in O(1) time.',
      },
      {
        level: 3,
        title: 'IMPLEMENTATION GUIDANCE',
        content: 'For each element at index i, calculate complement = target - nums[i]. Check whether that value already exists in your map. If so, return [map.get(complement), i]. Otherwise, store map.set(nums[i], i). Complexity: O(n) Time, O(n) Space.',
      },
    ],
  },

  // Contains Duplicate
  'contains-duplicate': {
    id: 'contains-duplicate',
    title: 'Contains Duplicate',
    hints: [
      {
        level: 1,
        title: 'CONCEPTUAL DIRECTION',
        content: 'Think about how to identify an element that appears more than once as you stream through the array.',
      },
      {
        level: 2,
        title: 'APPROACH GUIDANCE',
        content: 'Consider using a Set to track previously encountered elements with average O(1) lookup and insertion.',
      },
      {
        level: 3,
        title: 'IMPLEMENTATION GUIDANCE',
        content: 'Iterate through the array. If the current element already exists in the Set, a duplicate has been found (return true). Otherwise, insert it into the Set. Return false if the loop finishes. Complexity: O(n) Time, O(n) Space.',
      },
    ],
  },

  // Valid Anagram
  'valid-anagram': {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    hints: [
      {
        level: 1,
        title: 'CONCEPTUAL DIRECTION',
        content: 'Think about what makes two strings anagrams: they must contain the exact same characters in the exact same frequencies.',
      },
      {
        level: 2,
        title: 'APPROACH GUIDANCE',
        content: 'Consider comparing character frequencies. If the lengths of both strings differ, they cannot be anagrams.',
      },
      {
        level: 3,
        title: 'IMPLEMENTATION GUIDANCE',
        content: 'Count the frequency of each character in both strings and compare the counts. Alternatively, increment counts for the first string and decrement for the second; every bucket must end at 0. Complexity: O(n) Time, O(1) Space.',
      },
    ],
  },
};

/**
 * Retrieve hints for a given topic ID, question ID, or challenge title.
 * Gracefully falls back to topic ID lookup or slugified title lookup.
 */
export function getHintsForQuestion(identifier) {
  if (!identifier) return null;

  // 1. Direct match by exact ID
  if (HINTS_DATABASE[identifier]) {
    return HINTS_DATABASE[identifier];
  }

  // 2. Slugified match
  const slug = String(identifier)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-');

  if (HINTS_DATABASE[slug]) {
    return HINTS_DATABASE[slug];
  }

  // 3. Search by title match
  const found = Object.values(HINTS_DATABASE).find(
    entry => entry.title && entry.title.toLowerCase() === String(identifier).toLowerCase()
  );

  return found || null;
}

/**
 * Authoritative question hints dictionary for Arena & Problem challenges
 */
export const QUESTION_HINTS = {
  // Question ID lookups
  'p-arr-1-1': 'Access index 0. Check length first to handle the empty case.',
  'p-arr-1-2': 'The last index is arr.length - 1.',
  'p-arr-1-3': 'Traverse the array while maintaining a variable that stores the largest value encountered so far. Remember that all values can be negative.',
  'p-arr-1-4': 'Spread into a new array first, then call .reverse() to avoid mutating the original.',
  'p-arr-1-5': 'Think about using a Set to remember which numbers you have already encountered.',
  'p-arr-2-1': 'Think about how a HashMap can help you find the complement of the current number without checking every pair.',
  'p-arr-2-2': 'Spread both arrays together, then sort. Or use a two-pointer approach for O(n+m).',
  'p-arr-2-3': "Kadane's Algorithm: at each position, either extend the previous subarray or start fresh.",
  'p-arr-2-4': 'k % arr.length handles over-rotation. Slice from the end and combine with the start.',
  'p-arr-2-5': 'Two pointers from both ends. Move the pointer pointing to the shorter wall inward.',
  'p-arr-3-1': 'Two passes: one for prefix products, one for suffix products. Combine them.',
  'p-arr-3-2': 'First pass: record which rows and columns have zeros. Second pass: apply zeros.',
  'p-arr-3-3': 'Use four boundary pointers (top, bottom, left, right) and shrink them after each pass.',
  'p-arr-3-4': 'Two pointers. Water at each position = min(maxLeft, maxRight) - height[i].',
  'p-arr-3-5': 'Use a Set. Only start counting from the beginning of a sequence (where num-1 does not exist).',
  'p-str-1-1': 'Clean the string (lowercase, remove non-alphanumeric), then compare with its reverse.',
  'p-str-1-2': 'Sort both strings and compare, OR use a character frequency map.',
  'p-str-1-3': 'Sliding window + Map to track last seen index. Move left pointer past the duplicate.',
  'p-str-1-4': 'If a smaller value precedes a larger one (e.g. IV), subtract it. Otherwise add it.',
  'p-str-1-5': 'Sort each word to create a canonical key. Words with the same sorted form are anagrams.',
  'p-ll-1-1': 'Traverse with a pointer. Increment count at each node until null.',
  'p-ll-1-2': 'Use three pointers: prev, curr, next. Reassign curr.next = prev at each step.',
  'p-ll-1-3': "Floyd's cycle detection: slow moves 1 step, fast moves 2. If they meet, there's a cycle.",
  'p-ll-1-4': 'Two pointers n+1 apart. When fast reaches null, slow is just before the node to remove.',
  'p-ll-1-5': 'Dummy head simplifies edge cases. At each step, attach the smaller node.',

  // Common titles / canonical aliases
  'maximum-signal': 'Traverse the array while maintaining a variable that stores the largest value encountered so far. Remember that all values can be negative.',
  'two-sum': 'Think about how a HashMap can help you find the complement of the current number without checking every pair.',
  'two-sum-gate': 'Think about how a HashMap can help you find the complement of the current number without checking every pair.',
  'find-the-missing-number': 'Compare the expected sum of numbers from 0 to n with the actual sum of the array.',
  'contains-duplicate': 'Think about using a Set to remember which numbers you have already encountered.',
  'duplicate-scan': 'Think about using a Set to remember which numbers you have already encountered.',
};

/**
 * Retrieve the single authoritative question-specific hint for Hint Scroll usage.
 */
export function getProblemHint(problemId, problem = null) {
  if (problemId && QUESTION_HINTS[problemId]) {
    return QUESTION_HINTS[problemId];
  }
  if (problem?.id && QUESTION_HINTS[problem.id]) {
    return QUESTION_HINTS[problem.id];
  }
  if (problem?.title) {
    const slug = problem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (QUESTION_HINTS[slug]) return QUESTION_HINTS[slug];
  }
  if (problemId) {
    const slug = String(problemId).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (QUESTION_HINTS[slug]) return QUESTION_HINTS[slug];
  }
  if (problem?.hint) {
    return problem.hint;
  }
  return null;
}


