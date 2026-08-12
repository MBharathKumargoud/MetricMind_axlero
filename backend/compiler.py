"""
MetricMind Semantic Query Compiler.
Translates governed metric requests into SQL, validates against the semantic layer,
and executes against the SQLite warehouse.
"""

import os
import time
import yaml
import warehouse


class SemanticCompiler:
    """Compiles semantic metric requests into governed SQL queries."""

    def __init__(self):
        yaml_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'metrics.yaml')
        with open(yaml_path, 'r') as f:
            self._config = yaml.safe_load(f)
        self._metrics = self._config.get('metrics', {})
        self._dimensions = self._config.get('dimensions', {})
        self._table = self._config.get('table', 'fact_sales')

    def get_metrics(self) -> dict:
        """Return the metrics dictionary from the semantic layer."""
        return self._metrics

    def get_dimensions(self) -> dict:
        """Return the dimensions dictionary from the semantic layer."""
        return self._dimensions

    def compile_and_execute(
        self,
        measures: list,
        dimensions: list = None,
        filters: dict = None,
        order_by: str = None,
        limit: int = 200,
    ) -> dict:
        """
        Compile a semantic query and execute it against the warehouse.

        Args:
            measures: List of metric keys (e.g., ['revenue', 'gross_margin_pct'])
            dimensions: List of dimension keys (e.g., ['quarter', 'region'])
            filters: Dict of dimension_key -> value or list of values
            order_by: Column to order by (default: first dimension ASC)
            limit: Max rows to return (capped at 500)

        Returns:
            Dict with status, sql_query, params, row_count, execution_time_ms, data, semantic_request
        """
        dimensions = dimensions or []
        filters = filters or {}
        limit = min(limit, 500)
        sql_query = ""
        params = []

        try:
            # --- Validate measures ---
            for m in measures:
                if m not in self._metrics:
                    return {
                        "status": "error",
                        "error": f"Unknown metric: '{m}'. Available: {list(self._metrics.keys())}",
                        "sql_query": None,
                    }

            # --- Validate dimensions ---
            for d in dimensions:
                if d not in self._dimensions:
                    return {
                        "status": "error",
                        "error": f"Unknown dimension: '{d}'. Available: {list(self._dimensions.keys())}",
                        "sql_query": None,
                    }

            # --- Validate filter keys ---
            for fk in filters:
                if fk not in self._dimensions:
                    return {
                        "status": "error",
                        "error": f"Invalid filter dimension: '{fk}'. Available: {list(self._dimensions.keys())}",
                        "sql_query": None,
                    }

            # --- Validate filter values ---
            for fk, fv in filters.items():
                dim_def = self._dimensions[fk]
                allowed = dim_def.get('values')
                if allowed:
                    vals = fv if isinstance(fv, list) else [fv]
                    for v in vals:
                        if v not in allowed:
                            return {
                                "status": "error",
                                "error": f"Invalid filter value '{v}' for dimension '{fk}'. Allowed: {allowed}",
                                "sql_query": None,
                            }

            # --- Build SELECT clause ---
            select_parts = []

            # Dimension columns
            for d in dimensions:
                col = self._dimensions[d]['column']
                select_parts.append(col)

            # Measure expressions
            measure_aliases = []
            for m in measures:
                sql_expr = self._metrics[m]['sql_expression']
                alias = m
                select_parts.append(f"{sql_expr} AS {alias}")
                measure_aliases.append(alias)

            select_clause = ", ".join(select_parts)

            # --- Build WHERE clause ---
            where_parts = []
            for fk, fv in filters.items():
                col = self._dimensions[fk]['column']
                if isinstance(fv, list):
                    placeholders = ", ".join(["?"] * len(fv))
                    where_parts.append(f"{col} IN ({placeholders})")
                    params.extend(fv)
                else:
                    where_parts.append(f"{col} = ?")
                    params.append(fv)

            where_clause = ""
            if where_parts:
                where_clause = " WHERE " + " AND ".join(where_parts)

            # --- Build GROUP BY clause ---
            group_clause = ""
            if dimensions:
                group_cols = [self._dimensions[d]['column'] for d in dimensions]
                group_clause = " GROUP BY " + ", ".join(group_cols)

            # --- Build ORDER BY clause ---
            if order_by:
                order_clause = f" ORDER BY {order_by}"
            elif dimensions:
                first_col = self._dimensions[dimensions[0]]['column']
                order_clause = f" ORDER BY {first_col} ASC"
            else:
                order_clause = ""

            # --- Build full query ---
            sql_query = f"SELECT {select_clause} FROM {self._table}{where_clause}{group_clause}{order_clause} LIMIT {limit}"

            # --- Execute ---
            start = time.time()
            conn = warehouse.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql_query, params)
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            conn.close()
            elapsed = round((time.time() - start) * 1000, 2)

            data = [dict(zip(columns, row)) for row in rows]

            return {
                "status": "success",
                "sql_query": sql_query,
                "params": params,
                "row_count": len(data),
                "execution_time_ms": elapsed,
                "data": data,
                "semantic_request": {
                    "measures": measures,
                    "dimensions": dimensions,
                    "filters": filters,
                },
            }

        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "sql_query": sql_query,
            }


# Module-level instance
compiler = SemanticCompiler()
