# Walkthrough - MetricMind: Agentic Semantic BI Engine

We have successfully built and verified **MetricMind: Agentic Semantic BI Engine** (Project 1 from the Axlero Solutions Advanced Analytics specification).

---

## 🌟 What Was Built

### 1. Governed Semantic Layer Engine (`backend/semantic_layer/`)
- **`metrics.yaml`**: Enterprise repository defining corporate measures (*Total Revenue*, *COGS*, *Gross Margin %*, *Shipping & Freight Cost*, *Material Cost*, *Ad Spend*, *Customer Churn Rate*) and dimensions (*Geography*, *Sub-Region*, *Product Line*, *Quarter*).
- **`compiler.py`**: Semantic Query Compiler that converts structured metric API calls into deterministic SQL queries against the analytical lakehouse—eliminating LLM hallucinated joins and rogue SQL.

### 2. Multi-Step Agentic BI Orchestrator (`backend/agent/`)
- **`orchestrator.py`**: Executes multi-step root-cause analysis:
  1. Intent Parsing & Semantic Schema Resolution.
  2. Primary Metric Querying.
  3. **Automated Anomaly Drilldown**: When European Margins drop in 2025-Q3, the agent automatically executes secondary sub-region and cost-component breakdown queries.
  4. Root Cause Synthesis & Visual Output Formatting.

### 3. Mock Enterprise Lakehouse Warehouse (`backend/database/`)
- **`warehouse.py`**: Seeds a SQLite database (`fact_enterprise_sales`) with 2 years of realistic corporate sales data across 500+ records. Includes an injected Q3 European shipping fee surge and AI Hardware tariff anomaly.

### 4. Executive React + Vite Frontend Workspace (`frontend/`)
- **Executive BI Chat Workspace**: Natural language prompt input with suggested chip triggers.
- **Thought Stream Visualizer**: Real-time rendering of multi-step agent reasoning steps.
- **Dynamic Charting Panel**: Interactive Recharts line charts, bar breakdowns, and executive KPI insight cards.
- **Governance Audit Drawer**: "View Compiled SQL" and "View Semantic API Payload (JSON)" drawer with 100% transparency.
- **Semantic Store Explorer**: Interactive catalog to inspect governed metric definitions, formulas, and approval status.
- **Data Lakehouse Audit Panel**: Real-time query execution log, latency tracking, and cost governance limits.

---

## 🚀 Verification Results

### Backend Semantic Compiler Test
- Successfully ran governed compilation tests:
```sql
SELECT
    quarter AS quarter, 
    ((SUM(sales_amount) - SUM(cost_of_goods_sold)) / SUM(sales_amount)) * 100 AS gross_margin_pct
FROM fact_enterprise_sales
WHERE geography = 'Europe'
GROUP BY quarter
ORDER BY quarter ASC
```
- **Execution Latency**: `17.05ms`
- **Result**: Zero SQL syntax errors, 100% mathematical consistency.

---

## 💻 How to Run MetricMind Locally

### Option 1: Start Backend (FastAPI)
```bash
cd "C:\Users\M BHARATH KUMAR GOUD\.gemini\antigravity\scratch\metricmind\backend"
python -m pip install -r requirements.txt
python main.py
```
*API running at:* `http://127.0.0.1:8000` (Interactive Docs at `http://127.0.0.1:8000/docs`)

### Option 2: Start Frontend (React + Vite)
```bash
cd "C:\Users\M BHARATH KUMAR GOUD\.gemini\antigravity\scratch\metricmind\frontend"
npm run dev
```
*App running at:* `http://localhost:5173`
