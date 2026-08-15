# Implementation Plan - MetricMind: Agentic Semantic BI Engine

**MetricMind** is an enterprise-grade Agentic BI Engine designed to solve the critical "Text-to-SQL Hallucination" problem. Instead of allowing an LLM to generate raw, ungoverned SQL directly against raw tables (which often leads to incorrect joins, ignored business rules, and conflicting financial metrics), **MetricMind** forces the AI to interface strictly with a **Governed Semantic Layer**. 

The LLM acts as an **Agentic Orchestrator**, translating natural language into governed Metric API requests, performing multi-step root-cause reasoning (e.g. auto-drilling into shipping vs material costs when margins drop), and rendering dynamic charts alongside fully transparent SQL audit logs.

---

## User Review Required

> [!IMPORTANT]
> **Workspace Recommendation**: We will create this project in `C:\Users\M BHARATH KUMAR GOUD\.gemini\antigravity\scratch\metricmind`. Once created, we recommend setting this directory as your active workspace in your IDE.

> [!NOTE]
> **Architecture Overview**: The project consists of two seamlessly integrated tiers:
> 1. **Python FastAPI Backend** (`backend/`): YAML-based governed Semantic Layer Engine, Data Lakehouse with mock corporate data (SQLite/Pandas), and an Agentic Orchestrator (using Gemini API / structured tool calls).
> 2. **React + Vite Frontend** (`frontend/`): Modern Executive BI interface with dark glassmorphism styling, step-by-step AI reasoning visualizer, dynamic Recharts visualizations, Metric Registry explorer, and "View SQL / View Semantic API" transparency drawer.

---

## Open Questions

> [!TIP]
> Do you have a preferred local port for running the FastAPI backend (e.g., `8000`) and React frontend (e.g., `5173`)? We will default to standard ports `8000` and `5173`.

---

## Proposed Changes

### Project Root (`scratch/metricmind`)

We will create a clean modular full-stack repository structure:
- `scratch/metricmind/backend/`
- `scratch/metricmind/frontend/`

---

### Backend Components (`scratch/metricmind/backend`)

#### [NEW] `backend/semantic_layer/metrics.yaml`
- Defines standardized enterprise business metrics in YAML code (Measures: Revenue, COGS, Gross Margin, Gross Margin %, Shipping Cost, Material Cost, Ad Spend, Churn Rate; Dimensions: Region, Sub-Region, Product Line, Quarter, Sales Channel).
- Decouples mathematical definitions from SQL logic.

#### [NEW] `backend/semantic_layer/compiler.py`
- Converts Semantic API requests (`measures`, `dimensions`, `filters`, `time_grain`) into deterministic, non-hallucinatory SQL / Pandas operations.
- Enforces cost governance (maximum row limits, timeout safeguards).

#### [NEW] `backend/database/warehouse.py`
- Seeds SQLite / DuckDB analytical database with 2 years of realistic corporate financial data.
- Includes injected data anomalies (e.g., Q3 European shipping surcharge spike causing 8.4% margin compression) for realistic multi-step root-cause testing.

#### [NEW] `backend/agent/orchestrator.py`
- Multi-step Agentic BI Orchestrator:
  1. Intent Parsing & Semantic Schema Mapping.
  2. Executing primary metric queries.
  3. Multi-step reasoning: Automatically triggers sub-breakdown queries if metric anomalies or drops are detected.
  4. Synthesizes executive narrative and output formatting for UI charts.

#### [NEW] `backend/main.py`
- FastAPI REST server with endpoints:
  - `POST /api/chat`: Process natural language BI queries with full agentic stream.
  - `GET /api/metrics`: Retrieve registered metric definitions.
  - `POST /api/semantic/query`: Directly execute governed semantic queries.
  - `GET /api/warehouse/audit`: Fetch SQL query audit logs and performance statistics.

#### [NEW] `backend/requirements.txt` & `backend/run.py`
- Dependencies: `fastapi`, `uvicorn`, `pandas`, `pyyaml`, `google-genai`, `pydantic`.

---

### Frontend Components (`scratch/metricmind/frontend`)

#### [NEW] `frontend/package.json` & Vite Setup
- React 18, Vite, Tailwind CSS, Lucide React icons, Recharts visualization library.

#### [NEW] `frontend/src/index.css` & Design System
- Modern Executive Dark Mode palette (`#0F172A`, `#1E293B`, `#3B82F6`, `#10B981`, `#8B5CF6`).
- Custom glassmorphism, dynamic gradients, smooth micro-animations, tailored UI scrollbars.

#### [NEW] `frontend/src/components/Header.jsx`
- Top navigation bar featuring MetricMind branding, live Data Lakehouse status, active semantic metrics count, and backend connectivity status.

#### [NEW] `frontend/src/components/ChatInterface.jsx`
- Conversational Executive BI Chat:
  - Suggested executive prompts ("Why did European margins drop in Q3?", "Break down revenue by product category", "Compare North America vs Europe CAC & Churn").
  - Agentic Reasoning Stream widget (shows real-time steps: Schema Mapping $\rightarrow$ Semantic Query $\rightarrow$ Root Cause Drilldown $\rightarrow$ Visualization).
  - Dynamic Chart Rendering (Line, Bar, Stacked Bar, Metric KPI Cards).
  - Executive Key Findings & Root Cause insight cards.
  - **Transparency Drawer**: "View Semantic API Call" and "View Compiled SQL" buttons.

#### [NEW] `frontend/src/components/MetricStoreExplorer.jsx`
- Governed Semantic Layer browser allowing users to inspect metrics, mathematical formulas, dimensions, governance status, and verification badges.

#### [NEW] `frontend/src/components/WarehouseAudit.jsx`
- Data Lakehouse governance panel detailing executed SQL queries, compilation time, cost controls, and row governance statistics.

---

## Verification Plan

### Automated Tests
1. **Semantic Compiler Validation**: Test that compiling semantic requests produces identical numerical results every single time without SQL syntax errors.
2. **Backend API Health Check**: Verify FastAPI endpoints (`/api/metrics`, `/api/chat`, `/api/warehouse/audit`) return valid JSON schema responses.
3. **Frontend Build Check**: Run `npm run build` or `vite build` to verify zero TypeScript/JSX errors.

### Manual Verification
1. Ask the executive test prompt: *"Why did our European margins drop last quarter?"*
2. Confirm the agent:
   - Does NOT write raw, ungoverned SQL.
   - Queries the Semantic Layer for European Margin in Q3.
   - Automatically executes a secondary breakdown query into shipping vs material costs.
   - Displays interactive breakdown charts.
   - Shows "View SQL" and "View Semantic API Call" drawers with 100% transparency.
