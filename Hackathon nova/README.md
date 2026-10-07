# NovaWorks AI Project Manager: Meeting to Execution
### The Infinity Hack ’26 — Simplified Student Challenge Project

A Project Management CRM for **NovaWorks Technologies, Lahore, Pakistan**. Automatically parses meeting transcripts into structured client projects and developer tasks, validates all business rules and deadlines in a Domain Layer, atomically persists them to disk, and enforces strict Role-Based Access Control (RBAC).

---

## 1. Project Overview

NovaWorks Technologies manages client deliverables for websites, mobile applications, and AI assistants. Instead of manual data entry, the Administrator pastes the meeting transcript directly into the CRM.

The system executes the workflow:
**Meeting Transcript → AI Extraction → Domain Validation → Entity Creation → Atomic DB Persistence → Role-Based Access**

---

## 2. Architecture & Clean Separation

The architecture strictly adheres to the hackathon's architectural principles:
* The **Frontend** NEVER talks directly to the AI or Database.
* The **AI Parser** only extracts drafts; it has no database access and creates no IDs.
* The **Domain Layer** is the central orchestrator and business owner.
* The **Persistence Layer** is isolated behind repository abstractions.

```text
                           FRONTEND (React + Tailwind CSS)
                                       |
                                       | HTTP /api/* (DTOs)
                                       v
                              EXPRESS CONTROLLERS & AUTH
                                       |
                                       v
                             DOMAIN SERVICE (Orchestrator)
                             /                           \
                            /                             \
                           v                               v
                     AI PARSER INTERFACE          REPOSITORY INTERFACES
                     (IAIParser)                  (IUser, IProject, ITask)
                           |                               |
                           v                               v
                   AI INFRASTRUCTURE             PERSISTENCE / DATABASE
              (OpenRouter / Gemini API)        (data/novaworks_db.json)
```

---

## 3. Technology Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React
* **Backend**: Node.js, Express 4, TypeScript (`tsx`)
* **AI Engine**: OpenRouter API (`OPENROUTER_API_KEY`) with fallback to Gemini 3.8 Flash (`@google/genai`) and deterministic testing analyzer
* **Database**: Persistent file-backed JSON document engine with ACID snapshot isolation & atomic write-and-rename
* **Build / Dev**: Vite dev server mounted in Express middleware mode (`server.ts` on Port 3000)

---

## 4. Key Features

1. **AI Transcript Extraction**:
   * Accepts raw meeting transcripts.
   * Extracts project names, client names, descriptions, project managers, and project delivery dates.
   * Extracts task deliverables, scope descriptions, assigned developers, effort hours, and deadlines.
2. **Domain Validation Engine (Section 9)**:
   * Rejects empty or invalid transcripts.
   * Enforces that assigned managers have the `MANAGER` role.
   * Enforces that assigned developers have the `AGENT` role.
   * Validates date formats (`YYYY-MM-DD`).
   * **Deadline Rule**: Enforces that every `task.deadline <= project.deadline`.
   * Requires positive estimated hours.
   * Rejects external people (e.g. Kamran).
   * Rejects out-of-scope/demo items (payment gateways, real inventory sync, driver tracking).
3. **Atomic All-or-Nothing Transactions (Section 10)**:
   * If any task or project validation fails, nothing is saved to disk.
4. **Duplicate Submission Protection (Section 11)**:
   * In-memory request locking and double-click prevention.
5. **Strict Role-Based Access Control (RBAC)**:
   * **ADMIN**: Full access to all projects, tasks, team directory, and transcript generation.
   * **MANAGER**: Can only view projects where `project.managerId == currentUser.id` and tasks within those projects.
   * **AGENT**: Can only view tasks where `task.assigneeId == currentUser.id` across projects. Cannot view other developers' tasks.
6. **1-Click Judge Demo Switcher**:
   * Switch between any of the 10 demo accounts with one tap from the navbar or login screen without manual typing.

---

## 5. Folder Structure

```text
/
├── data/
│   └── novaworks_db.json              # Persistent database storage
├── server/
│   ├── api/
│   │   ├── controllers/               # Thin HTTP controllers
│   │   │   ├── AuthController.ts
│   │   │   ├── ProjectController.ts
│   │   │   ├── TaskController.ts
│   │   │   ├── TeamController.ts
│   │   │   └── TranscriptController.ts
│   │   ├── middleware/
│   │   │   └── auth.ts                # Session token & role authorization
│   │   └── routes.ts                  # Dependency injection & router
│   ├── domain/
│   │   ├── errors/                    # Domain-specific errors
│   │   ├── interfaces/                # Repositories & AI Parser abstractions
│   │   ├── models/                    # User, Project, Task, AITypes
│   │   ├── rules/                     # Section 9 validation rules engine
│   │   └── services/                  # TranscriptProcessingService (Orchestrator)
│   └── infrastructure/
│       ├── ai/                        # OpenRouterAIParser & GeminiAIParser
│       ├── database/                  # DatabaseClient & DatabaseSeeder
│       └── repositories/              # Concrete implementations of IUserRepository, etc.
├── src/
│   ├── components/
│   │   └── Navbar.tsx                 # Role-aware navigation & demo switcher
│   ├── context/
│   │   └── AuthContext.tsx            # Global session state
│   ├── pages/
│   │   ├── Login.tsx                  # Login card + 1-click presets
│   │   ├── AdminDashboard.tsx         # Overview, metrics & project cards
│   │   ├── CreateTranscript.tsx       # Transcript workbench & pipeline progress
│   │   ├── ProjectDetail.tsx          # Project scope & task breakdown table
│   │   ├── ManagerView.tsx            # Filtered view for managers
│   │   ├── AgentTasks.tsx             # "My Tasks" view for developer agents
│   │   └── TeamDirectory.tsx          # Staff roster & skills directory
│   ├── services/
│   │   └── api.ts                     # HTTP client calling backend /api
│   └── App.tsx                        # Root app coordination
├── shared/
│   └── api-contracts.ts               # Shared DTOs between frontend & backend
├── server.ts                          # Express server entry point (Port 3000)
├── .env.example
└── README.md
```

