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
  status: 'waiting' | 'active' | 'ended'
  language: string
  problemId?: string
  hintsEnabled: boolean
  maxHints: number
  durationMinutes: number
  candidateName?: string
  candidateEmail?: string
  candidatePhone?: string
  candidatePosition?: string
  candidateLinkedin?: string
  experienceLevel?: 'junior' | 'mid' | 'senior' | 'staff' | 'principal'
  description?: string
  scheduledAt?: string
  createdAt: Date
  expiresAt: Date
  endedAt?: Date
}

export interface Problem {
  _id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tags: string[]
  description: string
  starterCode: {
    javascript: string
    python: string
    java: string
    cpp: string
    typescript: string
    go: string
  }
  testCases: {
    input: string
    expectedOutput: string
    isHidden: boolean
  }[]
  hints: string[]
}

export interface TestCase {
  input: string
  expectedOutput: string
  actualOutput?: string
  passed?: boolean
  isCustomInput?: boolean
  stderr?: string
}

export interface ExecutionResult {
  stdout: string | null
  stderr: string | null
  status: string
  time: string
  memory: number
  testCases?: TestCase[]
}

export interface Snapshot {
  _id: string
  roomId: string
  code: string
  language: string
  hintsUsed: number
  testResults: {
    input: string
    expected: string
    actual: string
    passed: boolean
  }[]
  aiReview?: string
  timestamp: Date
  trigger: 'auto' | 'execution' | 'manual' | 'end'
}

export type UserRole = 'interviewer' | 'candidate'

export interface ActiveUser {
  socketId: string
  name: string
  color: string
  role: UserRole
  email?: string
}

export interface CursorPosition {
  lineNumber: number
  column: number
}

export interface LiveRoomState {
  roomId: string
  code: string
  language: string
  testCases: TestCase[]
  output: ExecutionResult | null
  notes: string
  hintsUsed: number
  hintsPerCandidate?: Record<string, number>
  hintsEnabled: boolean
  maxHints: number
  editorLockedBy: string | null
  controlledBy: 'interviewer' | 'candidate'
  status: 'waiting' | 'active' | 'ended'
  problemId?: string
  users: ActiveUser[]
  timerStartedAt?: number
  timerDurationMs?: number
}

export const LANGUAGE_LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python:     'Python',
  java:       'Java',
  cpp:        'C++',
  c:          'C',
  go:         'Go',
  rust:       'Rust',
}

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_LABELS)

export const STARTER_CODE: Record<string, string> = {
  javascript: `// JavaScript\nfunction solution(nums, target) {\n  // Your code here\n}\n\nconsole.log(solution([2, 7, 11, 15], 9));`,
  typescript: `// TypeScript\nfunction solution(nums: number[], target: number): number[] {\n  // Your code here\n  return [];\n}\n\nconsole.log(solution([2, 7, 11, 15], 9));`,
  python:     `# Python\ndef solution(nums, target):\n    # Your code here\n    pass\n\nprint(solution([2, 7, 11, 15], 9))`,
  java:       `// Java\nclass Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}`,
  cpp:        `// C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}`,
  c:          `// C\n#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}`,
  go:         `// Go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}`,
  rust:       `// Rust\nfn main() {\n    println!("Hello World");\n}`,
}
