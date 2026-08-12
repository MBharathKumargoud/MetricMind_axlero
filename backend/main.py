"""
MetricMind FastAPI Application.
Provides REST endpoints for the governed semantic analytics engine.
"""

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional

import warehouse
from compiler import compiler
from orchestrator import AgenticOrchestrator

# --- App Setup ---
app = FastAPI(
    title="MetricMind",
    description="Governed Semantic Analytics Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = AgenticOrchestrator()


# --- Request/Response Models ---
class ChatRequest(BaseModel):
    message: str


class SemanticQueryRequest(BaseModel):
    measures: List[str]
    dimensions: List[str] = Field(default_factory=list)
    filters: Dict[str, object] = Field(default_factory=dict)
    limit: Optional[int] = 200


# --- Startup ---
@app.on_event("startup")
async def startup_event():
    """Initialize the database on startup."""
    warehouse.ensure_db()


# --- Endpoints ---

@app.get("/")
async def root():
    """Engine info endpoint."""
    return {"engine": "MetricMind", "version": "1.0.0", "status": "online"}


@app.get("/api/health")
async def health():
    """Health check with actual DB connection test."""
    try:
        conn = warehouse.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM fact_sales")
        count = cursor.fetchone()[0]
        conn.close()
        metrics_count = len(compiler.get_metrics())
        return {
            "status": "healthy",
            "database": "connected",
            "metrics_count": metrics_count,
            "record_count": count,
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail={"status": "unhealthy", "error": str(e)})


@app.get("/api/metrics")
async def get_metrics():
    """Return available metrics and dimensions from the semantic layer."""
    metrics = compiler.get_metrics()
    dimensions = compiler.get_dimensions()
    return {
        "metrics": metrics,
        "dimensions": dimensions,
        "total_metrics": len(metrics),
        "total_dimensions": len(dimensions),
    }


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Process a natural-language business question through the agentic orchestrator."""
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail={"error": "Message cannot be empty"})

        result = orchestrator.process_query(request.message)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"Query processing failed: {str(e)}"})


@app.post("/api/semantic/query")
async def semantic_query(request: SemanticQueryRequest):
    """Execute a governed semantic query directly against the compiler."""
    try:
        result = compiler.compile_and_execute(
            measures=request.measures,
            dimensions=request.dimensions,
            filters=request.filters,
            limit=request.limit,
        )
        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"Semantic query failed: {str(e)}"})


@app.get("/api/warehouse/audit")
async def warehouse_audit():
    """Return warehouse statistics and governance info."""
    try:
        conn = warehouse.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM fact_sales")
        total_records = cursor.fetchone()[0]
        conn.close()
        return {
            "table": "fact_sales",
            "total_records": total_records,
            "governance_mode": "governed_semantic_layer",
            "max_query_limit": 500,
            "metrics_version": "1.0",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"Audit failed: {str(e)}"})


if __name__ == '__main__':
    uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=True)
