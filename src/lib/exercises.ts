import { SupportedLanguageId } from "@/lib/languages";

export interface SampleTestCase {
  id: string;
  inputDescription: string;
  stdin: string;
  expectedOutput: string;
}

export interface PracticeExercise {
  id: string;
  title: string;
  topic: "Variables & Types" | "Conditions" | "Loops" | "Functions" | "Collections";
  difficulty: "Beginner" | "Easy" | "Intermediate";
  description: string;
  problemStatement: string;
  starterCode: Record<SupportedLanguageId, string>;
  hints: string[];
  sampleTests: SampleTestCase[];
  requiredConstructs: Record<SupportedLanguageId, RegExp[]>;
  postAttemptExplanation: string;
}

export const PRACTICE_EXERCISES: PracticeExercise[] = [
  {
    id: "ex-variables-greeting",
    title: "1. Format Student Age & Name Without Type Errors",
    topic: "Variables & Types",
    difficulty: "Beginner",
    description: "Learn how to combine text strings and integer numbers safely.",
    problemStatement:
      "Given a student name `\"Asha\"` and an integer variable `age = 19`, print the exact sentence: `Asha is 19 years old` without causing a TypeError.",
    starterCode: {
      python: `name = "Asha"\nage = 19\n# Fix the line below so it prints: Asha is 19 years old\nprint(name + " is " + age + " years old")`,
      javascript: `const name = "Asha";\nconst age = 19;\n// Print: Asha is 19 years old\nconsole.log(name + " is " + age + " years old");`,
      java: `public class Main {\n    public static void main(String[] args) {\n        String name = "Asha";\n        int age = 19;\n        System.out.println(name + " is " + age + " years old");\n    }\n}`,
      c: `#include <stdio.h>\n\nint main() {\n    char name[] = "Asha";\n    int age = 19;\n    printf("%s is %d years old\\n", name, age);\n    return 0;\n}`,
      cpp: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name = "Asha";\n    int age = 19;\n    cout << name << " is " << age << " years old" << endl;\n    return 0;\n}`,
    },
    hints: [
      "In Python, you cannot directly join a string (`str`) and an integer (`int`) with `+` unless you convert the number to text first.",
      "What built-in function converts `19` into `\"19\"` in Python, or how can you use an f-string `f\"...\"`?",
      "Wrap `age` with `str(age)` or use `f\"{name} is {age} years old\"`.",
    ],
    sampleTests: [
      {
        id: "t1",
        inputDescription: "Default variables (name='Asha', age=19)",
        stdin: "",
        expectedOutput: "Asha is 19 years old",
      },
    ],
    requiredConstructs: {
      python: [/Asha/, /19/, /(str\s*\(\s*age\s*\)|f["'].*\{age\}|print\s*\(\s*name\s*,)/],
      javascript: [/console\.log/, /Asha/, /19/],
      java: [/System\.out\.print/, /Asha/, /19/],
      c: [/printf/, /%s/, /%d/],
      cpp: [/cout/, /Asha/, /19/],
    },
    postAttemptExplanation:
      "Strongly typed operations require matching data types. In Python, `+` between a `str` and `int` raises a `TypeError`, so converting with `str(age)` or using `f\"{name} is {age} years old\"` solves the mismatch cleanly.",
  },
  {
    id: "ex-conditions-grade",
    title: "2. Exam Pass/Fail Decision Check",
    topic: "Conditions",
    difficulty: "Beginner",
    description: "Use comparison operators (`>=` and `==`) accurately inside `if/else` blocks.",
    problemStatement:
      "Write a conditional check for `score = 75`. If `score` is 50 or higher, print `PASS`. Otherwise, print `NEEDS IMPROVEMENT`.",
    starterCode: {
      python: `score = 75\n# Write an if/else statement to check if score >= 50:\n`,
      javascript: `const score = 75;\n// Write an if/else statement to check if score >= 50:\n`,
      java: `public class Main {\n    public static void main(String[] args) {\n        int score = 75;\n        // Check if score >= 50 and print PASS or NEEDS IMPROVEMENT\n    }\n}`,
      c: `#include <stdio.h>\n\nint main() {\n    int score = 75;\n    // Check if score >= 50 and print PASS or NEEDS IMPROVEMENT\n    return 0;\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int score = 75;\n    // Check if score >= 50 and print PASS or NEEDS IMPROVEMENT\n    return 0;\n}`,
    },
    hints: [
      "Use the `>=` (greater than or equal to) operator so a score of exactly 50 also counts as passing.",
      "Make sure your `if` branch prints `PASS` and your `else` branch prints `NEEDS IMPROVEMENT`.",
    ],
    sampleTests: [
      {
        id: "t1",
        inputDescription: "score = 75",
        stdin: "",
        expectedOutput: "PASS",
      },
    ],
    requiredConstructs: {
      python: [/\bif\b/, />=\s*50|>\s*49/, /PASS/],
      javascript: [/\bif\b/, />=\s*50|>\s*49/, /PASS/],
      java: [/\bif\b/, />=\s*50|>\s*49/, /PASS/],
      c: [/\bif\b/, />=\s*50|>\s*49/, /PASS/],
      cpp: [/\bif\b/, />=\s*50|>\s*49/, /PASS/],
    },
    postAttemptExplanation:
      "Boundary conditions matter! Using `score >= 50` instead of `score > 50` ensures a student who scores exactly 50 passes the exam.",
  },
  {
    id: "ex-loops-sum",
    title: "3. Fix the Off-By-One Array Sum Loop",
    topic: "Loops",
    difficulty: "Easy",
    description: "Traverse a list/array from index 0 to length - 1 without going out of bounds.",
    problemStatement:
      "The starter code tries to sum the array `[10, 20, 30, 40]` (expected sum: `100`), but its loop condition goes one step too far! Fix the loop bounds so it prints `100`.",
    starterCode: {
      python: `numbers = [10, 20, 30, 40]\ntotal = 0\n# Bug: range(len(numbers) + 1) goes out of bounds!\nfor i in range(len(numbers) + 1):\n    total += numbers[i]\nprint(total)`,
      javascript: `const numbers = [10, 20, 30, 40];\nlet total = 0;\n// Bug: i <= numbers.length goes out of bounds!\nfor (let i = 0; i <= numbers.length; i++) {\n  total += numbers[i];\n}\nconsole.log(total);`,
      java: `public class Main {\n    public static void main(String[] args) {\n        int[] numbers = {10, 20, 30, 40};\n        int total = 0;\n        for (int i = 0; i <= numbers.length; i++) {\n            total += numbers[i];\n        }\n        System.out.println(total);\n    }\n}`,
      c: `#include <stdio.h>\n\nint main() {\n    int numbers[] = {10, 20, 30, 40};\n    int length = 4;\n    int total = 0;\n    for (int i = 0; i <= length; i++) {\n        total += numbers[i];\n    }\n    printf("%d\\n", total);\n    return 0;\n}`,
      cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> numbers = {10, 20, 30, 40};\n    int total = 0;\n    for (size_t i = 0; i <= numbers.size(); i++) {\n        total += numbers[i];\n    }\n    cout << total << endl;\n    return 0;\n}`,
    },
    hints: [
      "A 4-element collection has valid indices 0, 1, 2, and 3. Index 4 is outside the collection!",
      "In Python, `range(len(numbers))` stops at 3. In JS/Java/C/C++, `i < length` stops at 3.",
    ],
    sampleTests: [
      {
        id: "t1",
        inputDescription: "numbers = [10, 20, 30, 40]",
        stdin: "",
        expectedOutput: "100",
      },
    ],
    requiredConstructs: {
      python: [/for\s+/, /range\s*\(\s*len\s*\(\s*numbers\s*\)\s*\)|for\s+\w+\s+in\s+numbers/],
      javascript: [/i\s*<\s*numbers\.length|for\s*\(\s*(const|let)\s+\w+\s+of\s+numbers/],
      java: [/i\s*<\s*numbers\.length|for\s*\(\s*int\s+\w+\s*:\s*numbers/],
      c: [/i\s*<\s*length/],
      cpp: [/i\s*<\s*numbers\.size\(\)|for\s*\(\s*int\s+\w+\s*:\s*numbers/],
    },
    postAttemptExplanation:
      "Off-by-one errors are among the most common bugs in computer science. Because arrays are zero-indexed, the valid index range for `N` items is always `0` through `N - 1` (`i < N`).",
  },
  {
    id: "ex-functions-square",
    title: "4. Write a Reusable Function with a Return Value",
    topic: "Functions",
    difficulty: "Easy",
    description: "Understand the difference between printing inside a function and returning a value.",
    problemStatement:
      "Complete the function `squareNumber(n)` so that it returns `n * n` instead of nothing, allowing the main program to print `25` when `n = 5`.",
    starterCode: {
      python: `def square_number(n):\n    result = n * n\n    # Add a return statement here!\n\nprint(square_number(5))`,
      javascript: `function squareNumber(n) {\n  const result = n * n;\n  // Add a return statement here!\n}\n\nconsole.log(squareNumber(5));`,
      java: `public class Main {\n    public static int squareNumber(int n) {\n        int result = n * n;\n        // Return result here!\n        return 0;\n    }\n    public static void main(String[] args) {\n        System.out.println(squareNumber(5));\n    }\n}`,
      c: `#include <stdio.h>\n\nint squareNumber(int n) {\n    int result = n * n;\n    // Return result here!\n    return 0;\n}\n\nint main() {\n    printf("%d\\n", squareNumber(5));\n    return 0;\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint squareNumber(int n) {\n    int result = n * n;\n    // Return result here!\n    return 0;\n}\n\nint main() {\n    cout << squareNumber(5) << endl;\n    return 0;\n}`,
    },
    hints: [
      "Without `return result`, a Python or JS function returns `None` or `undefined`.",
      "Use the `return` keyword to send `result` (or `n * n`) back to the caller.",
    ],
    sampleTests: [
      {
        id: "t1",
        inputDescription: "n = 5",
        stdin: "",
        expectedOutput: "25",
      },
    ],
    requiredConstructs: {
      python: [/return\s+(result|n\s*\*\s*n|n\s*\*\*\s*2)/],
      javascript: [/return\s+(result|n\s*\*\s*n|n\s*\*\*\s*2)/],
      java: [/return\s+(result|n\s*\*\s*n)\s*;/],
      c: [/return\s+(result|n\s*\*\s*n)\s*;/],
      cpp: [/return\s+(result|n\s*\*\s*n)\s*;/],
    },
    postAttemptExplanation:
      "Calculating a value inside a function only keeps it in a local variable unless you explicitly `return` it to the caller.",
  },
  {
    id: "ex-collections-max",
    title: "5. Find the Largest Number in a Collection",
    topic: "Collections",
    difficulty: "Intermediate",
    description: "Combine array indexing, loops, and conditional comparisons to track the maximum value.",
    problemStatement:
      "Given the collection `[14, 42, 29, 88, 19]`, loop through the items to update `maxVal` whenever you find a larger number, then print `88`.",
    starterCode: {
      python: `items = [14, 42, 29, 88, 19]\nmax_val = items[0]\nfor num in items:\n    # Update max_val if num is greater than max_val\n    pass\nprint(max_val)`,
      javascript: `const items = [14, 42, 29, 88, 19];\nlet maxVal = items[0];\nfor (const num of items) {\n  // Update maxVal if num is greater than maxVal\n}\nconsole.log(maxVal);`,
      java: `public class Main {\n    public static void main(String[] args) {\n        int[] items = {14, 42, 29, 88, 19};\n        int maxVal = items[0];\n        for (int num : items) {\n            // Update maxVal if num > maxVal\n        }\n        System.out.println(maxVal);\n    }\n}`,
      c: `#include <stdio.h>\n\nint main() {\n    int items[] = {14, 42, 29, 88, 19};\n    int maxVal = items[0];\n    for (int i = 1; i < 5; i++) {\n        // Update maxVal if items[i] > maxVal\n    }\n    printf("%d\\n", maxVal);\n    return 0;\n}`,
      cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> items = {14, 42, 29, 88, 19};\n    int maxVal = items[0];\n    for (int num : items) {\n        // Update maxVal if num > maxVal\n    }\n    cout << maxVal << endl;\n    return 0;\n}`,
    },
    hints: [
      "Inside the loop, compare the current element (`num` or `items[i]`) with your current champion (`max_val` / `maxVal`).",
      "If the current element is greater (`>`), assign it as the new `max_val`.",
    ],
    sampleTests: [
      {
        id: "t1",
        inputDescription: "items = [14, 42, 29, 88, 19]",
        stdin: "",
        expectedOutput: "88",
      },
    ],
    requiredConstructs: {
      python: [/(if\s+num\s*>\s*max_val|max\s*\(\s*items\s*\))/],
      javascript: [/(if\s*\(\s*num\s*>\s*maxVal|Math\.max)/],
      java: [/if\s*\(\s*num\s*>\s*maxVal\s*\)/],
      c: [/if\s*\(\s*items\[i\]\s*>\s*maxVal\s*\)/],
      cpp: [/if\s*\(\s*num\s*>\s*maxVal\s*\)/],
    },
    postAttemptExplanation:
      "The 'King of the Hill' pattern initializes `maxVal` to the first element (`items[0]`) and updates it whenever a challenger (`num > maxVal`) beats the current record.",
  },
];
