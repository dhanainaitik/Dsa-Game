// All problems for the practice system
// Each region has 3 states, each state has 5 problems

export const PROBLEMS = {
  // ===================== ARRAYS =====================
  'p-arr-1-1': {
    id: 'p-arr-1-1',
    stateId: 'arrays-s1',
    regionId: 'arrays',
    order: 1,
    title: 'The First Sentinel',
    difficulty: 'Easy',
    mission: `The archive holds a sequence of sealed vaults.
Your mission: retrieve the value stored in the very first vault.
Return null if the archive is empty.`,
    functionSignatures: {
      javascript: "function solve(arr) {\n  // Return the first element, or null if empty\n  \n}",
      python: "def solve(arr):\n    # Return the first element, or None if empty\n    pass",
      java: "public class Solution {\n    public Integer solve(int[] arr) {\n        // Return the first element, or null if empty\n        return null;\n    }\n}"
    },
    testCases: [
      { input: [1, 2, 3, 4], expected: 1 },
      { input: [42], expected: 42 },
      { input: [], expected: null },
    ],
    solution: `function solve(arr) {
  return arr.length > 0 ? arr[0] : null;
}`,
    hint: 'Access index 0. Check length first to handle the empty case.',
    explanation: 'Arrays use zero-based indexing. arr[0] gives the first element in O(1) time.',
  },
  'p-arr-1-2': {
    id: 'p-arr-1-2',
    stateId: 'arrays-s1',
    regionId: 'arrays',
    order: 2,
    title: 'The Last Echo',
    difficulty: 'Easy',
    mission: `The vaults form a long corridor. The last vault holds a critical signal.
Your mission: retrieve the value from the final vault.
Return null if no vaults exist.`,
    functionSignatures: {
      javascript: "function solve(arr) {\n  // Return the last element, or null if empty\n  \n}",
      python: "def solve(arr):\n    # Return the last element, or None if empty\n    pass",
      java: "public class Solution {\n    public Integer solve(int[] arr) {\n        // Your code here\n        return null;\n    }\n}"
    },
    testCases: [
      { input: [1, 2, 3, 4], expected: 4 },
      { input: [99], expected: 99 },
      { input: [], expected: null },
    ],
    solution: `function solve(arr) {
  return arr.length > 0 ? arr[arr.length - 1] : null;
}`,
    hint: 'The last index is arr.length - 1.',
    explanation: 'Since JavaScript arrays are zero-indexed, the last element is at position length-1.',
  },
  'p-arr-1-3': {
    id: 'p-arr-1-3',
    stateId: 'arrays-s1',
    regionId: 'arrays',
    order: 3,
    title: 'Maximum Signal',
    difficulty: 'Medium',
    mission: `A sensor array broadcasts intensity readings across a corridor.
Your mission: find the highest intensity value recorded.
The readings may be negative. Return the single highest value.`,
    functionSignatures: {
      javascript: "function solve(arr) {\n  // Return the maximum value\n  \n}",
      python: "def solve(arr):\n    # Return the maximum value\n    pass",
      java: "public class Solution {\n    public int solve(int[] arr) {\n        return 0;\n    }\n}"
    },
    testCases: [
      { input: [3, 1, 4, 1, 5, 9, 2, 6], expected: 9 },
      { input: [-5, -1, -3], expected: -1 },
      { input: [7], expected: 7 },
    ],
    solution: `function solve(arr) {
  return Math.max(...arr);
}`,
    hint: 'Math.max() with spread operator, or iterate and track a running maximum.',
    explanation: 'Linear scan O(n) is required. Math.max(...arr) is elegant but has stack limits for very large arrays.',
  },
  'p-arr-1-4': {
    id: 'p-arr-1-4',
    stateId: 'arrays-s1',
    regionId: 'arrays',
    order: 4,
    title: 'Mirror Protocol',
    difficulty: 'Medium',
    mission: `An ancient cipher requires reversing the order of a vault sequence.
Your mission: return a new array with all elements in reverse order.
Do not modify the original archive.`,
    functionSignatures: {
      javascript: "function solve(arr) {\n  // Return a new reversed array\n  \n}",
      python: "def solve(arr):\n    # Return a new reversed array\n    pass",
      java: "public class Solution {\n    public int[] solve(int[] arr) {\n        return new int[0];\n    }\n}"
    },
    testCases: [
      { input: [1, 2, 3, 4, 5], expected: [5, 4, 3, 2, 1] },
      { input: [10, 20], expected: [20, 10] },
      { input: [42], expected: [42] },
    ],
    solution: `function solve(arr) {
  return [...arr].reverse();
}`,
    hint: 'Spread into a new array first, then call .reverse() to avoid mutating the original.',
    explanation: '.reverse() is in-place. Using [...arr] creates a shallow copy first, preserving the original.',
  },
  'p-arr-1-5': {
    id: 'p-arr-1-5',
    stateId: 'arrays-s1',
    regionId: 'arrays',
    order: 5,
    title: 'Duplicate Scan',
    difficulty: 'Hard',
    mission: `Intelligence reports a potential duplicate signal in the vault sequence.
Your mission: return true if any value appears more than once.
Speed matters — aim for O(n).`,
    starterCode: `function solve(arr) {
  // Return true if duplicates exist, false otherwise
  
}`,
    testCases: [
      { input: '[1, 2, 3, 1]', expected: 'true' },
      { input: '[1, 2, 3, 4]', expected: 'false' },
      { input: '[5, 5]', expected: 'true' },
    ],
    solution: `function solve(arr) {
  return new Set(arr).size !== arr.length;
}`,
    hint: 'A Set stores only unique values. Compare its size to the original array length.',
    explanation: 'Set automatically deduplicates. If sizes differ, duplicates exist. O(n) time and space.',
  },

  // Arrays State 2
  'p-arr-2-1': {
    id: 'p-arr-2-1',
    stateId: 'arrays-s2',
    regionId: 'arrays',
    order: 1,
    title: 'Two-Sum Gate',
    difficulty: 'Easy',
    mission: `Two vault codes, when combined, unlock a sealed chamber.
Your mission: find two indices in the array whose values sum to the target.
Return the indices as an array [i, j].`,
    starterCode: `function solve(arr, target) {
  // Return [i, j] where arr[i] + arr[j] === target
  
}`,
    testCases: [
      { input: '[2, 7, 11, 15], 9', expected: '[0, 1]' },
      { input: '[3, 2, 4], 6', expected: '[1, 2]' },
      { input: '[3, 3], 6', expected: '[0, 1]' },
    ],
    solution: `function solve(arr, target) {
  const map = new Map();
  for (let i = 0; i < arr.length; i++) {
    const complement = target - arr[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(arr[i], i);
  }
}`,
    hint: 'Use a Map to store seen values. For each element, check if (target - element) was seen before.',
    explanation: 'Hash map approach: O(n) time, O(n) space. For each element, look up its complement in O(1).',
  },
  'p-arr-2-2': {
    id: 'p-arr-2-2',
    stateId: 'arrays-s2',
    regionId: 'arrays',
    order: 2,
    title: 'Sorted Convergence',
    difficulty: 'Easy',
    mission: `Two sorted vault sequences must merge into one unified, ordered archive.
Your mission: merge two sorted arrays into a single sorted array.`,
    starterCode: `function solve(arr1, arr2) {
  // Merge two sorted arrays into one sorted array
  
}`,
    testCases: [
      { input: '[1, 3, 5], [2, 4, 6]', expected: '[1, 2, 3, 4, 5, 6]' },
      { input: '[1, 2, 3], []', expected: '[1, 2, 3]' },
      { input: '[5], [1, 2, 3]', expected: '[1, 2, 3, 5]' },
    ],
    solution: `function solve(arr1, arr2) {
  return [...arr1, ...arr2].sort((a, b) => a - b);
}`,
    hint: 'Spread both arrays together, then sort. Or use a two-pointer approach for O(n+m).',
    explanation: 'The two-pointer technique is O(n+m) and leverages the sorted property. Sort-based is O((n+m)log(n+m)).',
  },
  'p-arr-2-3': {
    id: 'p-arr-2-3',
    stateId: 'arrays-s2',
    regionId: 'arrays',
    order: 3,
    title: 'Subarray Sum',
    difficulty: 'Medium',
    mission: `A subterranean scanner reports the combined reading of consecutive vaults.
Your mission: find the contiguous subarray with the largest sum and return that sum.`,
    starterCode: `function solve(arr) {
  // Return the maximum subarray sum (Kadane's algorithm)
  
}`,
    testCases: [
      { input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]', expected: '6' },
      { input: '[1]', expected: '1' },
      { input: '[-1, -2, -3]', expected: '-1' },
    ],
    solution: `function solve(arr) {
  let maxSum = arr[0];
  let current = arr[0];
  for (let i = 1; i < arr.length; i++) {
    current = Math.max(arr[i], current + arr[i]);
    maxSum = Math.max(maxSum, current);
  }
  return maxSum;
}`,
    hint: "Kadane's Algorithm: at each position, either extend the previous subarray or start fresh.",
    explanation: "Kadane's runs in O(n). Key insight: local max = max(current element, current element + previous local max).",
  },
  'p-arr-2-4': {
    id: 'p-arr-2-4',
    stateId: 'arrays-s2',
    regionId: 'arrays',
    order: 4,
    title: 'Rotation Protocol',
    difficulty: 'Medium',
    mission: `A rotational cipher shifts each vault position by k steps to the right.
Your mission: rotate an array to the right by k positions.
Vaults that fall off the end wrap around to the front.`,
    starterCode: `function solve(arr, k) {
  // Rotate array right by k steps
  
}`,
    testCases: [
      { input: '[1, 2, 3, 4, 5], 2', expected: '[4, 5, 1, 2, 3]' },
      { input: '[1, 2, 3], 4', expected: '[3, 1, 2]' },
      { input: '[1], 0', expected: '[1]' },
    ],
    solution: `function solve(arr, k) {
  k = k % arr.length;
  return [...arr.slice(-k), ...arr.slice(0, -k || arr.length)];
}`,
    hint: 'k % arr.length handles over-rotation. Slice from the end and combine with the start.',
    explanation: 'Effective k = k % n. Splice the last k elements to front. slice(-k) gives last k elements.',
  },
  'p-arr-2-5': {
    id: 'p-arr-2-5',
    stateId: 'arrays-s2',
    regionId: 'arrays',
    order: 5,
    title: 'Container of Most Water',
    difficulty: 'Hard',
    mission: `A row of barrier walls can trap water between them.
Each wall has a height. Water is trapped between two walls — limited by the shorter one.
Your mission: find the pair of walls that holds the most water. Return the volume.`,
    starterCode: `function solve(heights) {
  // Return the maximum water volume between any two walls
  
}`,
    testCases: [
      { input: '[1, 8, 6, 2, 5, 4, 8, 3, 7]', expected: '49' },
      { input: '[1, 1]', expected: '1' },
      { input: '[4, 3, 2, 1, 4]', expected: '16' },
    ],
    solution: `function solve(heights) {
  let left = 0, right = heights.length - 1, max = 0;
  while (left < right) {
    const water = Math.min(heights[left], heights[right]) * (right - left);
    max = Math.max(max, water);
    heights[left] < heights[right] ? left++ : right--;
  }
  return max;
}`,
    hint: 'Two pointers from both ends. Move the pointer pointing to the shorter wall inward.',
    explanation: 'Two-pointer O(n): water = min(h[l], h[r]) * (r - l). Move the smaller side inward — it can only improve.',
  },

  // Arrays State 3
  'p-arr-3-1': {
    id: 'p-arr-3-1',
    stateId: 'arrays-s3',
    regionId: 'arrays',
    order: 1,
    title: 'Product Sans Self',
    difficulty: 'Easy',
    mission: `Each vault must be tagged with the product of all OTHER vaults.
Your mission: return an array where each element is the product of all elements except itself.
You cannot use division.`,
    starterCode: `function solve(arr) {
  // Return product of all elements except self at each index
  
}`,
    testCases: [
      { input: '[1, 2, 3, 4]', expected: '[24, 12, 8, 6]' },
      { input: '[2, 3]', expected: '[3, 2]' },
      { input: '[-1, 1, 0, -3, 3]', expected: '[0, 0, 9, 0, 0]' },
    ],
    solution: `function solve(arr) {
  const result = new Array(arr.length).fill(1);
  let prefix = 1;
  for (let i = 0; i < arr.length; i++) {
    result[i] = prefix;
    prefix *= arr[i];
  }
  let suffix = 1;
  for (let i = arr.length - 1; i >= 0; i--) {
    result[i] *= suffix;
    suffix *= arr[i];
  }
  return result;
}`,
    hint: 'Two passes: one for prefix products, one for suffix products. Combine them.',
    explanation: 'Prefix × Suffix at each index gives product of all other elements. O(n) time, O(1) extra space.',
  },
  'p-arr-3-2': {
    id: 'p-arr-3-2',
    stateId: 'arrays-s3',
    regionId: 'arrays',
    order: 2,
    title: 'Zero Clearance',
    difficulty: 'Easy',
    mission: `A contaminated matrix must be quarantined.
If a cell contains 0, its entire row and column become 0.
Your mission: set zeros in-place.`,
    starterCode: `function solve(matrix) {
  // Set entire row and col to 0 if cell is 0 (in-place)
  
}`,
    testCases: [
      { input: '[[1,1,1],[1,0,1],[1,1,1]]', expected: '[[1,0,1],[0,0,0],[1,0,1]]' },
      { input: '[[0,1,2,0],[3,4,5,2],[1,3,1,5]]', expected: '[[0,0,0,0],[0,4,5,0],[0,3,1,0]]' },
      { input: '[[1,2],[3,4]]', expected: '[[1,2],[3,4]]' },
    ],
    solution: `function solve(matrix) {
  const rows = new Set(), cols = new Set();
  for (let r = 0; r < matrix.length; r++)
    for (let c = 0; c < matrix[0].length; c++)
      if (matrix[r][c] === 0) { rows.add(r); cols.add(c); }
  for (let r = 0; r < matrix.length; r++)
    for (let c = 0; c < matrix[0].length; c++)
      if (rows.has(r) || cols.has(c)) matrix[r][c] = 0;
  return matrix;
}`,
    hint: 'First pass: record which rows and columns have zeros. Second pass: apply zeros.',
    explanation: 'Two-pass O(m×n) approach. Using Sets for row/col tracking avoids false propagation from newly set zeros.',
  },
  'p-arr-3-3': {
    id: 'p-arr-3-3',
    stateId: 'arrays-s3',
    regionId: 'arrays',
    order: 3,
    title: 'Spiral Sweep',
    difficulty: 'Medium',
    mission: `A reconnaissance drone sweeps a grid in a clockwise spiral pattern.
Your mission: traverse a 2D matrix in spiral order and return the values visited.`,
    starterCode: `function solve(matrix) {
  // Return elements in spiral order
  
}`,
    testCases: [
      { input: '[[1,2,3],[4,5,6],[7,8,9]]', expected: '[1,2,3,6,9,8,7,4,5]' },
      { input: '[[1,2],[3,4]]', expected: '[1,2,4,3]' },
      { input: '[[3]]', expected: '[3]' },
    ],
    solution: `function solve(matrix) {
  const result = [];
  let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) result.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) result.push(matrix[r][right]);
    right--;
    if (top <= bottom) { for (let c = right; c >= left; c--) result.push(matrix[bottom][c]); bottom--; }
    if (left <= right) { for (let r = bottom; r >= top; r--) result.push(matrix[r][left]); left++; }
  }
  return result;
}`,
    hint: 'Use four boundary pointers (top, bottom, left, right) and shrink them after each pass.',
    explanation: 'Layer-by-layer traversal. Shrink boundaries after each direction sweep. O(m×n) time.',
  },
  'p-arr-3-4': {
    id: 'p-arr-3-4',
    stateId: 'arrays-s3',
    regionId: 'arrays',
    order: 4,
    title: 'Trap the Rain',
    difficulty: 'Medium',
    mission: `After heavy rains, water settles between elevation barriers.
Given an array of wall heights, calculate how much water can be trapped between them.`,
    starterCode: `function solve(heights) {
  // Return total trapped water units
  
}`,
    testCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expected: '6' },
      { input: '[4,2,0,3,2,5]', expected: '9' },
      { input: '[1,0,1]', expected: '1' },
    ],
    solution: `function solve(heights) {
  let left = 0, right = heights.length - 1, water = 0;
  let maxLeft = 0, maxRight = 0;
  while (left < right) {
    if (heights[left] < heights[right]) {
      heights[left] >= maxLeft ? maxLeft = heights[left] : water += maxLeft - heights[left];
      left++;
    } else {
      heights[right] >= maxRight ? maxRight = heights[right] : water += maxRight - heights[right];
      right--;
    }
  }
  return water;
}`,
    hint: 'Two pointers. Water at each position = min(maxLeft, maxRight) - height[i].',
    explanation: 'Two-pointer O(n): track max heights from both sides. Water contribution at each step is bounded by the smaller max.',
  },
  'p-arr-3-5': {
    id: 'p-arr-3-5',
    stateId: 'arrays-s3',
    regionId: 'arrays',
    order: 5,
    title: 'Longest Sequence',
    difficulty: 'Hard',
    mission: `An intelligence archive holds scattered numerical codes.
Find the longest streak of consecutive numbers within the archive.
You must do this in O(n) time.`,
    starterCode: `function solve(arr) {
  // Return the length of longest consecutive sequence
  
}`,
    testCases: [
      { input: '[100, 4, 200, 1, 3, 2]', expected: '4' },
      { input: '[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]', expected: '9' },
      { input: '[]', expected: '0' },
    ],
    solution: `function solve(arr) {
  const set = new Set(arr);
  let longest = 0;
  for (const num of set) {
    if (!set.has(num - 1)) {
      let length = 1;
      while (set.has(num + length)) length++;
      longest = Math.max(longest, length);
    }
  }
  return longest;
}`,
    hint: 'Use a Set. Only start counting from the beginning of a sequence (where num-1 does not exist).',
    explanation: 'Set-based O(n): skip non-starts. Each number is visited at most twice across all sequences. O(n) amortized.',
  },

  // ===================== STRINGS =====================
  'p-str-1-1': {
    id: 'p-str-1-1',
    stateId: 'strings-s1',
    regionId: 'strings',
    order: 1,
    title: 'Palindrome Gate',
    difficulty: 'Easy',
    mission: `A gate only opens if the access code reads the same forwards and backwards.
Your mission: determine if a string is a palindrome.
Ignore spaces and case.`,
    functionSignatures: {
      javascript: "function solve(s) {\n  // Return true if s is a palindrome\n  \n}",
      python: "def solve(s):\n    # Return true if s is a palindrome\n    pass",
      java: "public class Solution {\n    public boolean solve(String s) {\n        return false;\n    }\n}"
    },
    testCases: [
      { input: "racecar", expected: true },
      { input: "A man a plan a canal Panama", expected: true },
      { input: "hello", expected: false },
    ],
    solution: `function solve(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}`,
    hint: 'Clean the string (lowercase, remove non-alphanumeric), then compare with its reverse.',
    explanation: 'Two-pointer or reverse comparison. Regex /[^a-z0-9]/g removes everything that is not alphanumeric.',
  },
  'p-str-1-2': {
    id: 'p-str-1-2',
    stateId: 'strings-s1',
    regionId: 'strings',
    order: 2,
    title: 'Anagram Check',
    difficulty: 'Easy',
    mission: `Two encrypted messages are suspected anagrams — same characters, different order.
Your mission: verify whether two strings are anagrams of each other.`,
    starterCode: `function solve(s, t) {
  // Return true if s and t are anagrams
  
}`,
    testCases: [
      { input: '"anagram", "nagaram"', expected: 'true' },
      { input: '"rat", "car"', expected: 'false' },
      { input: '"listen", "silent"', expected: 'true' },
    ],
    solution: `function solve(s, t) {
  if (s.length !== t.length) return false;
  return s.split('').sort().join('') === t.split('').sort().join('');
}`,
    hint: 'Sort both strings and compare, OR use a character frequency map.',
    explanation: 'Sort approach is O(n log n). Frequency map approach is O(n) time, O(1) space (26 chars).',
  },
  'p-str-1-3': {
    id: 'p-str-1-3',
    stateId: 'strings-s1',
    regionId: 'strings',
    order: 3,
    title: 'Longest Unique Corridor',
    difficulty: 'Medium',
    mission: `A corridor sensor tracks unique access points. It resets when a repeated scan is detected.
Your mission: find the length of the longest substring with no repeating characters.`,
    starterCode: `function solve(s) {
  // Return the length of the longest substring without repeating characters
  
}`,
    testCases: [
      { input: '"abcabcbb"', expected: '3' },
      { input: '"bbbbb"', expected: '1' },
      { input: '"pwwkew"', expected: '3' },
    ],
    solution: `function solve(s) {
  const seen = new Map();
  let left = 0, max = 0;
  for (let right = 0; right < s.length; right++) {
    if (seen.has(s[right]) && seen.get(s[right]) >= left) {
      left = seen.get(s[right]) + 1;
    }
    seen.set(s[right], right);
    max = Math.max(max, right - left + 1);
  }
  return max;
}`,
    hint: 'Sliding window + Map to track last seen index. Move left pointer past the duplicate.',
    explanation: 'Sliding window O(n): move right pointer forward, shrink left when duplicate seen. Map stores last index of each char.',
  },
  'p-str-1-4': {
    id: 'p-str-1-4',
    stateId: 'strings-s1',
    regionId: 'strings',
    order: 4,
    title: 'Roman Decoder',
    difficulty: 'Medium',
    mission: `Ancient vault codes were written in Roman numerals.
Your mission: convert a Roman numeral string to its integer value.`,
    starterCode: `function solve(s) {
  // Convert Roman numeral string to integer
  
}`,
    testCases: [
      { input: '"III"', expected: '3' },
      { input: '"LVIII"', expected: '58' },
      { input: '"MCMXCIV"', expected: '1994' },
    ],
    solution: `function solve(s) {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = map[s[i]], next = map[s[i + 1]];
    result += cur < next ? -cur : cur;
  }
  return result;
}`,
    hint: 'If a smaller value precedes a larger one (e.g. IV), subtract it. Otherwise add it.',
    explanation: 'Scan left to right. Subtractive notation: when cur < next, subtract cur. Runs in O(n).',
  },
  'p-str-1-5': {
    id: 'p-str-1-5',
    stateId: 'strings-s1',
    regionId: 'strings',
    order: 5,
    title: 'Group the Scramble',
    difficulty: 'Hard',
    mission: `Intelligence has intercepted a batch of scrambled codes.
Group them: codes that are anagrams of each other belong together.
Return all groups.`,
    starterCode: `function solve(words) {
  // Group anagrams together
  
}`,
    testCases: [
      { input: '["eat","tea","tan","ate","nat","bat"]', expected: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: '[""]', expected: '[[""]]' },
      { input: '["a"]', expected: '[["a"]]' },
    ],
    solution: `function solve(words) {
  const map = new Map();
  for (const word of words) {
    const key = word.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(word);
  }
  return Array.from(map.values());
}`,
    hint: 'Sort each word to create a canonical key. Words with the same sorted form are anagrams.',
    explanation: 'HashMap with sorted-string key. O(n·k·log k) where k is max word length. Grouping happens naturally via the map.',
  },

  // ===================== LINKED LISTS =====================
  'p-ll-1-1': {
    id: 'p-ll-1-1',
    stateId: 'linked-lists-s1',
    regionId: 'linked-lists',
    order: 1,
    title: 'Chain Length',
    difficulty: 'Easy',
    mission: `A chain of encrypted nodes extends into the dark.
Your mission: count the total number of nodes in the linked list.`,
    starterCode: `// Node structure provided:
// class Node { constructor(val) { this.val = val; this.next = null; } }

function solve(head) {
  // Return the number of nodes
  
}`,
    testCases: [
      { input: '[1, 2, 3, 4, 5]', expected: '5' },
      { input: '[1]', expected: '1' },
      { input: '[]', expected: '0' },
    ],
    solution: `function solve(head) {
  let count = 0;
  while (head) { count++; head = head.next; }
  return count;
}`,
    hint: 'Traverse with a pointer. Increment count at each node until null.',
    explanation: 'Linear traversal O(n). No random access in linked lists — must walk from head.',
  },
  'p-ll-1-2': {
    id: 'p-ll-1-2',
    stateId: 'linked-lists-s1',
    regionId: 'linked-lists',
    order: 2,
    title: 'Reverse the Chain',
    difficulty: 'Easy',
    mission: `A corrupted chain of nodes must be reversed to restore order.
Your mission: reverse a linked list in-place and return the new head.`,
    starterCode: `function solve(head) {
  // Reverse the linked list in-place, return new head
  
}`,
    testCases: [
      { input: '[1, 2, 3, 4, 5]', expected: '[5, 4, 3, 2, 1]' },
      { input: '[1, 2]', expected: '[2, 1]' },
      { input: '[1]', expected: '[1]' },
    ],
    solution: `function solve(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
    hint: 'Use three pointers: prev, curr, next. Reassign curr.next = prev at each step.',
    explanation: 'In-place reversal O(n) O(1) space. The new head is prev after the loop completes.',
  },
  'p-ll-1-3': {
    id: 'p-ll-1-3',
    stateId: 'linked-lists-s1',
    regionId: 'linked-lists',
    order: 3,
    title: 'Cycle Detection',
    difficulty: 'Medium',
    mission: `A reconnaissance drone follows a chain of nodes. 
Intelligence suspects it may loop back on itself — an infinite cycle.
Your mission: detect if the linked list contains a cycle. Return true or false.`,
    starterCode: `function solve(head) {
  // Return true if the linked list has a cycle
  
}`,
    testCases: [
      { input: '[3,2,0,-4] with cycle at pos 1', expected: 'true' },
      { input: '[1,2] with cycle at pos 0', expected: 'true' },
      { input: '[1] no cycle', expected: 'false' },
    ],
    solution: `function solve(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
    hint: "Floyd's cycle detection: slow moves 1 step, fast moves 2. If they meet, there's a cycle.",
    explanation: "Floyd's algorithm O(n) O(1) space. If a cycle exists, the fast pointer laps the slow pointer.",
  },
  'p-ll-1-4': {
    id: 'p-ll-1-4',
    stateId: 'linked-lists-s1',
    regionId: 'linked-lists',
    order: 4,
    title: 'Nth From the End',
    difficulty: 'Medium',
    mission: `Remove the nth node from the end of the chain. The chain must remain intact.
Your mission: delete the nth node from the end of the linked list in one pass.`,
    starterCode: `function solve(head, n) {
  // Remove nth node from end and return head
  
}`,
    testCases: [
      { input: '[1,2,3,4,5], n=2', expected: '[1,2,3,5]' },
      { input: '[1], n=1', expected: '[]' },
      { input: '[1,2], n=1', expected: '[1]' },
    ],
    solution: `function solve(head, n) {
  const dummy = { val: 0, next: head };
  let fast = dummy, slow = dummy;
  for (let i = 0; i <= n; i++) fast = fast.next;
  while (fast) { fast = fast.next; slow = slow.next; }
  slow.next = slow.next.next;
  return dummy.next;
}`,
    hint: 'Two pointers n+1 apart. When fast reaches null, slow is just before the node to remove.',
    explanation: 'Two-pointer one-pass O(n). Dummy node handles edge case of removing the head.',
  },
  'p-ll-1-5': {
    id: 'p-ll-1-5',
    stateId: 'linked-lists-s1',
    regionId: 'linked-lists',
    order: 5,
    title: 'Merge Two Chains',
    difficulty: 'Hard',
    mission: `Two sorted chains of intelligence reports must be merged into one sorted chain.
Your mission: merge two sorted linked lists and return the merged head.`,
    starterCode: `function solve(l1, l2) {
  // Merge two sorted linked lists, return new head
  
}`,
    testCases: [
      { input: '[1,2,4], [1,3,4]', expected: '[1,1,2,3,4,4]' },
      { input: '[], []', expected: '[]' },
      { input: '[], [0]', expected: '[0]' },
    ],
    solution: `function solve(l1, l2) {
  const dummy = { val: 0, next: null };
  let current = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) { current.next = l1; l1 = l1.next; }
    else { current.next = l2; l2 = l2.next; }
    current = current.next;
  }
  current.next = l1 || l2;
  return dummy.next;
}`,
    hint: 'Dummy head simplifies edge cases. At each step, attach the smaller node.',
    explanation: 'Two-pointer merge O(n+m). Dummy node avoids special-casing the head assignment.',
  },
};

