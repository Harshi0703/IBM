export type SupportedLanguageId = "python" | "javascript" | "java" | "c" | "cpp";

export interface CodeTemplate {
  id: string;
  title: string;
  description: string;
  category: "starter" | "buggy" | "algorithm";
  code: string;
  sampleInput?: string;
}

export interface LanguageConfig {
  id: SupportedLanguageId;
  name: string;
  monacoLanguage: string;
  extension: string;
  judge0Id: number;
  versionLabel: string;
  badgeColor: string;
  defaultCode: string;
  buggyCode: string;
  templates: CodeTemplate[];
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguageId, LanguageConfig> = {
  python: {
    id: "python",
    name: "Python",
    monacoLanguage: "python",
    extension: ".py",
    judge0Id: 71, // Python 3.8+
    versionLabel: "Python 3.11",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    defaultCode: `def calculate_average(scores):
    """Calculate the average of a list of exam scores."""
    total = 0
    for score in scores:
        total += score
    average = total / len(scores)
    return average

student_scores = [85, 92, 78, 90, 88]
result = calculate_average(student_scores)
print("Student Average:", result)
if result >= 85:
    print("Status: Distinction!")
else:
    print("Status: Keep practicing!")`,
    buggyCode: `# Buggy Python Program: Age & Exam Eligibility Checker
age = 20
print("Student is " + age + " years old")

scores = [80, 90, 75]
total = 0
for i in range(len(scores) + 1):
    total = total + scores[i]

print("Total score:", total)`,
    templates: [
      {
        id: "py-starter-avg",
        title: "Exam Average Calculator (Working)",
        description: "Demonstrates functions, loops, lists, and conditional statements.",
        category: "starter",
        code: `def calculate_average(scores):
    """Calculate the average of a list of exam scores."""
    total = 0
    for score in scores:
        total += score
    average = total / len(scores)
    return average

student_scores = [85, 92, 78, 90, 88]
result = calculate_average(student_scores)
print("Student Average:", result)
if result >= 85:
    print("Status: Distinction!")
else:
    print("Status: Keep practicing!")`,
      },
      {
        id: "py-bug-typeerror",
        title: "Type Mismatch & Off-By-One Bug",
        description: "Contains a classic TypeError (string + int) and an IndexError loop bug.",
        category: "buggy",
        code: `# Buggy Python Program: Age & Exam Eligibility Checker
age = 20
print("Student is " + age + " years old")

scores = [80, 90, 75]
total = 0
for i in range(len(scores) + 1):
    total = total + scores[i]

print("Total score:", total)`,
      },
      {
        id: "py-bug-division",
        title: "Empty List ZeroDivisionError",
        description: "Explore what happens when a function divides by the length of an empty list.",
        category: "buggy",
        code: `def find_mean(numbers):
    total = sum(numbers)
    return total / len(numbers)

data = []
print("Average is:", find_mean(data))`,
      },
    ],
  },
  javascript: {
    id: "javascript",
    name: "JavaScript",
    monacoLanguage: "javascript",
    extension: ".js",
    judge0Id: 63, // Node.js
    versionLabel: "Node.js 20 (ES2023)",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    defaultCode: `function filterPassingStudents(students, passingScore) {
  const passed = [];
  for (let i = 0; i < students.length; i++) {
    if (students[i].score >= passingScore) {
      passed.push(students[i].name);
    }
  }
  return passed;
}

const roster = [
  { name: "Aarav", score: 88 },
  { name: "Diya", score: 49 },
  { name: "Kabir", score: 76 }
];

const winners = filterPassingStudents(roster, 50);
console.log("Passing students:", winners.join(", "));`,
    buggyCode: `// Buggy JavaScript Program: Cart Total Calculator
function calculateCartTotal(prices) {
  let total = 0;
  for (let i = 0; i <= prices.length; i++) {
    total += prices[i];
  }
  return total;
}

const itemPrices = [199, 249, 99];
const finalAmount = calculateCartTotal(itemPrices);
console.log("Cart Total: ₹" + finalAmount);`,
    templates: [
      {
        id: "js-starter-filter",
        title: "Filter Passing Students (Working)",
        description: "Uses arrays of objects, loops, and conditional checks.",
        category: "starter",
        code: `function filterPassingStudents(students, passingScore) {
  const passed = [];
  for (let i = 0; i < students.length; i++) {
    if (students[i].score >= passingScore) {
      passed.push(students[i].name);
    }
  }
  return passed;
}

const roster = [
  { name: "Aarav", score: 88 },
  { name: "Diya", score: 49 },
  { name: "Kabir", score: 76 }
];

const winners = filterPassingStudents(roster, 50);
console.log("Passing students:", winners.join(", "));`,
      },
      {
        id: "js-bug-offbyone",
        title: "NaN Cart Total Bug (Off-By-One)",
        description: "Why does adding array elements with <= produce NaN in JavaScript?",
        category: "buggy",
        code: `// Buggy JavaScript Program: Cart Total Calculator
function calculateCartTotal(prices) {
  let total = 0;
  for (let i = 0; i <= prices.length; i++) {
    total += prices[i];
  }
  return total;
}

const itemPrices = [199, 249, 99];
const finalAmount = calculateCartTotal(itemPrices);
console.log("Cart Total: ₹" + finalAmount);`,
      },
    ],
  },
  java: {
    id: "java",
    name: "Java",
    monacoLanguage: "java",
    extension: ".java",
    judge0Id: 62, // OpenJDK
    versionLabel: "OpenJDK 17",
    badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    defaultCode: `public class Main {
    public static int findMax(int[] numbers) {
        int maxVal = numbers[0];
        for (int i = 1; i < numbers.length; i++) {
            if (numbers[i] > maxVal) {
                maxVal = numbers[i];
            }
        }
        return maxVal;
    }

    public static void main(String[] args) {
        int[] marks = {72, 95, 84, 68, 91};
        int highest = findMax(marks);
        System.out.println("Highest mark in class: " + highest);
    }
}`,
    buggyCode: `public class Main {
    public static void main(String[] args) {
        String status = new String("PASS");
        // Bug 1: Comparing strings with == instead of .equals()
        // Bug 2: Array index out of bounds
        int[] values = {10, 20, 30};
        int sum = 0;
        for (int i = 0; i <= values.length; i++) {
            sum += values[i];
        }
        if (status == "PASS") {
            System.out.println("Total sum: " + sum);
        }
    }
}`,
    templates: [
      {
        id: "java-starter-max",
        title: "Find Maximum Element (Working)",
        description: "Demonstrates static methods, integer arrays, and loop traversal in Java.",
        category: "starter",
        code: `public class Main {
    public static int findMax(int[] numbers) {
        int maxVal = numbers[0];
        for (int i = 1; i < numbers.length; i++) {
            if (numbers[i] > maxVal) {
                maxVal = numbers[i];
            }
        }
        return maxVal;
    }

    public static void main(String[] args) {
        int[] marks = {72, 95, 84, 68, 91};
        int highest = findMax(marks);
        System.out.println("Highest mark in class: " + highest);
    }
}`,
      },
      {
        id: "java-bug-bounds",
        title: "ArrayIndexOutOfBounds & String Comparison Bug",
        description: "Classic BCA practical exam bugs: <= on array length and == on Strings.",
        category: "buggy",
        code: `public class Main {
    public static void main(String[] args) {
        String status = new String("PASS");
        int[] values = {10, 20, 30};
        int sum = 0;
        for (int i = 0; i <= values.length; i++) {
            sum += values[i];
        }
        if (status == "PASS") {
            System.out.println("Total sum: " + sum);
        }
    }
}`,
      },
    ],
  },
  c: {
    id: "c",
    name: "C",
    monacoLanguage: "c",
    extension: ".c",
    judge0Id: 50, // GCC 9.2.0
    versionLabel: "GCC 11 (C17)",
    badgeColor: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
    defaultCode: `#include <stdio.h>

int factorial(int n) {
    int result = 1;
    for (int i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}

int main() {
    int number = 5;
    printf("Factorial of %d is %d\\n", number, factorial(number));
    return 0;
}`,
    buggyCode: `#include <stdio.h>

int main() {
    int count = 5;
    int sum; // Uninitialized variable bug!
    for (int i = 1; i <= count; i++) {
        sum = sum + i;
    }
    // Assignment (=) instead of equality (==) in condition!
    if (count = 10) {
        printf("Count reached ten!\\n");
    }
    printf("Sum is: %d\\n", sum);
    return 0;
}`,
    templates: [
      {
        id: "c-starter-factorial",
        title: "Iterative Factorial (Working)",
        description: "Computes n! using a function and a for-loop in standard C.",
        category: "starter",
        code: `#include <stdio.h>

int factorial(int n) {
    int result = 1;
    for (int i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}

int main() {
    int number = 5;
    printf("Factorial of %d is %d\\n", number, factorial(number));
    return 0;
}`,
      },
      {
        id: "c-bug-uninit",
        title: "Uninitialized Variable & '=' in Condition",
        description: "Two classic C bugs: garbage memory in sum and accidental assignment in if().",
        category: "buggy",
        code: `#include <stdio.h>

int main() {
    int count = 5;
    int sum; // Uninitialized variable bug!
    for (int i = 1; i <= count; i++) {
        sum = sum + i;
    }
    if (count = 10) {
        printf("Count reached ten!\\n");
    }
    printf("Sum is: %d\\n", sum);
    return 0;
}`,
      },
    ],
  },
  cpp: {
    id: "cpp",
    name: "C++",
    monacoLanguage: "cpp",
    extension: ".cpp",
    judge0Id: 54, // GCC C++
    versionLabel: "G++ 11 (C++20)",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    defaultCode: `#include <iostream>
#include <vector>
using namespace std;

int countEvens(const vector<int>& nums) {
    int count = 0;
    for (int num : nums) {
        if (num % 2 == 0) {
            count++;
        }
    }
    return count;
}

int main() {
    vector<int> data = {12, 7, 18, 21, 34, 9};
    cout << "Even numbers found: " << countEvens(data) << endl;
    return 0;
}`,
    buggyCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> scores = {10, 20, 30};
    int total = 0;
    // Bug: <= scores.size() reads past the end of the vector
    for (size_t i = 0; i <= scores.size(); i++) {
        total += scores[i];
    }
    cout << "Average: " << total / 0 << endl;
    return 0;
}`,
    templates: [
      {
        id: "cpp-starter-evens",
        title: "Count Even Numbers with std::vector (Working)",
        description: "Demonstrates C++ vectors, pass-by-const-reference, and range-based loops.",
        category: "starter",
        code: `#include <iostream>
#include <vector>
using namespace std;

int countEvens(const vector<int>& nums) {
    int count = 0;
    for (int num : nums) {
        if (num % 2 == 0) {
            count++;
        }
    }
    return count;
}

int main() {
    vector<int> data = {12, 7, 18, 21, 34, 9};
    cout << "Even numbers found: " << countEvens(data) << endl;
    return 0;
}`,
      },
      {
        id: "cpp-bug-vector",
        title: "Vector Out-of-Bounds & Division by Zero",
        description: "Out-of-range vector indexing and division by zero in C++.",
        category: "buggy",
        code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> scores = {10, 20, 30};
    int total = 0;
    for (size_t i = 0; i <= scores.size(); i++) {
        total += scores[i];
    }
    cout << "Average: " << total / 0 << endl;
    return 0;
}`,
      },
    ],
  },
};

export const LANGUAGE_LIST: LanguageConfig[] = Object.values(SUPPORTED_LANGUAGES);

export function isSupportedLanguage(lang: string): lang is SupportedLanguageId {
  return lang in SUPPORTED_LANGUAGES;
}

export function getLanguageConfig(lang: string): LanguageConfig {
  if (isSupportedLanguage(lang)) {
    return SUPPORTED_LANGUAGES[lang];
  }
  return SUPPORTED_LANGUAGES.python;
}
