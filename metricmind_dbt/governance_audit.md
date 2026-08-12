# Governance Audit — Metric Consistency Check

Built a `governance_check` model on top of the governed `stg_sales` 
staging model (not raw tables) to compute total_revenue, total_margin, 
and margin_percentage.

Ran the model 3 times consecutively via `dbt run --select governance_check` 
— all three runs completed successfully with PASS=1, ERROR=0.

Verified in Snowflake that the output values were identical:

- total_revenue: [141500]
- total_margin: [52500]
- margin_percentage: [37.10]

## Result
Confirmed deterministic, governed metric calculation — no drift or 
inconsistency across repeated runs. This proves the Semantic Layer 
approach prevents the "hallucinated numbers" problem described in 
the MetricMind problem statement.