---

## 6. Demo Accounts (All Passwords: `Demo123!`)

| ID | Name | Role | Email | Specialization |
| :--- | :--- | :--- | :--- | :--- |
| `ADMIN` | Admin | **ADMIN** | `admin@novaworks.example` | Administrator |
| `PM01` | Ayesha Khan | **MANAGER** | `ayesha@novaworks.example` | Manager / Web PM (UrbanCart) |
| `PM02` | Bilal Ahmed | **MANAGER** | `bilal@novaworks.example` | Manager / Mobile PM (QuickServe) |
| `PM03` | Hina Malik | **MANAGER** | `hina@novaworks.example` | Manager / AI PM (HelpDeskPro) |
| `DEV01` | Ali Raza | **AGENT** | `ali@novaworks.example` | Agent / Full-Stack (React) |
| `DEV02` | Hamza Shah | **AGENT** | `hamza@novaworks.example` | Agent / Full-Stack (Node & APIs) |
| `DEV03` | Sara Noor | **AGENT** | `sara@novaworks.example` | Agent / App Developer (Flutter) |
| `DEV04` | Usman Tariq | **AGENT** | `usman@novaworks.example` | Agent / App Developer (Testing) |
| `DEV05` | Zain Abbas | **AGENT** | `zain@novaworks.example` | Agent / AI Developer (LLMs) |
| `DEV06` | Maryam Asif | **AGENT** | `maryam@novaworks.example` | Agent / AI Developer (Retrieval) |

---

## 7. How to Run & Test

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Runs Express and Vite dev server on **`http://localhost:3000`**.

### Environment Variables
Configure `.env` (optional):
```bash
# OpenRouter configuration (optional):
OPENROUTER_API_KEY="sk-or-v1-..."
OPENROUTER_MODEL="google/gemini-2.0-flash-001" # or "openai/gpt-4o-mini"

# Gemini direct configuration:
GEMINI_API_KEY="YOUR_KEY"
```
*Note: If no key is set, the system seamlessly uses the built-in deterministic fallback parser for guaranteed zero-setup judging!*

---

## 8. Judging Verification Walkthrough

1. **Step 1: Log in as Admin**:
   * On the login page, click `Admin` in the **1-Click Judge Demo Accounts** panel.
2. **Step 2: Create from Transcript**:
   * Click **Create from Transcript** in the navigation bar.
   * Click **Load Official Hackathon Transcript**.
   * Click **Process Transcript via AI Domain Pipeline**.
   * Watch the 5-step pipeline indicators:
     `[1. Transcript Sanitized] → [2. Team Directory Bound] → [3. AI Extraction] → [4. Domain Validation] → [5. Atomic DB Commit]`.
   * Result: **3 Projects** and **12 Tasks** created with **124 Hours**.
3. **Step 3: Verify Persistence**:
   * Refresh the browser. All 3 projects and 12 tasks remain saved.
4. **Step 4: Verify Manager Isolation (Ayesha)**:
   * In the top-right navbar, click **Switch Demo Role** and select **Ayesha Khan**.
   * Ayesha sees **only** `UrbanCart Website` (4 tasks, 40 hours). She cannot see QuickServe or HelpDeskPro.
5. **Step 5: Verify Agent Cross-Project View (Hamza)**:
   * Switch Demo Role to **Hamza Shah**.
   * Navigate to **My Assigned Tasks**.
   * Hamza sees his exact two tasks spanning two distinct projects:
     - `Product and cart APIs` (UrbanCart Website - 14h, due 14 Oct)
     - `Booking and account APIs` (QuickServe Mobile App - 16h, due 16 Oct)
   * He cannot access other agents' tasks.
6. **Step 6: Test Dynamic AI Extraction**:
   * Switch back to Admin.
   * Go to Create from Transcript.
   * Click **Load Modified Test Transcript (Proves Dynamic AI)**.
   * This modifies QuickServe Mobile Integration to 12 hours due 23 Oct.
   * Submit to prove the AI genuinely parses the transcript dynamically!
