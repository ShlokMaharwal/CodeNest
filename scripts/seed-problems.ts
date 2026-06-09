/**
 * Seed script — 50 coding problems across 9 categories
 * Run: npx ts-node --project tsconfig.json scripts/seed-problems.ts
 * Or:  node -r ts-node/register scripts/seed-problems.ts
 */
import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const MONGODB_URI = process.env.MONGODB_URI!

const ProblemSchema = new mongoose.Schema({
  title: String, difficulty: String, tags: [String],
  description: String,
  starterCode: { javascript: String, python: String, java: String, cpp: String, typescript: String, go: String },
  testCases: [{ input: String, expectedOutput: String, isHidden: Boolean }],
  hints: [String],
  createdAt: { type: Date, default: Date.now },
})

const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema)

const problems = [
  // ── Arrays & Hashing ──────────────────────────────────────────────────────
  {
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['array', 'hashmap'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Example:**
Input: nums = [2,7,11,15], target = 9
Output: [0,1]

**Constraints:**
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9`,
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  // Your code here\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9)); // [0,1]\nconsole.log(twoSum([3, 2, 4], 6));       // [1,2]`,
      python: `def two_sum(nums, target):\n    # Your code here\n    pass\n\nprint(two_sum([2, 7, 11, 15], 9))  # [0,1]\nprint(two_sum([3, 2, 4], 6))       # [1,2]`,
      java: `import java.util.*;\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n    public static void main(String[] args) {\n        System.out.println(Arrays.toString(new Solution().twoSum(new int[]{2,7,11,15}, 9)));\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Your code here\n    return {};\n}\n\nint main() {\n    vector<int> nums = {2, 7, 11, 15};\n    auto res = twoSum(nums, 9);\n    cout << res[0] << "," << res[1] << endl;\n}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {\n  // Your code here\n  return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
      go: `package main\nimport "fmt"\n\nfunc twoSum(nums []int, target int) []int {\n    // Your code here\n    return nil\n}\n\nfunc main() {\n    fmt.Println(twoSum([]int{2, 7, 11, 15}, 9))\n}`,
    },
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
      { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: true },
    ],
    hints: ['Try using a hash map to store visited numbers.', 'For each number, check if target - number exists in the map.'],
  },
  {
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    tags: ['array', 'hashmap'],
    description: `Given an integer array \`nums\`, return \`true\` if any value appears at least twice, and \`false\` if every element is distinct.\n\n**Example:**\nInput: [1,2,3,1]\nOutput: true`,
    starterCode: {
      javascript: `function containsDuplicate(nums) {\n  // Your code here\n}\n\nconsole.log(containsDuplicate([1,2,3,1]));    // true\nconsole.log(containsDuplicate([1,2,3,4]));    // false`,
      python: `def contains_duplicate(nums):\n    # Your code here\n    pass\n\nprint(contains_duplicate([1,2,3,1]))  # True\nprint(contains_duplicate([1,2,3,4]))  # False`,
      java: `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // Your code here\n        return false;\n    }\n    public static void main(String[] args) {\n        System.out.println(new Solution().containsDuplicate(new int[]{1,2,3,1}));\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\nbool containsDuplicate(vector<int>& nums) {\n    // Your code here\n    return false;\n}\nint main() { vector<int> v={1,2,3,1}; cout<<containsDuplicate(v)<<endl; }`,
      typescript: `function containsDuplicate(nums: number[]): boolean {\n  // Your code here\n  return false;\n}\nconsole.log(containsDuplicate([1,2,3,1]));`,
      go: `package main\nimport "fmt"\nfunc containsDuplicate(nums []int) bool {\n    // Your code here\n    return false\n}\nfunc main() { fmt.Println(containsDuplicate([]int{1,2,3,1})) }`,
    },
    testCases: [
      { input: '[1,2,3,1]', expectedOutput: 'true', isHidden: false },
      { input: '[1,2,3,4]', expectedOutput: 'false', isHidden: false },
    ],
    hints: ['A Set only stores unique values.', 'Compare the size of the set to the original array length.'],
  },
  {
    title: 'Valid Anagram',
    difficulty: 'Easy',
    tags: ['string', 'hashmap'],
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.\n\n**Example:**\nInput: s = "anagram", t = "nagaram"\nOutput: true`,
    starterCode: {
      javascript: `function isAnagram(s, t) {\n  // Your code here\n}\nconsole.log(isAnagram("anagram", "nagaram")); // true\nconsole.log(isAnagram("rat", "car"));          // false`,
      python: `def is_anagram(s, t):\n    # Your code here\n    pass\nprint(is_anagram("anagram","nagaram"))  # True`,
      java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        // Your code here\n        return false;\n    }\n    public static void main(String[] a) { System.out.println(new Solution().isAnagram("anagram","nagaram")); }\n}`,
      cpp: `#include <iostream>\n#include <string>\nusing namespace std;\nbool isAnagram(string s, string t) { return false; }\nint main() { cout << isAnagram("anagram","nagaram") << endl; }`,
      typescript: `function isAnagram(s: string, t: string): boolean {\n  return false;\n}\nconsole.log(isAnagram("anagram", "nagaram"));`,
      go: `package main\nimport "fmt"\nfunc isAnagram(s string, t string) bool { return false }\nfunc main() { fmt.Println(isAnagram("anagram","nagaram")) }`,
    },
    testCases: [
      { input: '"anagram"\n"nagaram"', expectedOutput: 'true', isHidden: false },
      { input: '"rat"\n"car"', expectedOutput: 'false', isHidden: false },
    ],
    hints: ['Sort both strings and compare.', 'Or use a frequency map for O(n) solution.'],
  },
  {
    title: 'Group Anagrams',
    difficulty: 'Medium',
    tags: ['string', 'hashmap'],
    description: `Given an array of strings \`strs\`, group the anagrams together.\n\n**Example:**\nInput: ["eat","tea","tan","ate","nat","bat"]\nOutput: [["bat"],["nat","tan"],["ate","eat","tea"]]`,
    starterCode: {
      javascript: `function groupAnagrams(strs) {\n  // Your code here\n}\nconsole.log(groupAnagrams(["eat","tea","tan","ate","nat","bat"]));`,
      python: `from collections import defaultdict\ndef group_anagrams(strs):\n    # Your code here\n    pass\nprint(group_anagrams(["eat","tea","tan","ate","nat","bat"]))`,
      java: `import java.util.*;\nclass Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        // Your code here\n        return new ArrayList<>();\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <unordered_map>\nusing namespace std;\nvector<vector<string>> groupAnagrams(vector<string>& strs) { return {}; }\nint main() {}`,
      typescript: `function groupAnagrams(strs: string[]): string[][] {\n  return [];\n}`,
      go: `package main\nimport "fmt"\nfunc groupAnagrams(strs []string) [][]string { return nil }\nfunc main() { fmt.Println(groupAnagrams([]string{"eat","tea","tan","ate","nat","bat"})) }`,
    },
    testCases: [
      { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]', isHidden: false },
    ],
    hints: ['Sort each string as a hashmap key.', 'All strings that are anagrams will have the same sorted key.'],
  },
  {
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    tags: ['array', 'hashmap', 'heap'],
    description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\` most frequent elements.\n\n**Example:**\nInput: nums=[1,1,1,2,2,3], k=2\nOutput: [1,2]`,
    starterCode: {
      javascript: `function topKFrequent(nums, k) {\n  // Your code here\n}\nconsole.log(topKFrequent([1,1,1,2,2,3], 2)); // [1,2]`,
      python: `def top_k_frequent(nums, k):\n    # Your code here\n    pass\nprint(top_k_frequent([1,1,1,2,2,3], 2))`,
      java: `import java.util.*;\nclass Solution {\n    public int[] topKFrequent(int[] nums, int k) { return new int[]{}; }\n}`,
      cpp: `#include <vector>\nusing namespace std;\nvector<int> topKFrequent(vector<int>& nums, int k) { return {}; }`,
      typescript: `function topKFrequent(nums: number[], k: number): number[] { return []; }`,
      go: `package main\nfunc topKFrequent(nums []int, k int) []int { return nil }`,
    },
    testCases: [
      { input: '[1,1,1,2,2,3]\n2', expectedOutput: '[1,2]', isHidden: false },
      { input: '[1]\n1', expectedOutput: '[1]', isHidden: false },
    ],
    hints: ['Count frequencies with a map.', 'Bucket sort by frequency can solve this in O(n).'],
  },

  // ── Two Pointers ──────────────────────────────────────────────────────────
  {
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    tags: ['string', 'two-pointers'],
    description: `A phrase is a palindrome if it reads the same forwards and backwards after converting all letters to lowercase and removing non-alphanumeric characters.\n\n**Example:**\nInput: "A man, a plan, a canal: Panama"\nOutput: true`,
    starterCode: {
      javascript: `function isPalindrome(s) {\n  // Your code here\n}\nconsole.log(isPalindrome("A man, a plan, a canal: Panama")); // true`,
      python: `def is_palindrome(s):\n    # Your code here\n    pass\nprint(is_palindrome("A man, a plan, a canal: Panama"))`,
      java: `class Solution {\n    public boolean isPalindrome(String s) { return false; }\n    public static void main(String[] a) { System.out.println(new Solution().isPalindrome("A man, a plan, a canal: Panama")); }\n}`,
      cpp: `#include <iostream>\n#include <string>\nusing namespace std;\nbool isPalindrome(string s) { return false; }\nint main() { cout << isPalindrome("A man, a plan, a canal: Panama"); }`,
      typescript: `function isPalindrome(s: string): boolean { return false; }`,
      go: `package main\nimport "fmt"\nfunc isPalindrome(s string) bool { return false }\nfunc main() { fmt.Println(isPalindrome("A man, a plan, a canal: Panama")) }`,
    },
    testCases: [
      { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isHidden: false },
      { input: '"race a car"', expectedOutput: 'false', isHidden: false },
    ],
    hints: ['Use two pointers: one from start, one from end.', 'Skip non-alphanumeric characters and compare lowercase.'],
  },
  {
    title: 'Three Sum',
    difficulty: 'Medium',
    tags: ['array', 'two-pointers', 'sorting'],
    description: `Given an integer array \`nums\`, return all triplets \`[nums[i], nums[j], nums[k]]\` such that i, j, k are distinct and \`nums[i] + nums[j] + nums[k] == 0\`.\n\n**Example:**\nInput: [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]`,
    starterCode: {
      javascript: `function threeSum(nums) {\n  // Your code here\n}\nconsole.log(threeSum([-1,0,1,2,-1,-4]));`,
      python: `def three_sum(nums):\n    # Your code here\n    pass\nprint(three_sum([-1,0,1,2,-1,-4]))`,
      java: `import java.util.*;\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) { return new ArrayList<>(); }\n}`,
      cpp: `#include <vector>\nusing namespace std;\nvector<vector<int>> threeSum(vector<int>& nums) { return {}; }`,
      typescript: `function threeSum(nums: number[]): number[][] { return []; }`,
      go: `package main\nfunc threeSum(nums []int) [][]int { return nil }`,
    },
    testCases: [
      { input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]', isHidden: false },
      { input: '[0,0,0]', expectedOutput: '[[0,0,0]]', isHidden: false },
    ],
    hints: ['Sort first, then use two pointers for the inner loop.', 'Skip duplicates carefully to avoid duplicate triplets.'],
  },
  {
    title: 'Container With Most Water',
    difficulty: 'Medium',
    tags: ['array', 'two-pointers', 'greedy'],
    description: `Given an array \`height\` of n integers where \`height[i]\` is the height of line i, find two lines that together with the x-axis form a container that holds the most water.\n\n**Example:**\nInput: [1,8,6,2,5,4,8,3,7]\nOutput: 49`,
    starterCode: {
      javascript: `function maxArea(height) {\n  // Your code here\n}\nconsole.log(maxArea([1,8,6,2,5,4,8,3,7])); // 49`,
      python: `def max_area(height):\n    # Your code here\n    pass\nprint(max_area([1,8,6,2,5,4,8,3,7]))`,
      java: `class Solution { public int maxArea(int[] height) { return 0; } }`,
      cpp: `#include <vector>\nusing namespace std;\nint maxArea(vector<int>& height) { return 0; }`,
      typescript: `function maxArea(height: number[]): number { return 0; }`,
      go: `package main\nfunc maxArea(height []int) int { return 0 }`,
    },
    testCases: [
      { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49', isHidden: false },
    ],
    hints: ['Start with the widest container (pointers at both ends).', 'Always move the pointer with the shorter height inward.'],
  },
  {
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    tags: ['array', 'two-pointers', 'dp'],
    description: `Given n non-negative integers representing an elevation map where each bar has width 1, compute how much water it can trap after raining.\n\n**Example:**\nInput: [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6`,
    starterCode: {
      javascript: `function trap(height) {\n  // Your code here\n}\nconsole.log(trap([0,1,0,2,1,0,1,3,2,1,2,1])); // 6`,
      python: `def trap(height):\n    # Your code here\n    pass\nprint(trap([0,1,0,2,1,0,1,3,2,1,2,1]))`,
      java: `class Solution { public int trap(int[] height) { return 0; } }`,
      cpp: `#include <vector>\nusing namespace std;\nint trap(vector<int>& height) { return 0; }`,
      typescript: `function trap(height: number[]): number { return 0; }`,
      go: `package main\nfunc trap(height []int) int { return 0 }`,
    },
    testCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', isHidden: false },
    ],
    hints: ['Water at position i = min(maxLeft[i], maxRight[i]) - height[i].', 'Two pointer approach: track maxLeft and maxRight dynamically.'],
  },
  {
    title: 'Move Zeroes',
    difficulty: 'Easy',
    tags: ['array', 'two-pointers'],
    description: `Given an integer array \`nums\`, move all 0s to the end while maintaining the relative order of non-zero elements. Do this in-place.\n\n**Example:**\nInput: [0,1,0,3,12]\nOutput: [1,3,12,0,0]`,
    starterCode: {
      javascript: `function moveZeroes(nums) {\n  // Your code here (in-place)\n  return nums;\n}\nconsole.log(moveZeroes([0,1,0,3,12]));`,
      python: `def move_zeroes(nums):\n    # Your code here (in-place)\n    pass\n\nnums = [0,1,0,3,12]\nmove_zeroes(nums)\nprint(nums)`,
      java: `class Solution { public void moveZeroes(int[] nums) {} }`,
      cpp: `#include <vector>\nusing namespace std;\nvoid moveZeroes(vector<int>& nums) {}`,
      typescript: `function moveZeroes(nums: number[]): void {}`,
      go: `package main\nfunc moveZeroes(nums []int) {}`,
    },
    testCases: [
      { input: '[0,1,0,3,12]', expectedOutput: '[1,3,12,0,0]', isHidden: false },
    ],
    hints: ['Use a write pointer for non-zero elements.', 'After placing all non-zeroes, fill the rest with 0s.'],
  },

  // ── Sliding Window ────────────────────────────────────────────────────────
  {
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    tags: ['array', 'sliding-window', 'greedy'],
    description: `Given an array \`prices\` where \`prices[i]\` is the price of a stock on day i, find the max profit from a single buy/sell.\n\n**Example:**\nInput: [7,1,5,3,6,4]\nOutput: 5`,
    starterCode: {
      javascript: `function maxProfit(prices) {\n  // Your code here\n}\nconsole.log(maxProfit([7,1,5,3,6,4])); // 5`,
      python: `def max_profit(prices):\n    # Your code here\n    pass\nprint(max_profit([7,1,5,3,6,4]))`,
      java: `class Solution { public int maxProfit(int[] prices) { return 0; } }`,
      cpp: `#include <vector>\nusing namespace std;\nint maxProfit(vector<int>& prices) { return 0; }`,
      typescript: `function maxProfit(prices: number[]): number { return 0; }`,
      go: `package main\nfunc maxProfit(prices []int) int { return 0 }`,
    },
    testCases: [
      { input: '[7,1,5,3,6,4]', expectedOutput: '5', isHidden: false },
      { input: '[7,6,4,3,1]', expectedOutput: '0', isHidden: false },
    ],
    hints: ['Track the minimum price seen so far.', 'At each step, compare current price minus min with the running max profit.'],
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    tags: ['string', 'sliding-window', 'hashmap'],
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.\n\n**Example:**\nInput: "abcabcbb"\nOutput: 3 (the answer is "abc")`,
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {\n  // Your code here\n}\nconsole.log(lengthOfLongestSubstring("abcabcbb")); // 3`,
      python: `def length_of_longest_substring(s):\n    # Your code here\n    pass\nprint(length_of_longest_substring("abcabcbb"))`,
      java: `class Solution { public int lengthOfLongestSubstring(String s) { return 0; } }`,
      cpp: `#include <string>\nusing namespace std;\nint lengthOfLongestSubstring(string s) { return 0; }`,
      typescript: `function lengthOfLongestSubstring(s: string): number { return 0; }`,
      go: `package main\nfunc lengthOfLongestSubstring(s string) int { return 0 }`,
    },
    testCases: [
      { input: '"abcabcbb"', expectedOutput: '3', isHidden: false },
      { input: '"bbbbb"', expectedOutput: '1', isHidden: false },
    ],
    hints: ['Use a sliding window with a set/map.', 'Shrink the window from the left when a duplicate is found.'],
  },
  {
    title: 'Minimum Window Substring',
    difficulty: 'Hard',
    tags: ['string', 'sliding-window', 'hashmap'],
    description: `Given strings \`s\` and \`t\`, return the minimum window substring of \`s\` that contains all characters in \`t\`.\n\n**Example:**\nInput: s="ADOBECODEBANC", t="ABC"\nOutput: "BANC"`,
    starterCode: {
      javascript: `function minWindow(s, t) {\n  // Your code here\n}\nconsole.log(minWindow("ADOBECODEBANC", "ABC")); // BANC`,
      python: `def min_window(s, t):\n    # Your code here\n    pass\nprint(min_window("ADOBECODEBANC", "ABC"))`,
      java: `class Solution { public String minWindow(String s, String t) { return ""; } }`,
      cpp: `#include <string>\nusing namespace std;\nstring minWindow(string s, string t) { return ""; }`,
      typescript: `function minWindow(s: string, t: string): string { return ""; }`,
      go: `package main\nfunc minWindow(s string, t string) string { return "" }`,
    },
    testCases: [
      { input: '"ADOBECODEBANC"\n"ABC"', expectedOutput: '"BANC"', isHidden: false },
    ],
    hints: ['Use two frequency maps: one for t, one for the current window.', 'Expand right, shrink left when the window is valid.'],
  },
  {
    title: 'Longest Repeating Character Replacement',
    difficulty: 'Medium',
    tags: ['string', 'sliding-window'],
    description: `Given a string \`s\` and integer \`k\`, you can replace at most \`k\` characters. Return the length of the longest substring containing the same letter.\n\n**Example:**\nInput: s="ABAB", k=2\nOutput: 4`,
    starterCode: {
      javascript: `function characterReplacement(s, k) {\n  // Your code here\n}\nconsole.log(characterReplacement("ABAB", 2)); // 4`,
      python: `def character_replacement(s, k):\n    # Your code here\n    pass\nprint(character_replacement("ABAB", 2))`,
      java: `class Solution { public int characterReplacement(String s, int k) { return 0; } }`,
      cpp: `#include <string>\nusing namespace std;\nint characterReplacement(string s, int k) { return 0; }`,
      typescript: `function characterReplacement(s: string, k: number): number { return 0; }`,
      go: `package main\nfunc characterReplacement(s string, k int) int { return 0 }`,
    },
    testCases: [
      { input: '"ABAB"\n2', expectedOutput: '4', isHidden: false },
    ],
    hints: ['Window is valid when (windowSize - maxFreq) <= k.', 'Track the most frequent character count in the window.'],
  },
  {
    title: 'Permutation in String',
    difficulty: 'Medium',
    tags: ['string', 'sliding-window', 'hashmap'],
    description: `Given strings \`s1\` and \`s2\`, return \`true\` if \`s2\` contains a permutation of \`s1\`.\n\n**Example:**\nInput: s1="ab", s2="eidbaooo"\nOutput: true ("ba" is in s2)`,
    starterCode: {
      javascript: `function checkInclusion(s1, s2) {\n  // Your code here\n}\nconsole.log(checkInclusion("ab", "eidbaooo")); // true`,
      python: `def check_inclusion(s1, s2):\n    # Your code here\n    pass\nprint(check_inclusion("ab", "eidbaooo"))`,
      java: `class Solution { public boolean checkInclusion(String s1, String s2) { return false; } }`,
      cpp: `#include <string>\nusing namespace std;\nbool checkInclusion(string s1, string s2) { return false; }`,
      typescript: `function checkInclusion(s1: string, s2: string): boolean { return false; }`,
      go: `package main\nfunc checkInclusion(s1 string, s2 string) bool { return false }`,
    },
    testCases: [
      { input: '"ab"\n"eidbaooo"', expectedOutput: 'true', isHidden: false },
      { input: '"ab"\n"eidboaoo"', expectedOutput: 'false', isHidden: false },
    ],
    hints: ['Use a fixed-size window of length s1.length.', 'Compare frequency maps of the window and s1.'],
  },

  // ── Stack ─────────────────────────────────────────────────────────────────
  {
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    tags: ['stack', 'string'],
    description: `Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.\n\n**Example:**\nInput: "()[]{}"  Output: true\nInput: "(]"       Output: false`,
    starterCode: {
      javascript: `function isValid(s) {\n  // Your code here\n}\nconsole.log(isValid("()[]{}")); // true\nconsole.log(isValid("(]"));     // false`,
      python: `def is_valid(s):\n    # Your code here\n    pass\nprint(is_valid("()[]{}"))`,
      java: `class Solution { public boolean isValid(String s) { return false; } }`,
      cpp: `#include <string>\nusing namespace std;\nbool isValid(string s) { return false; }`,
      typescript: `function isValid(s: string): boolean { return false; }`,
      go: `package main\nfunc isValid(s string) bool { return false }`,
    },
    testCases: [
      { input: '"()[]{}"', expectedOutput: 'true', isHidden: false },
      { input: '"(]"', expectedOutput: 'false', isHidden: false },
      { input: '"([)]"', expectedOutput: 'false', isHidden: true },
    ],
    hints: ['Push opening brackets onto a stack.', 'When you see a closing bracket, check if it matches the top of the stack.'],
  },
  {
    title: 'Min Stack',
    difficulty: 'Medium',
    tags: ['stack', 'design'],
    description: `Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.\n\nImplement the MinStack class with: push, pop, top, getMin — all O(1).`,
    starterCode: {
      javascript: `class MinStack {\n  constructor() {\n    // Your code here\n  }\n  push(val) {}\n  pop() {}\n  top() {}\n  getMin() {}\n}\n\nconst ms = new MinStack();\nms.push(-2); ms.push(0); ms.push(-3);\nconsole.log(ms.getMin()); // -3`,
      python: `class MinStack:\n    def __init__(self):\n        pass\n    def push(self, val): pass\n    def pop(self): pass\n    def top(self): pass\n    def get_min(self): pass`,
      java: `class MinStack {\n    public MinStack() {}\n    public void push(int val) {}\n    public void pop() {}\n    public int top() { return 0; }\n    public int getMin() { return 0; }\n}`,
      cpp: `class MinStack {\npublic:\n    MinStack() {}\n    void push(int val) {}\n    void pop() {}\n    int top() { return 0; }\n    int getMin() { return 0; }\n};`,
      typescript: `class MinStack {\n  constructor() {}\n  push(val: number): void {}\n  pop(): void {}\n  top(): number { return 0; }\n  getMin(): number { return 0; }\n}`,
      go: `type MinStack struct{}\nfunc Constructor() MinStack { return MinStack{} }\nfunc (s *MinStack) Push(val int) {}\nfunc (s *MinStack) Pop() {}\nfunc (s *MinStack) Top() int { return 0 }\nfunc (s *MinStack) GetMin() int { return 0 }`,
    },
    testCases: [],
    hints: ['Use a secondary stack to track minimums.', 'Only push to the min stack when the new value is <= current min.'],
  },
  {
    title: 'Evaluate Reverse Polish Notation',
    difficulty: 'Medium',
    tags: ['stack', 'math'],
    description: `Evaluate the value of an arithmetic expression in Reverse Polish Notation.\n\n**Example:**\nInput: ["2","1","+","3","*"]\nOutput: 9  ((2+1)*3)`,
    starterCode: {
      javascript: `function evalRPN(tokens) {\n  // Your code here\n}\nconsole.log(evalRPN(["2","1","+","3","*"])); // 9`,
      python: `def eval_rpn(tokens):\n    # Your code here\n    pass\nprint(eval_rpn(["2","1","+","3","*"]))`,
      java: `class Solution { public int evalRPN(String[] tokens) { return 0; } }`,
      cpp: `#include <vector>\n#include <string>\nusing namespace std;\nint evalRPN(vector<string>& tokens) { return 0; }`,
      typescript: `function evalRPN(tokens: string[]): number { return 0; }`,
      go: `package main\nfunc evalRPN(tokens []string) int { return 0 }`,
    },
    testCases: [
      { input: '["2","1","+","3","*"]', expectedOutput: '9', isHidden: false },
      { input: '["4","13","5","/","+"]', expectedOutput: '6', isHidden: false },
    ],
    hints: ['Push numbers onto a stack.', 'When you see an operator, pop two numbers, compute, and push the result.'],
  },
  {
    title: 'Generate Parentheses',
    difficulty: 'Medium',
    tags: ['stack', 'backtracking', 'recursion'],
    description: `Given n pairs of parentheses, generate all combinations of well-formed parentheses.\n\n**Example:**\nInput: n=3\nOutput: ["((()))","(()())","(())()","()(())","()()()"]`,
    starterCode: {
      javascript: `function generateParenthesis(n) {\n  // Your code here\n}\nconsole.log(generateParenthesis(3));`,
      python: `def generate_parenthesis(n):\n    # Your code here\n    pass\nprint(generate_parenthesis(3))`,
      java: `import java.util.*;\nclass Solution { public List<String> generateParenthesis(int n) { return new ArrayList<>(); } }`,
      cpp: `#include <vector>\n#include <string>\nusing namespace std;\nvector<string> generateParenthesis(int n) { return {}; }`,
      typescript: `function generateParenthesis(n: number): string[] { return []; }`,
      go: `package main\nfunc generateParenthesis(n int) []string { return nil }`,
    },
    testCases: [
      { input: '3', expectedOutput: '["((()))","(()())","(())()","()(())","()()()"]', isHidden: false },
    ],
    hints: ['Use recursion with open/close counters.', 'Add "(" if open < n, add ")" if close < open.'],
  },
  {
    title: 'Daily Temperatures',
    difficulty: 'Medium',
    tags: ['stack', 'array', 'monotonic-stack'],
    description: `Given an array \`temperatures\`, return an array \`answer\` where \`answer[i]\` is the number of days until a warmer temperature, or 0 if no such day.\n\n**Example:**\nInput: [73,74,75,71,69,72,76,73]\nOutput: [1,1,4,2,1,1,0,0]`,
    starterCode: {
      javascript: `function dailyTemperatures(temperatures) {\n  // Your code here\n}\nconsole.log(dailyTemperatures([73,74,75,71,69,72,76,73]));`,
      python: `def daily_temperatures(temperatures):\n    # Your code here\n    pass\nprint(daily_temperatures([73,74,75,71,69,72,76,73]))`,
      java: `class Solution { public int[] dailyTemperatures(int[] temperatures) { return new int[]{}; } }`,
      cpp: `#include <vector>\nusing namespace std;\nvector<int> dailyTemperatures(vector<int>& temperatures) { return {}; }`,
      typescript: `function dailyTemperatures(temperatures: number[]): number[] { return []; }`,
      go: `package main\nfunc dailyTemperatures(temperatures []int) []int { return nil }`,
    },
    testCases: [
      { input: '[73,74,75,71,69,72,76,73]', expectedOutput: '[1,1,4,2,1,1,0,0]', isHidden: false },
    ],
    hints: ['Use a monotonic decreasing stack of indices.', 'Pop when you find a temperature greater than the stack top.'],
  },

  // ── Binary Search ─────────────────────────────────────────────────────────
  {
    title: 'Binary Search',
    difficulty: 'Easy',
    tags: ['binary-search', 'array'],
    description: `Given a sorted array of distinct integers \`nums\` and a \`target\`, return the index if the target is found, otherwise return -1.\n\n**Example:**\nInput: nums=[-1,0,3,5,9,12], target=9\nOutput: 4`,
    starterCode: {
      javascript: `function search(nums, target) {\n  // Your code here\n}\nconsole.log(search([-1,0,3,5,9,12], 9)); // 4`,
      python: `def search(nums, target):\n    # Your code here\n    pass\nprint(search([-1,0,3,5,9,12], 9))`,
      java: `class Solution { public int search(int[] nums, int target) { return -1; } }`,
      cpp: `#include <vector>\nusing namespace std;\nint search(vector<int>& nums, int target) { return -1; }`,
      typescript: `function search(nums: number[], target: number): number { return -1; }`,
      go: `package main\nfunc search(nums []int, target int) int { return -1 }`,
    },
    testCases: [
      { input: '[-1,0,3,5,9,12]\n9', expectedOutput: '4', isHidden: false },
      { input: '[-1,0,3,5,9,12]\n2', expectedOutput: '-1', isHidden: false },
    ],
    hints: ['Initialize left=0, right=len-1.', 'Compare mid element with target, adjust left or right accordingly.'],
  },
  {
    title: 'Find Minimum in Rotated Sorted Array',
    difficulty: 'Medium',
    tags: ['binary-search', 'array'],
    description: `Given a sorted and rotated array \`nums\` with no duplicates, return the minimum element.\n\n**Example:**\nInput: [3,4,5,1,2]\nOutput: 1`,
    starterCode: {
      javascript: `function findMin(nums) {\n  // Your code here\n}\nconsole.log(findMin([3,4,5,1,2])); // 1`,
      python: `def find_min(nums):\n    # Your code here\n    pass\nprint(find_min([3,4,5,1,2]))`,
      java: `class Solution { public int findMin(int[] nums) { return 0; } }`,
      cpp: `#include <vector>\nusing namespace std;\nint findMin(vector<int>& nums) { return 0; }`,
      typescript: `function findMin(nums: number[]): number { return 0; }`,
      go: `package main\nfunc findMin(nums []int) int { return 0 }`,
    },
    testCases: [
      { input: '[3,4,5,1,2]', expectedOutput: '1', isHidden: false },
      { input: '[4,5,6,7,0,1,2]', expectedOutput: '0', isHidden: false },
    ],
    hints: ['Compare nums[mid] with nums[right] to determine which half is sorted.', 'The minimum is in the unsorted half.'],
  },
  {
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    tags: ['binary-search', 'array'],
    description: `Given a rotated sorted array \`nums\` and a \`target\`, return its index or -1.\n\n**Example:**\nInput: nums=[4,5,6,7,0,1,2], target=0\nOutput: 4`,
    starterCode: {
      javascript: `function search(nums, target) {\n  // Your code here\n}\nconsole.log(search([4,5,6,7,0,1,2], 0)); // 4`,
      python: `def search(nums, target):\n    # Your code here\n    pass\nprint(search([4,5,6,7,0,1,2], 0))`,
      java: `class Solution { public int search(int[] nums, int target) { return -1; } }`,
      cpp: `#include <vector>\nusing namespace std;\nint search(vector<int>& nums, int target) { return -1; }`,
      typescript: `function search(nums: number[], target: number): number { return -1; }`,
      go: `package main\nfunc search(nums []int, target int) int { return -1 }`,
    },
    testCases: [
      { input: '[4,5,6,7,0,1,2]\n0', expectedOutput: '4', isHidden: false },
      { input: '[4,5,6,7,0,1,2]\n3', expectedOutput: '-1', isHidden: false },
    ],
    hints: ['One half is always sorted — determine which one.', 'Check if target is in the sorted half; if yes, search there, otherwise search the other.'],
  },
  {
    title: 'Koko Eating Bananas',
    difficulty: 'Medium',
    tags: ['binary-search', 'array'],
    description: `Koko has \`piles\` of bananas and \`h\` hours. She eats at rate \`k\` bananas/hour. Find the minimum \`k\` to eat all bananas within \`h\` hours.\n\n**Example:**\nInput: piles=[3,6,7,11], h=8\nOutput: 4`,
    starterCode: {
      javascript: `function minEatingSpeed(piles, h) {\n  // Your code here\n}\nconsole.log(minEatingSpeed([3,6,7,11], 8)); // 4`,
      python: `import math\ndef min_eating_speed(piles, h):\n    # Your code here\n    pass\nprint(min_eating_speed([3,6,7,11], 8))`,
      java: `class Solution { public int minEatingSpeed(int[] piles, int h) { return 0; } }`,
      cpp: `#include <vector>\nusing namespace std;\nint minEatingSpeed(vector<int>& piles, int h) { return 0; }`,
      typescript: `function minEatingSpeed(piles: number[], h: number): number { return 0; }`,
      go: `package main\nfunc minEatingSpeed(piles []int, h int) int { return 0 }`,
    },
    testCases: [
      { input: '[3,6,7,11]\n8', expectedOutput: '4', isHidden: false },
    ],
    hints: ['Binary search on the answer (eating speed k).', 'For a given k, compute hours needed = sum(ceil(pile/k)).'],
  },
  {
    title: 'Search a 2D Matrix',
    difficulty: 'Medium',
    tags: ['binary-search', 'matrix'],
    description: `Given an m×n matrix where each row is sorted and the first integer of each row is greater than the last of the previous, search for a target integer.\n\n**Example:**\nInput: matrix=[[1,3,5,7],[10,11,16,20],[23,30,34,60]], target=3\nOutput: true`,
    starterCode: {
      javascript: `function searchMatrix(matrix, target) {\n  // Your code here\n}\nconsole.log(searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3));`,
      python: `def search_matrix(matrix, target):\n    # Your code here\n    pass\nprint(search_matrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3))`,
      java: `class Solution { public boolean searchMatrix(int[][] matrix, int target) { return false; } }`,
      cpp: `#include <vector>\nusing namespace std;\nbool searchMatrix(vector<vector<int>>& matrix, int target) { return false; }`,
      typescript: `function searchMatrix(matrix: number[][], target: number): boolean { return false; }`,
      go: `package main\nfunc searchMatrix(matrix [][]int, target int) bool { return false }`,
    },
    testCases: [
      { input: '[[1,3,5,7],[10,11,16,20],[23,30,34,60]]\n3', expectedOutput: 'true', isHidden: false },
      { input: '[[1,3,5,7],[10,11,16,20],[23,30,34,60]]\n13', expectedOutput: 'false', isHidden: false },
    ],
    hints: ['Treat the matrix as a flat sorted array.', 'Map 1D index to 2D: row = idx/cols, col = idx%cols.'],
  },

  // ── Linked Lists ──────────────────────────────────────────────────────────
  {
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    tags: ['linked-list'],
    description: `Given the head of a singly linked list, reverse the list and return the reversed list.\n\n**Example:**\nInput: 1->2->3->4->5\nOutput: 5->4->3->2->1`,
    starterCode: {
      javascript: `class ListNode {\n  constructor(val, next = null) { this.val = val; this.next = next; }\n}\nfunction reverseList(head) {\n  // Your code here\n}\n// Test\nconst head = new ListNode(1, new ListNode(2, new ListNode(3)));\nlet r = reverseList(head);\nlet out = [];\nwhile(r) { out.push(r.val); r = r.next; }\nconsole.log(out.join("->"));`,
      python: `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head):\n    # Your code here\n    pass`,
      java: `class Solution {\n    public ListNode reverseList(ListNode head) { return null; }\n}`,
      cpp: `struct ListNode { int val; ListNode* next; ListNode(int x): val(x), next(nullptr){} };\nListNode* reverseList(ListNode* head) { return nullptr; }`,
      typescript: `class ListNode { val: number; next: ListNode | null = null; constructor(val: number) { this.val = val; } }\nfunction reverseList(head: ListNode | null): ListNode | null { return null; }`,
      go: `type ListNode struct { Val int; Next *ListNode }\nfunc reverseList(head *ListNode) *ListNode { return nil }`,
    },
    testCases: [],
    hints: ['Use three pointers: prev, curr, next.', 'Iteratively reverse the next pointer of each node.'],
  },
  {
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    tags: ['linked-list'],
    description: `Merge two sorted linked lists and return the merged sorted list.\n\n**Example:**\nInput: l1=1->2->4, l2=1->3->4\nOutput: 1->1->2->3->4->4`,
    starterCode: {
      javascript: `class ListNode {\n  constructor(val, next = null) { this.val = val; this.next = next; }\n}\nfunction mergeTwoLists(l1, l2) {\n  // Your code here\n}`,
      python: `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\ndef merge_two_lists(l1, l2):\n    # Your code here\n    pass`,
      java: `class Solution { public ListNode mergeTwoLists(ListNode list1, ListNode list2) { return null; } }`,
      cpp: `ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) { return nullptr; }`,
      typescript: `function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null { return null; }`,
      go: `func mergeTwoLists(list1 *ListNode, list2 *ListNode) *ListNode { return nil }`,
    },
    testCases: [],
    hints: ['Use a dummy head node.', 'Compare the heads of both lists and attach the smaller one.'],
  },
  {
    title: 'Remove Nth Node From End of List',
    difficulty: 'Medium',
    tags: ['linked-list', 'two-pointers'],
    description: `Given the head of a linked list, remove the nth node from the end and return its head.\n\n**Example:**\nInput: 1->2->3->4->5, n=2\nOutput: 1->2->3->5`,
    starterCode: {
      javascript: `function removeNthFromEnd(head, n) {\n  // Your code here\n}`,
      python: `def remove_nth_from_end(head, n):\n    # Your code here\n    pass`,
      java: `class Solution { public ListNode removeNthFromEnd(ListNode head, int n) { return null; } }`,
      cpp: `ListNode* removeNthFromEnd(ListNode* head, int n) { return nullptr; }`,
      typescript: `function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null { return null; }`,
      go: `func removeNthFromEnd(head *ListNode, n int) *ListNode { return nil }`,
    },
    testCases: [],
    hints: ['Use two pointers with a gap of n.', 'When the fast pointer reaches the end, slow pointer is at the node before the target.'],
  },
  {
    title: 'Reorder List',
    difficulty: 'Medium',
    tags: ['linked-list', 'two-pointers'],
    description: `Given list L0→L1→…→Ln, reorder to: L0→Ln→L1→Ln-1→L2→Ln-2→…\n\n**Example:**\nInput: 1->2->3->4\nOutput: 1->4->2->3`,
    starterCode: {
      javascript: `function reorderList(head) {\n  // Your code here (in-place)\n}`,
      python: `def reorder_list(head):\n    # Your code here (in-place)\n    pass`,
      java: `class Solution { public void reorderList(ListNode head) {} }`,
      cpp: `void reorderList(ListNode* head) {}`,
      typescript: `function reorderList(head: ListNode | null): void {}`,
      go: `func reorderList(head *ListNode) {}`,
    },
    testCases: [],
    hints: ['Find the middle, reverse the second half, then merge.', 'Three steps: slow/fast pointer for mid, reverse, interleave.'],
  },
  {
    title: 'LRU Cache',
    difficulty: 'Hard',
    tags: ['linked-list', 'hashmap', 'design'],
    description: `Design a data structure that follows the Least Recently Used cache constraint.\n\nImplement LRUCache with capacity, get(key), and put(key, value) — all O(1).`,
    starterCode: {
      javascript: `class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    // Your code here\n  }\n  get(key) {}\n  put(key, value) {}\n}\n\nconst cache = new LRUCache(2);\ncache.put(1,1); cache.put(2,2);\nconsole.log(cache.get(1)); // 1\ncache.put(3,3);\nconsole.log(cache.get(2)); // -1`,
      python: `from collections import OrderedDict\nclass LRUCache:\n    def __init__(self, capacity):\n        self.capacity = capacity\n    def get(self, key): pass\n    def put(self, key, value): pass`,
      java: `import java.util.*;\nclass LRUCache {\n    public LRUCache(int capacity) {}\n    public int get(int key) { return -1; }\n    public void put(int key, int value) {}\n}`,
      cpp: `class LRUCache {\npublic:\n    LRUCache(int capacity) {}\n    int get(int key) { return -1; }\n    void put(int key, int value) {}\n};`,
      typescript: `class LRUCache {\n  constructor(private capacity: number) {}\n  get(key: number): number { return -1; }\n  put(key: number, value: number): void {}\n}`,
      go: `type LRUCache struct{}\nfunc Constructor(capacity int) LRUCache { return LRUCache{} }\nfunc (c *LRUCache) Get(key int) int { return -1 }\nfunc (c *LRUCache) Put(key int, value int) {}`,
    },
    testCases: [],
    hints: ['Use a doubly linked list + hashmap.', 'The map gives O(1) access; the list maintains LRU order.'],
  },

  // ── Trees ─────────────────────────────────────────────────────────────────
  {
    title: 'Invert Binary Tree',
    difficulty: 'Easy',
    tags: ['tree', 'recursion', 'bfs'],
    description: `Given the root of a binary tree, invert the tree and return its root.\n\n**Example:**\nInput: [4,2,7,1,3,6,9]\nOutput: [4,7,2,9,6,3,1]`,
    starterCode: {
      javascript: `class TreeNode {\n  constructor(val, left=null, right=null) { this.val=val; this.left=left; this.right=right; }\n}\nfunction invertTree(root) {\n  // Your code here\n}`,
      python: `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val; self.left = left; self.right = right\ndef invert_tree(root):\n    # Your code here\n    pass`,
      java: `class Solution { public TreeNode invertTree(TreeNode root) { return null; } }`,
      cpp: `TreeNode* invertTree(TreeNode* root) { return nullptr; }`,
      typescript: `function invertTree(root: TreeNode | null): TreeNode | null { return null; }`,
      go: `func invertTree(root *TreeNode) *TreeNode { return nil }`,
    },
    testCases: [],
    hints: ['Swap the left and right children recursively.', 'Works with both DFS (recursive) and BFS (queue).'],
  },
  {
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    tags: ['tree', 'recursion', 'dfs'],
    description: `Given the root of a binary tree, return its maximum depth.\n\n**Example:**\nInput: [3,9,20,null,null,15,7]\nOutput: 3`,
    starterCode: {
      javascript: `function maxDepth(root) {\n  // Your code here\n}\n// Assuming TreeNode class is defined`,
      python: `def max_depth(root):\n    # Your code here\n    pass`,
      java: `class Solution { public int maxDepth(TreeNode root) { return 0; } }`,
      cpp: `int maxDepth(TreeNode* root) { return 0; }`,
      typescript: `function maxDepth(root: TreeNode | null): number { return 0; }`,
      go: `func maxDepth(root *TreeNode) int { return 0 }`,
    },
    testCases: [],
    hints: ['maxDepth = 1 + max(maxDepth(left), maxDepth(right))', 'Base case: null node returns 0.'],
  },
  {
    title: 'Diameter of Binary Tree',
    difficulty: 'Easy',
    tags: ['tree', 'dfs'],
    description: `Given the root of a binary tree, return the length of the diameter (the longest path between any two nodes).\n\n**Example:**\nInput: [1,2,3,4,5]\nOutput: 3 (path: 4→2→1→3)`,
    starterCode: {
      javascript: `function diameterOfBinaryTree(root) {\n  // Your code here\n}`,
      python: `def diameter_of_binary_tree(root):\n    # Your code here\n    pass`,
      java: `class Solution { public int diameterOfBinaryTree(TreeNode root) { return 0; } }`,
      cpp: `int diameterOfBinaryTree(TreeNode* root) { return 0; }`,
      typescript: `function diameterOfBinaryTree(root: TreeNode | null): number { return 0; }`,
      go: `func diameterOfBinaryTree(root *TreeNode) int { return 0 }`,
    },
    testCases: [],
    hints: ['The diameter through a node = leftHeight + rightHeight.', 'Track the max diameter globally as you compute heights with DFS.'],
  },
  {
    title: 'Balanced Binary Tree',
    difficulty: 'Easy',
    tags: ['tree', 'dfs'],
    description: `Given a binary tree, determine if it is height-balanced (every node's left and right subtrees differ in height by at most 1).\n\n**Example:**\nInput: [3,9,20,null,null,15,7]\nOutput: true`,
    starterCode: {
      javascript: `function isBalanced(root) {\n  // Your code here\n}`,
      python: `def is_balanced(root):\n    # Your code here\n    pass`,
      java: `class Solution { public boolean isBalanced(TreeNode root) { return false; } }`,
      cpp: `bool isBalanced(TreeNode* root) { return false; }`,
      typescript: `function isBalanced(root: TreeNode | null): boolean { return false; }`,
      go: `func isBalanced(root *TreeNode) bool { return false }`,
    },
    testCases: [],
    hints: ['Return -1 from your height function to signal unbalanced.', 'If |leftH - rightH| > 1, return -1 instead of the height.'],
  },
  {
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    tags: ['tree', 'bfs'],
    description: `Given the root of a binary tree, return the level order traversal of its nodes' values (left to right, level by level).\n\n**Example:**\nInput: [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]`,
    starterCode: {
      javascript: `function levelOrder(root) {\n  // Your code here\n}\n// returns [[3],[9,20],[15,7]]`,
      python: `from collections import deque\ndef level_order(root):\n    # Your code here\n    pass`,
      java: `import java.util.*;\nclass Solution { public List<List<Integer>> levelOrder(TreeNode root) { return new ArrayList<>(); } }`,
      cpp: `#include <vector>\n#include <queue>\nusing namespace std;\nvector<vector<int>> levelOrder(TreeNode* root) { return {}; }`,
      typescript: `function levelOrder(root: TreeNode | null): number[][] { return []; }`,
      go: `func levelOrder(root *TreeNode) [][]int { return nil }`,
    },
    testCases: [],
    hints: ['Use a queue (BFS).', 'Process each level completely before adding children for the next level.'],
  },

  // ── Dynamic Programming ───────────────────────────────────────────────────
  {
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    tags: ['dp'],
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?\n\n**Example:**\nInput: n=3\nOutput: 3 (1+1+1, 1+2, 2+1)`,
    starterCode: {
      javascript: `function climbStairs(n) {\n  // Your code here\n}\nconsole.log(climbStairs(5)); // 8`,
      python: `def climb_stairs(n):\n    # Your code here\n    pass\nprint(climb_stairs(5))`,
      java: `class Solution { public int climbStairs(int n) { return 0; } }`,
      cpp: `int climbStairs(int n) { return 0; }`,
      typescript: `function climbStairs(n: number): number { return 0; }`,
      go: `package main\nfunc climbStairs(n int) int { return 0 }`,
    },
    testCases: [
      { input: '3', expectedOutput: '3', isHidden: false },
      { input: '5', expectedOutput: '8', isHidden: false },
    ],
    hints: ['This is the Fibonacci sequence.', 'dp[i] = dp[i-1] + dp[i-2], base cases dp[1]=1, dp[2]=2.'],
  },
  {
    title: 'House Robber',
    difficulty: 'Medium',
    tags: ['dp'],
    description: `You are a robber planning to rob houses. Adjacent houses have security systems. Given array \`nums\` (money in each house), return the max money without robbing adjacent houses.\n\n**Example:**\nInput: [1,2,3,1]\nOutput: 4`,
    starterCode: {
      javascript: `function rob(nums) {\n  // Your code here\n}\nconsole.log(rob([1,2,3,1])); // 4\nconsole.log(rob([2,7,9,3,1])); // 12`,
      python: `def rob(nums):\n    # Your code here\n    pass\nprint(rob([1,2,3,1]))`,
      java: `class Solution { public int rob(int[] nums) { return 0; } }`,
      cpp: `#include <vector>\nusing namespace std;\nint rob(vector<int>& nums) { return 0; }`,
      typescript: `function rob(nums: number[]): number { return 0; }`,
      go: `package main\nfunc rob(nums []int) int { return 0 }`,
    },
    testCases: [
      { input: '[1,2,3,1]', expectedOutput: '4', isHidden: false },
      { input: '[2,7,9,3,1]', expectedOutput: '12', isHidden: false },
    ],
    hints: ['dp[i] = max(dp[i-1], dp[i-2] + nums[i])', 'You only need the previous two values — O(1) space.'],
  },
  {
    title: 'Coin Change',
    difficulty: 'Medium',
    tags: ['dp'],
    description: `Given coins of different denominations and a total amount, return the fewest coins needed to make up that amount, or -1 if not possible.\n\n**Example:**\nInput: coins=[1,5,11], amount=15\nOutput: 3 (5+5+5)`,
    starterCode: {
      javascript: `function coinChange(coins, amount) {\n  // Your code here\n}\nconsole.log(coinChange([1,5,11], 15)); // 3`,
      python: `def coin_change(coins, amount):\n    # Your code here\n    pass\nprint(coin_change([1,5,11], 15))`,
      java: `class Solution { public int coinChange(int[] coins, int amount) { return -1; } }`,
      cpp: `#include <vector>\nusing namespace std;\nint coinChange(vector<int>& coins, int amount) { return -1; }`,
      typescript: `function coinChange(coins: number[], amount: number): number { return -1; }`,
      go: `package main\nfunc coinChange(coins []int, amount int) int { return -1 }`,
    },
    testCases: [
      { input: '[1,5,11]\n15', expectedOutput: '3', isHidden: false },
      { input: '[2]\n3', expectedOutput: '-1', isHidden: false },
    ],
    hints: ['Build a dp array where dp[i] = min coins to make amount i.', 'For each amount, try each coin: dp[i] = min(dp[i], dp[i-coin]+1).'],
  },
  {
    title: 'Longest Common Subsequence',
    difficulty: 'Medium',
    tags: ['dp', 'string'],
    description: `Given two strings \`text1\` and \`text2\`, return the length of their longest common subsequence.\n\n**Example:**\nInput: text1="abcde", text2="ace"\nOutput: 3 (ace)`,
    starterCode: {
      javascript: `function longestCommonSubsequence(text1, text2) {\n  // Your code here\n}\nconsole.log(longestCommonSubsequence("abcde","ace")); // 3`,
      python: `def longest_common_subsequence(text1, text2):\n    # Your code here\n    pass\nprint(longest_common_subsequence("abcde","ace"))`,
      java: `class Solution { public int longestCommonSubsequence(String text1, String text2) { return 0; } }`,
      cpp: `#include <string>\nusing namespace std;\nint longestCommonSubsequence(string text1, string text2) { return 0; }`,
      typescript: `function longestCommonSubsequence(text1: string, text2: string): number { return 0; }`,
      go: `package main\nfunc longestCommonSubsequence(text1 string, text2 string) int { return 0 }`,
    },
    testCases: [
      { input: '"abcde"\n"ace"', expectedOutput: '3', isHidden: false },
      { input: '"abc"\n"abc"', expectedOutput: '3', isHidden: false },
    ],
    hints: ['2D DP table: dp[i][j] = LCS of text1[:i] and text2[:j].', 'If chars match: dp[i][j] = 1 + dp[i-1][j-1], else max(dp[i-1][j], dp[i][j-1]).'],
  },
  {
    title: 'Min Cost Climbing Stairs',
    difficulty: 'Easy',
    tags: ['dp'],
    description: `Each step has a cost. You can start at step 0 or 1. You can climb 1 or 2 steps. Find the minimum cost to reach the top.\n\n**Example:**\nInput: cost=[10,15,20]\nOutput: 15`,
    starterCode: {
      javascript: `function minCostClimbingStairs(cost) {\n  // Your code here\n}\nconsole.log(minCostClimbingStairs([10,15,20])); // 15`,
      python: `def min_cost_climbing_stairs(cost):\n    # Your code here\n    pass\nprint(min_cost_climbing_stairs([10,15,20]))`,
      java: `class Solution { public int minCostClimbingStairs(int[] cost) { return 0; } }`,
      cpp: `#include <vector>\nusing namespace std;\nint minCostClimbingStairs(vector<int>& cost) { return 0; }`,
      typescript: `function minCostClimbingStairs(cost: number[]): number { return 0; }`,
      go: `package main\nfunc minCostClimbingStairs(cost []int) int { return 0 }`,
    },
    testCases: [
      { input: '[10,15,20]', expectedOutput: '15', isHidden: false },
      { input: '[1,100,1,1,1,100,1,1,100,1]', expectedOutput: '6', isHidden: false },
    ],
    hints: ['dp[i] = cost[i] + min(dp[i-1], dp[i-2])', 'Answer is min(dp[n-1], dp[n-2]).'],
  },

  // ── Graphs ────────────────────────────────────────────────────────────────
  {
    title: 'Number of Islands',
    difficulty: 'Medium',
    tags: ['graph', 'dfs', 'bfs', 'matrix'],
    description: `Given an m×n grid of '1's (land) and '0's (water), return the number of islands.\n\n**Example:**\nInput: [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]\nOutput: 3`,
    starterCode: {
      javascript: `function numIslands(grid) {\n  // Your code here\n}\nconst grid = [["1","1","0"],["1","1","0"],["0","0","1"]];\nconsole.log(numIslands(grid)); // 2`,
      python: `def num_islands(grid):\n    # Your code here\n    pass`,
      java: `class Solution { public int numIslands(char[][] grid) { return 0; } }`,
      cpp: `#include <vector>\n#include <string>\nusing namespace std;\nint numIslands(vector<vector<char>>& grid) { return 0; }`,
      typescript: `function numIslands(grid: string[][]): number { return 0; }`,
      go: `package main\nfunc numIslands(grid [][]byte) int { return 0 }`,
    },
    testCases: [
      { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expectedOutput: '3', isHidden: false },
    ],
    hints: ['DFS/BFS from each unvisited "1".', 'Mark visited cells as "0" to avoid revisiting.'],
  },
  {
    title: 'Clone Graph',
    difficulty: 'Medium',
    tags: ['graph', 'dfs', 'bfs', 'hashmap'],
    description: `Given a reference to a node in a connected undirected graph, return a deep copy of the graph.\n\n**Example:**\nInput: adjList = [[2,4],[1,3],[2,4],[1,3]]\nOutput: [[2,4],[1,3],[2,4],[1,3]]`,
    starterCode: {
      javascript: `function cloneGraph(node) {\n  // Your code here\n}`,
      python: `def clone_graph(node):\n    # Your code here\n    pass`,
      java: `class Solution { public Node cloneGraph(Node node) { return null; } }`,
      cpp: `Node* cloneGraph(Node* node) { return nullptr; }`,
      typescript: `function cloneGraph(node: Node | null): Node | null { return null; }`,
      go: `func cloneGraph(node *Node) *Node { return nil }`,
    },
    testCases: [],
    hints: ['Use a hash map to map original nodes to cloned nodes.', 'DFS/BFS through original graph, creating clones.'],
  },
  {
    title: 'Course Schedule',
    difficulty: 'Medium',
    tags: ['graph', 'topological-sort', 'cycle-detection'],
    description: `There are \`numCourses\` courses. Given prerequisites as pairs [a,b] meaning b must be taken before a, return true if possible to finish all courses.\n\n**Example:**\nInput: numCourses=2, prerequisites=[[1,0]]\nOutput: true`,
    starterCode: {
      javascript: `function canFinish(numCourses, prerequisites) {\n  // Your code here\n}\nconsole.log(canFinish(2, [[1,0]])); // true\nconsole.log(canFinish(2, [[1,0],[0,1]])); // false`,
      python: `def can_finish(numCourses, prerequisites):\n    # Your code here\n    pass\nprint(can_finish(2, [[1,0]]))`,
      java: `class Solution { public boolean canFinish(int numCourses, int[][] prerequisites) { return false; } }`,
      cpp: `#include <vector>\nusing namespace std;\nbool canFinish(int numCourses, vector<vector<int>>& prerequisites) { return false; }`,
      typescript: `function canFinish(numCourses: number, prerequisites: number[][]): boolean { return false; }`,
      go: `package main\nfunc canFinish(numCourses int, prerequisites [][]int) bool { return false }`,
    },
    testCases: [
      { input: '2\n[[1,0]]', expectedOutput: 'true', isHidden: false },
      { input: '2\n[[1,0],[0,1]]', expectedOutput: 'false', isHidden: false },
    ],
    hints: ['This is cycle detection in a directed graph.', 'Use DFS with 3 states: unvisited, visiting, visited.'],
  },
  {
    title: 'Pacific Atlantic Water Flow',
    difficulty: 'Medium',
    tags: ['graph', 'dfs', 'bfs', 'matrix'],
    description: `Given an m×n matrix of heights, find cells where water can flow to both the Pacific and Atlantic oceans.\n\n**Example:**\nInput: heights=[[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]\nOutput: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]`,
    starterCode: {
      javascript: `function pacificAtlantic(heights) {\n  // Your code here\n}`,
      python: `def pacific_atlantic(heights):\n    # Your code here\n    pass`,
      java: `import java.util.*;\nclass Solution { public List<List<Integer>> pacificAtlantic(int[][] heights) { return new ArrayList<>(); } }`,
      cpp: `#include <vector>\nusing namespace std;\nvector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) { return {}; }`,
      typescript: `function pacificAtlantic(heights: number[][]): number[][] { return []; }`,
      go: `package main\nfunc pacificAtlantic(heights [][]int) [][]int { return nil }`,
    },
    testCases: [],
    hints: ['BFS/DFS backwards from ocean boundaries.', 'Find intersection of cells reachable from both oceans.'],
  },
  {
    title: 'Word Ladder',
    difficulty: 'Hard',
    tags: ['graph', 'bfs', 'string'],
    description: `Given beginWord, endWord, and a wordList, return the length of the shortest transformation sequence from beginWord to endWord, where each step changes exactly one letter.\n\n**Example:**\nInput: beginWord="hit", endWord="cog", wordList=["hot","dot","dog","lot","log","cog"]\nOutput: 5`,
    starterCode: {
      javascript: `function ladderLength(beginWord, endWord, wordList) {\n  // Your code here\n}\nconsole.log(ladderLength("hit","cog",["hot","dot","dog","lot","log","cog"])); // 5`,
      python: `from collections import deque\ndef ladder_length(beginWord, endWord, wordList):\n    # Your code here\n    pass\nprint(ladder_length("hit","cog",["hot","dot","dog","lot","log","cog"]))`,
      java: `import java.util.*;\nclass Solution { public int ladderLength(String beginWord, String endWord, List<String> wordList) { return 0; } }`,
      cpp: `#include <vector>\n#include <string>\nusing namespace std;\nint ladderLength(string beginWord, string endWord, vector<string>& wordList) { return 0; }`,
      typescript: `function ladderLength(beginWord: string, endWord: string, wordList: string[]): number { return 0; }`,
      go: `package main\nfunc ladderLength(beginWord string, endWord string, wordList []string) int { return 0 }`,
    },
    testCases: [
      { input: '"hit"\n"cog"\n["hot","dot","dog","lot","log","cog"]', expectedOutput: '5', isHidden: false },
    ],
    hints: ['BFS from beginWord.', 'Try changing each character to find neighbors in the word list.'],
  },

  // ── Valid Sudoku, Product Except Self, Encode/Decode, Longest Consecutive, Sort Colors ──
  {
    title: 'Valid Sudoku',
    difficulty: 'Medium',
    tags: ['array', 'hashmap', 'matrix'],
    description: `Determine if a 9x9 Sudoku board is valid. Each row, column, and 3x3 box must contain digits 1-9 without repetition.\n\n(Only filled cells need to be validated.)`,
    starterCode: {
      javascript: `function isValidSudoku(board) {\n  // Your code here\n}\n// board is a 9x9 array with digits or '.'`,
      python: `def is_valid_sudoku(board):\n    # Your code here\n    pass`,
      java: `class Solution { public boolean isValidSudoku(char[][] board) { return false; } }`,
      cpp: `#include <vector>\nusing namespace std;\nbool isValidSudoku(vector<vector<char>>& board) { return false; }`,
      typescript: `function isValidSudoku(board: string[][]): boolean { return false; }`,
      go: `package main\nfunc isValidSudoku(board [][]byte) bool { return false }`,
    },
    testCases: [],
    hints: ['Use sets for each row, column, and 3×3 box.', 'Box index = (row/3)*3 + col/3.'],
  },
  {
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    tags: ['array'],
    description: `Given array \`nums\`, return an array \`output\` where \`output[i]\` is the product of all elements except \`nums[i]\`. No division. O(n) time.\n\n**Example:**\nInput: [1,2,3,4]\nOutput: [24,12,8,6]`,
    starterCode: {
      javascript: `function productExceptSelf(nums) {\n  // Your code here\n}\nconsole.log(productExceptSelf([1,2,3,4])); // [24,12,8,6]`,
      python: `def product_except_self(nums):\n    # Your code here\n    pass\nprint(product_except_self([1,2,3,4]))`,
      java: `class Solution { public int[] productExceptSelf(int[] nums) { return new int[]{}; } }`,
      cpp: `#include <vector>\nusing namespace std;\nvector<int> productExceptSelf(vector<int>& nums) { return {}; }`,
      typescript: `function productExceptSelf(nums: number[]): number[] { return []; }`,
      go: `package main\nfunc productExceptSelf(nums []int) []int { return nil }`,
    },
    testCases: [
      { input: '[1,2,3,4]', expectedOutput: '[24,12,8,6]', isHidden: false },
    ],
    hints: ['Compute prefix products left-to-right.', 'Then multiply by suffix products right-to-left.'],
  },
  {
    title: 'Longest Consecutive Sequence',
    difficulty: 'Medium',
    tags: ['array', 'hashmap'],
    description: `Given an unsorted array of integers, find the length of the longest consecutive elements sequence in O(n) time.\n\n**Example:**\nInput: [100,4,200,1,3,2]\nOutput: 4 (sequence: 1,2,3,4)`,
    starterCode: {
      javascript: `function longestConsecutive(nums) {\n  // Your code here\n}\nconsole.log(longestConsecutive([100,4,200,1,3,2])); // 4`,
      python: `def longest_consecutive(nums):\n    # Your code here\n    pass\nprint(longest_consecutive([100,4,200,1,3,2]))`,
      java: `import java.util.*;\nclass Solution { public int longestConsecutive(int[] nums) { return 0; } }`,
      cpp: `#include <vector>\nusing namespace std;\nint longestConsecutive(vector<int>& nums) { return 0; }`,
      typescript: `function longestConsecutive(nums: number[]): number { return 0; }`,
      go: `package main\nfunc longestConsecutive(nums []int) int { return 0 }`,
    },
    testCases: [
      { input: '[100,4,200,1,3,2]', expectedOutput: '4', isHidden: false },
    ],
    hints: ['Put all numbers in a set.', 'Only start counting from n where n-1 is NOT in the set.'],
  },
  {
    title: 'Sort Colors',
    difficulty: 'Medium',
    tags: ['array', 'two-pointers', 'sorting'],
    description: `Given array with values 0, 1, 2 representing red, white, blue. Sort in-place so that 0s come first, then 1s, then 2s.\n\n**Example:**\nInput: [2,0,2,1,1,0]\nOutput: [0,0,1,1,2,2]`,
    starterCode: {
      javascript: `function sortColors(nums) {\n  // Your code here (in-place)\n  return nums;\n}\nconsole.log(sortColors([2,0,2,1,1,0])); // [0,0,1,1,2,2]`,
      python: `def sort_colors(nums):\n    # Your code here (in-place)\n    pass\nnums = [2,0,2,1,1,0]\nsort_colors(nums)\nprint(nums)`,
      java: `class Solution { public void sortColors(int[] nums) {} }`,
      cpp: `#include <vector>\nusing namespace std;\nvoid sortColors(vector<int>& nums) {}`,
      typescript: `function sortColors(nums: number[]): void {}`,
      go: `package main\nfunc sortColors(nums []int) {}`,
    },
    testCases: [
      { input: '[2,0,2,1,1,0]', expectedOutput: '[0,0,1,1,2,2]', isHidden: false },
    ],
    hints: ['Dutch National Flag algorithm: 3 pointers (low, mid, high).', 'Swap based on nums[mid]: 0 goes to low, 2 goes to high.'],
  },
]

async function main() {
  console.log(`Connecting to MongoDB...`)
  await mongoose.connect(MONGODB_URI)
  console.log('Connected!\n')

  // Clear existing
  await Problem.deleteMany({})
  console.log('Cleared existing problems.')

  // Seed
  const inserted = await Problem.insertMany(problems)
  console.log(`\n✅ Seeded ${inserted.length} problems:\n`)

  const byDiff = { Easy: 0, Medium: 0, Hard: 0 }
  inserted.forEach((p: any) => {
    byDiff[p.difficulty as keyof typeof byDiff]++
    console.log(`  ${p.difficulty.padEnd(6)} ${p.title}`)
  })

  console.log(`\nBreakdown: Easy=${byDiff.Easy} Medium=${byDiff.Medium} Hard=${byDiff.Hard}`)
  await mongoose.disconnect()
  console.log('\nDone! 🎉')
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
