# CodeMentor AI — AI Code Explainer, Socratic Tutor & Debugger

> **"Don't just fix the code. Teach the student how to fix it."**

**CodeMentor AI** is a full-stack programming education, code explanation, and Socratic debugging platform designed for first-year computer science / BCA students, programming beginners, and self-taught developers.

Instead of blindly rewriting broken code, CodeMentor AI helps students understand **what** their code does, **why** an error occurred, **where** it is located, and **how** to fix and prevent similar bugs independently.

---

## 1. Features Implemented

- **A. Landing Page (`/`)**: Hero section, interactive Socratic Tutor preview (`Diagnosis`, `Location`, `Concept`, `Next Step`), feature showcase, 6-step educational workflow, and language launchers.
- **B. Student Learning Dashboard (`/dashboard`)**: Quick shortcuts (*Explain Code*, *Debug My Code*, *Practice Mode*), real recorded learning activity counters (no fabricated badges or scores), recently used languages, saved sessions, and beginner debugging tips.
- **C. 3-Panel Coding Workspace (`/workspace`)**:
  - **Monaco Code Editor** with syntax highlighting for **Python**, **JavaScript**, **Java**, **C**, and **C++**.
  - Starter and Buggy templates for every language.
  - **Learning Mode Toggle** (*Socratic Learning Mode* vs. *Direct Help Mode*).
  - Collapsible **Execution Output & Error Diagnostics** drawer supporting standard input (`stdin`) and pasted compiler/runtime tracebacks.
- **D. Structured Code Explanation Interface**:
  1. Overview
  2. Line-by-Line Explanation
  3. Programming Concepts Used (with real-world analogies)
  4. Execution Walkthrough
  5. Expected Output (clearly labeled as *Verified by Sandbox Execution* or *Unverified Static Prediction*)
  6. Interactive Learning Check multiple-choice question
- **E. Structured AI Debugging Interface**:
  - 4-part Socratic Diagnosis (**Diagnosis**, **Location**, **Concept**, **Next Step**)
  - Error Category classification (*Syntax*, *Runtime*, *Type*, *Undefined/Uninitialized Variable*, *Incorrect Condition*, *Off-By-One/Bounds*, *Logic*, *Division By Zero*)
  - Verification badge (*Confirmed by Execution* vs. *Inferred from Static Analysis*)
  - Gated **Before & After Code Comparison** with change explanations and one-click *Apply to Editor*
  - Future Prevention Tip & Similar Exercise prompt
- **F. Socratic Learning Mode (Signature Feature)**:
  - Student hypothesis prompt (*"What do you think this code should do?"*)
  - 4-level progressive hint ladder (Hints 1–3 follow **The Golden Rule**; Hint 4 activates **The Frustration Protocol** with a generic `foo/apples` syntax example)
  - Interactive action buttons: *Give me a hint*, *Explain this concept*, *Let me try*, *Show the correction*, *Give me a similar exercise*
  - Contextual **Socratic Tutor Chat** (`/api/tutor` & `/api/chat`)
- **G. Guided Practice Mode (`/practice`)**:
  - 5 multi-language beginner challenges covering *Variables & Types*, *Conditions*, *Loops*, *Functions*, and *Collections*
  - Progressive hints, visible sample test cases, and post-attempt concept takeaways
- **H. Saved Projects & History (`/projects`)**:
  - Create, rename, reopen, copy, export (`.json`), and delete saved sessions backed by SQLite + Prisma (with automatic local file fallback).
- **I. Workspace Settings (`/settings`)**:
  - Light / Dark theme toggle, default programming language, Learning Mode default preference, Monaco font size, split vs. stacked layout, and live backend integration status.

---

## 2. Architecture & Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, Strict TypeScript, Tailwind CSS, `@monaco-editor/react`, `lucide-react`
- **Backend API Routes**:
  - `POST /api/explain` — Structured beginner code explanation
  - `POST /api/debug` — Structured debugging & before/after comparison
  - `POST /api/hint` — 4-stage progressive Socratic hints
  - `POST /api/tutor` & `POST /api/chat` — Socratic Tutor conversation with Prisma snapshot persistence
  - `POST /api/execute` — Isolated Judge0 sandbox code execution adapter
  - `GET / POST /api/projects` & `GET / PATCH / DELETE /api/projects/[id]` — Session persistence
  - `GET /api/status` — Transparent AI & Sandbox configuration status
- **Validation & Security**: Zod request/response validation (`src/lib/validation.ts`), sliding-window rate limiting (`src/lib/rate-limit.ts`), payload size limits, and strict prohibition of local host code execution.
- **Database**: SQLite with Prisma ORM (`prisma/schema.prisma`) storing `Project`, `CodeSubmission`, and `Message` records.

---

## 3. Prerequisites

- **Node.js**: v18.18+ or v20 LTS (Node v20.18.3 LTS is pre-installed in `%LOCALAPPDATA%\Programs\nodejs`)
- **npm**: v9+ or v10+

---

## 4. Installation & Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Initialize the SQLite database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Environment Configuration (`.env`)

| Variable | Required | Description |
| :--- | :---: | :--- |
| `DATABASE_URL` | Yes | SQLite connection string (default: `"file:./dev.db"`) |
| `GEMINI_API_KEY` | Optional* | Google Gemini API key from [Google AI Studio](https://aistudio.google.com/) |
| `GEMINI_MODEL` | Optional | Gemini model identifier (default: `"gemini-2.5-flash"`) |
| `JUDGE0_API_URL` | Optional* | Isolated Judge0 CE API base URL (e.g., `https://judge0-ce.p.rapidapi.com`) |
| `JUDGE0_API_KEY` | Optional | RapidAPI key or self-hosted Judge0 auth token |
| `JUDGE0_API_HOST` | Optional | Judge0 RapidAPI host header |

*\*When `GEMINI_API_KEY` is omitted, CodeMentor AI runs in a clearly labeled **Educational Demo Mode** powered by static code analysis (`analyzeCodeStatically`). It never pretends that static/demo responses came from a live LLM.*
*\*When `JUDGE0_API_URL` is omitted, code execution is safely disabled with clear setup instructions, while explanations, static debugging, and Socratic hints remain fully functional.*

---

## 6. Testing & Quality Assurance

Run the automated test suite (Vitest unit + API integration tests):
```bash
npm test
```

Run strict TypeScript type checking:
```bash
npm run typecheck
```

Run production build verification:
```bash
npm run build
```

---

## 7. Known Limitations & Next Steps

1. **Sandbox Execution Requires External Judge0 Endpoint**: For security, arbitrary user code is never executed on the Next.js host server. Configure `JUDGE0_API_URL` to enable live runtime execution.
2. **Guest Persistence**: Projects are stored locally in SQLite (`prisma/dev.db`). Multi-user authentication (e.g., NextAuth) can be layered onto the `Project` model for cloud deployments.
3. **Static Analysis Coverage in Demo Mode**: When `GEMINI_API_KEY` is not set, the static analyzer detects common beginner bugs (type mismatches, off-by-one loops, uninitialized variables, `=` vs `==` in conditions, string `==` in Java, and division by zero). Configuring `GEMINI_API_KEY` unlocks full LLM reasoning for arbitrary programs.