// States configuration
export const STATES = {
  'arrays-s1': { id: 'arrays-s1', regionId: 'arrays', order: 1, name: 'State I', label: 'Gate of Entry', problems: ['p-arr-1-1', 'p-arr-1-2', 'p-arr-1-3', 'p-arr-1-4', 'p-arr-1-5'] },
  'arrays-s2': { id: 'arrays-s2', regionId: 'arrays', order: 2, name: 'State II', label: 'The Inner Vault', problems: ['p-arr-2-1', 'p-arr-2-2', 'p-arr-2-3', 'p-arr-2-4', 'p-arr-2-5'] },
  'arrays-s3': { id: 'arrays-s3', regionId: 'arrays', order: 3, name: 'State III', label: 'The Deep Archive', problems: ['p-arr-3-1', 'p-arr-3-2', 'p-arr-3-3', 'p-arr-3-4', 'p-arr-3-5'] },
  'strings-s1': { id: 'strings-s1', regionId: 'strings', order: 1, name: 'State I', label: 'Woven Entry', problems: ['p-str-1-1', 'p-str-1-2', 'p-str-1-3', 'p-str-1-4', 'p-str-1-5'] },
  'strings-s2': { id: 'strings-s2', regionId: 'strings', order: 2, name: 'State II', label: 'Pattern Grounds', problems: ['p-str-1-1', 'p-str-1-2', 'p-str-1-3', 'p-str-1-4', 'p-str-1-5'] },
  'strings-s3': { id: 'strings-s3', regionId: 'strings', order: 3, name: 'State III', label: 'The Code Weave', problems: ['p-str-1-1', 'p-str-1-2', 'p-str-1-3', 'p-str-1-4', 'p-str-1-5'] },
  'linked-lists-s1': { id: 'linked-lists-s1', regionId: 'linked-lists', order: 1, name: 'State I', label: 'First Link', problems: ['p-ll-1-1', 'p-ll-1-2', 'p-ll-1-3', 'p-ll-1-4', 'p-ll-1-5'] },
  'linked-lists-s2': { id: 'linked-lists-s2', regionId: 'linked-lists', order: 2, name: 'State II', label: 'Chain Depths', problems: ['p-ll-1-1', 'p-ll-1-2', 'p-ll-1-3', 'p-ll-1-4', 'p-ll-1-5'] },
  'linked-lists-s3': { id: 'linked-lists-s3', regionId: 'linked-lists', order: 3, name: 'State III', label: 'The Unbreakable', problems: ['p-ll-1-1', 'p-ll-1-2', 'p-ll-1-3', 'p-ll-1-4', 'p-ll-1-5'] },
  'stack-queue-s1': { id: 'stack-queue-s1', regionId: 'stack-queue', order: 1, name: 'State I', label: 'Order Basin', problems: ['p-str-1-1', 'p-str-1-2', 'p-str-1-3', 'p-str-1-4', 'p-str-1-5'] },
  'stack-queue-s2': { id: 'stack-queue-s2', regionId: 'stack-queue', order: 2, name: 'State II', label: 'Flow Control', problems: ['p-str-1-1', 'p-str-1-2', 'p-str-1-3', 'p-str-1-4', 'p-str-1-5'] },
  'stack-queue-s3': { id: 'stack-queue-s3', regionId: 'stack-queue', order: 3, name: 'State III', label: 'The Surge', problems: ['p-str-1-1', 'p-str-1-2', 'p-str-1-3', 'p-str-1-4', 'p-str-1-5'] },
  'trees-s1': { id: 'trees-s1', regionId: 'trees', order: 1, name: 'State I', label: 'Root Entry', problems: ['p-arr-1-1', 'p-arr-1-2', 'p-arr-1-3', 'p-arr-1-4', 'p-arr-1-5'] },
  'trees-s2': { id: 'trees-s2', regionId: 'trees', order: 2, name: 'State II', label: 'Branch Network', problems: ['p-arr-1-1', 'p-arr-1-2', 'p-arr-1-3', 'p-arr-1-4', 'p-arr-1-5'] },
  'trees-s3': { id: 'trees-s3', regionId: 'trees', order: 3, name: 'State III', label: 'The Canopy', problems: ['p-arr-1-1', 'p-arr-1-2', 'p-arr-1-3', 'p-arr-1-4', 'p-arr-1-5'] },
  'graphs-s1': { id: 'graphs-s1', regionId: 'graphs', order: 1, name: 'State I', label: 'Vertex Zero', problems: ['p-arr-1-1', 'p-arr-1-2', 'p-arr-1-3', 'p-arr-1-4', 'p-arr-1-5'] },
  'graphs-s2': { id: 'graphs-s2', regionId: 'graphs', order: 2, name: 'State II', label: 'Edge Walking', problems: ['p-arr-1-1', 'p-arr-1-2', 'p-arr-1-3', 'p-arr-1-4', 'p-arr-1-5'] },
  'graphs-s3': { id: 'graphs-s3', regionId: 'graphs', order: 3, name: 'State III', label: 'The Expanse', problems: ['p-arr-1-1', 'p-arr-1-2', 'p-arr-1-3', 'p-arr-1-4', 'p-arr-1-5'] },
  'dynamic-programming-s1': { id: 'dynamic-programming-s1', regionId: 'dynamic-programming', order: 1, name: 'State I', label: 'First Cache', problems: ['p-arr-1-1', 'p-arr-1-2', 'p-arr-1-3', 'p-arr-1-4', 'p-arr-1-5'] },
  'dynamic-programming-s2': { id: 'dynamic-programming-s2', regionId: 'dynamic-programming', order: 2, name: 'State II', label: 'Memory Depths', problems: ['p-arr-1-1', 'p-arr-1-2', 'p-arr-1-3', 'p-arr-1-4', 'p-arr-1-5'] },
  'dynamic-programming-s3': { id: 'dynamic-programming-s3', regionId: 'dynamic-programming', order: 3, name: 'State III', label: 'Optimal Core', problems: ['p-arr-1-1', 'p-arr-1-2', 'p-arr-1-3', 'p-arr-1-4', 'p-arr-1-5'] },
  'recursion-s1': { id: 'recursion-s1', regionId: 'recursion', order: 1, name: 'State I', label: 'Echo Gate', problems: ['p-arr-1-1', 'p-arr-1-2', 'p-arr-1-3', 'p-arr-1-4', 'p-arr-1-5'] },
  'recursion-s2': { id: 'recursion-s2', regionId: 'recursion', order: 2, name: 'State II', label: 'Mirror Halls', problems: ['p-arr-1-1', 'p-arr-1-2', 'p-arr-1-3', 'p-arr-1-4', 'p-arr-1-5'] },
  'recursion-s3': { id: 'recursion-s3', regionId: 'recursion', order: 3, name: 'State III', label: 'The Infinite', problems: ['p-arr-1-1', 'p-arr-1-2', 'p-arr-1-3', 'p-arr-1-4', 'p-arr-1-5'] },
};

export const getStatesForRegion = (regionId) =>
  Object.values(STATES).filter(s => s.regionId === regionId).sort((a, b) => a.order - b.order);

export const getProblem = (id) => PROBLEMS[id];
export const getState = (id) => STATES[id];
