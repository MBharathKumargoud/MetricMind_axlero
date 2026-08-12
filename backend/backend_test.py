"""Backend verification tests for MetricMind."""
import sys

print("=" * 60)
print("MetricMind Backend Verification")
print("=" * 60)

# Test 1: Warehouse
print("\n[1] Initializing warehouse...")
from warehouse import init_db, get_connection
rows = init_db()
print(f"    OK: {rows} rows seeded")

# Test 2: Verify DB
conn = get_connection()
cursor = conn.cursor()
cursor.execute("SELECT COUNT(*) FROM fact_sales")
count = cursor.fetchone()[0]
conn.close()
print(f"    OK: {count} rows in fact_sales")

# Test 3: Compiler
print("\n[2] Testing SemanticCompiler...")
from compiler import compiler
r = compiler.compile_and_execute(
    measures=["gross_margin_pct"],
    dimensions=["quarter"],
    filters={"region": "Europe"}
)
print(f"    Status: {r['status']}, Rows: {r['row_count']}")
for row in r['data']:
    print(f"    {row['quarter']}: {row['gross_margin_pct']}%")
assert r['status'] == 'success', f"Expected success, got {r['status']}"
print("    OK: Compiler working correctly")

# Test 4: Orchestrator
print("\n[3] Testing AgenticOrchestrator...")
from orchestrator import AgenticOrchestrator
o = AgenticOrchestrator()
result = o.process_query("Why did European margins drop last quarter?")

print(f"    Answer preview: {result['answer'][:120]}...")
print(f"    Reasoning steps: {len(result['reasoning_steps'])}")
print(f"    Charts: {len(result['charts'])}")
print(f"    Root cause title: {result['root_cause']['title']}")
print(f"    Findings: {len(result['findings'])}")
print(f"    SQL queries: {len(result['transparency']['compiled_sql'])}")

assert result['answer'], "Empty answer"
assert len(result['reasoning_steps']) >= 5, "Too few reasoning steps"
assert len(result['charts']) >= 2, "Too few charts"
assert result['root_cause'] is not None, "No root cause"
print("    OK: Orchestrator working correctly")

# Test 5: Metrics
print("\n[4] Testing compiler.get_metrics() / get_dimensions()...")
metrics = compiler.get_metrics()
dimensions = compiler.get_dimensions()
print(f"    Metrics: {list(metrics.keys())}")
print(f"    Dimensions: {list(dimensions.keys())}")
assert len(metrics) >= 8, f"Expected >= 8 metrics, got {len(metrics)}"
assert len(dimensions) >= 5, f"Expected >= 5 dimensions, got {len(dimensions)}"
print("    OK: Semantic layer loaded correctly")

print("\n" + "=" * 60)
print("ALL BACKEND TESTS PASSED")
print("=" * 60)
