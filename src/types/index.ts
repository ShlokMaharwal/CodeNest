

export interface User {
  id: string
  name: string
  email: string
  color: string
}

export interface Room {
  _id: string
  roomId: string
  title: string
  createdBy: string
  language: string
  createdAt: Date
  isActive: boolean
}

export interface TestCase {
  input: string
  expectedOutput: string
  actualOutput?: string
  passed?: boolean
  isCustomInput?: boolean
}

export interface ExecutionResult {
  stdout: string | null
  stderr: string | null
  status: string
  time: string
  memory: number
  testCases?: TestCase[]
}

export interface RoomState {
  code: string
  language: string
  users: ActiveUser[]
  testCases: TestCase[]
  output: ExecutionResult | null
}

export interface ActiveUser {
  id: string
  name: string
  color: string
}

export interface CursorPosition {
  lineNumber: number
  column: number
}


export const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  go: 60,
  rust: 73,
}

export const LANGUAGE_LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  go: 'Go',
  rust: 'Rust',
}


export const STARTER_CODE: Record<string, string> = {
  javascript: `// JavaScript\nfunction solution(input) {\n  // Your code here\n  return input;\n}\n\nconsole.log(solution("Hello World"));`,
  typescript: `// TypeScript\nfunction solution(input: string): string {\n  // Your code here\n  return input;\n}\n\nconsole.log(solution("Hello World"));`,
  python: `# Python\ndef solution(input_val):\n    # Your code here\n    return input_val\n\nprint(solution("Hello World"))`,
  java: `// Java\nclass Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}`,
  cpp: `// C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}`,
  c: `// C\n#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}`,
  go: `// Go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}`,
  rust: `// Rust\nfn main() {\n    println!("Hello World");\n}`,
}
