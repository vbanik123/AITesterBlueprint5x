# AI Test Planning Agent — Jira to RICE-POT Test Plan

A lightweight, zero-dependency full-stack application that accepts a Jira issue key, retrieves its requirements and metadata from Jira, and synthesizes a structured, audit-ready QA Test Plan strictly following the approved **RICE-POT Test Plan Template**.

---

## 1. Architecture & Design

The application directly replicates the wireframe layout supplied in `00_Design/image.png`:
- **Main page**:
  - **Reply with Test Plan**: Primary display for formatted test plans with markdown preview, raw toggle, copy-to-clipboard, and `.md` file download.
  - **Prompt (JIRA Ticket)**: Input bar accepting ticket keys (e.g., `QA-123`, `PROJ-1`, or `DEMO-101`) with quick-action demo chips.
- **Settings**:
  - **JIRA Connection**: Manage Jira Base URL, Email, and API Token with instant "Test Connection" validation.
  - **LLM Configuration**: Supports both **Groq Cloud LLM** (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) and local **Ollama** (`http://localhost:11434`), plus a deterministic RICE-POT fallback engine.

```
02_Implementation/
├── src/
│   ├── backend/
│   │   ├── server.js           # HTTP server, routing, static serving, .env loader
│   │   ├── jiraService.js      # Jira Cloud REST API v3/v2 integration & ADF parser
│   │   ├── llmService.js       # Groq & Ollama LLM orchestration & fallback
│   │   └── templateService.js  # RICE-POT prompt builder & exact template specification
│   └── frontend/
│       ├── index.html          # HTML shell with React 18 & Marked.js
│       ├── App.js              # Full React single-page application
│       └── styles.css          # Modern clean CSS matching wireframe design
├── package.json                # Project manifest & npm start script
├── .gitignore                  # Git ignore rules
└── README.md                   # Setup and usage guide
```

---

## 2. Prerequisites & Configuration

- **Node.js**: v18+ (tested on Node.js v24.20.0). No external npm packages required; built using standard Node.js built-ins (`node:http`, `node:fs`, `node:path`, native `fetch`).
- **Environment Variables**:
  The backend automatically searches parent directory trees for the project root `.env` file containing:
  ```env
  JIRA_URL=https://your-domain.atlassian.net
  JIRA_EMAIL=your-email@example.com
  JIRA_API_TOKEN=your_jira_api_token
  GROQ_API_KEY=your_groq_api_key
  ```

---

## 3. How to Run

### Step 1: Start the Server
Navigate to the implementation folder and start the server:

```powershell
cd "Chapter_04_AI_Agents_Basics\VIBE_CODING\01_Intelligent_Test_Planning_AIAgent\02_Implementation"
node src/backend/server.js
```
*(Or run `npm start`)*

### Step 2: Open in Browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 4. How to Use

1. **Generate a Test Plan**:
   - Enter your Jira issue key (e.g. `QA-123` or `PROJ-1`) into the **Prompt (JIRA Ticket)** field.
   - Click **Generate Test Plan**.
   - If you want an immediate test without querying live Jira, click the **DEMO-101** quick chip.
2. **Review & Export**:
   - View the rendered markdown test plan formatted with sections, tables, and the Human Review Gate.
   - Use the **📋 Copy** or **💾 Download .md** buttons to export the plan.
3. **Configure Settings**:
   - Click **Settings** in the top navigation bar.
   - Test your Jira connection by clicking **Test Connection**.
   - Test your Groq or Ollama connection by clicking **Test Groq.com** or **Test Local LLM**.
   - Click **Save Settings** to persist in-memory adjustments.

---

## 5. RICE-POT Rules & Quality Constraints

The generated test plan strictly follows the RICE-POT framework:
- **Traceability**: Every assertion maps to documented Jira requirements or acceptance criteria.
- **No Hallucinations**: Any missing detail (environments, browser matrix, exact error copy, timelines) is explicitly marked:
  > **“Insufficient information to determine.”**
- **Inference Tagging**: Any inferred assumption is labeled:
  > **“Inference (low confidence)”**
- **Human Review Gate**: Requires explicit QA lead sign-off before automation or test execution commences.

---

## 6. Verification Performed

- Verified `.env` auto-discovery and secure credential loading.
- Verified mock and live Jira issue retrieval parsing ADF format.
- Verified Groq cloud completions and deterministic fallback template engine.
- Verified frontend React components, loading states, error boundaries, and copy/download features.
