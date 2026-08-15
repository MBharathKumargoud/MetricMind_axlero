"""
MetricMind Data Warehouse Module.
Creates, seeds, and queries the SQLite warehouse with deterministic enterprise sales data.
"""

import os
import sqlite3
import random

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'metricmind.db')

# --- Data Dimensions ---
REGIONS = {
    "North America": ["US-East", "US-West"],
    "Europe": ["EU-West", "EU-East", "EU-North"],
    "Asia-Pacific": ["APAC-South", "APAC-East"],
    "Latin America": ["LATAM-Central"],
}

PRODUCT_CATEGORIES = [
    "Enterprise Software",
    "Cloud Infrastructure",
    "AI Hardware",
    "IoT Sensors",
    "Data Analytics",
]

SALES_CHANNELS = ["Direct Sales", "Partner Channel", "Online Self-Serve", "Reseller"]
CUSTOMER_SEGMENTS = ["Enterprise", "Mid-Market", "SMB", "Startup"]
QUARTERS = ["2024-Q1", "2024-Q2", "2024-Q3", "2024-Q4", "2025-Q1", "2025-Q2", "2025-Q3", "2025-Q4"]

QUARTER_MONTHS = {
    "2024-Q1": ["Jan", "Feb", "Mar"],
    "2024-Q2": ["Apr", "May", "Jun"],
    "2024-Q3": ["Jul", "Aug", "Sep"],
    "2024-Q4": ["Oct", "Nov", "Dec"],
    "2025-Q1": ["Jan", "Feb", "Mar"],
    "2025-Q2": ["Apr", "May", "Jun"],
    "2025-Q3": ["Jul", "Aug", "Sep"],
    "2025-Q4": ["Oct", "Nov", "Dec"],
}

# --- Revenue base multipliers ---
REGION_REVENUE_MULT = {
    "North America": 1.4,
    "Europe": 1.1,
    "Asia-Pacific": 0.9,
    "Latin America": 0.6,
}

PRODUCT_MARGIN_PROFILE = {
    "Enterprise Software": {"revenue_mult": 1.3, "cogs_pct": 0.25, "shipping_pct": 0.02, "material_pct": 0.05},
    "Cloud Infrastructure": {"revenue_mult": 1.2, "cogs_pct": 0.30, "shipping_pct": 0.03, "material_pct": 0.08},
    "AI Hardware": {"revenue_mult": 1.0, "cogs_pct": 0.45, "shipping_pct": 0.08, "material_pct": 0.15},
    "IoT Sensors": {"revenue_mult": 0.7, "cogs_pct": 0.40, "shipping_pct": 0.10, "material_pct": 0.12},
    "Data Analytics": {"revenue_mult": 1.1, "cogs_pct": 0.28, "shipping_pct": 0.02, "material_pct": 0.04},
}

CHANNEL_MULT = {
    "Direct Sales": 1.2,
    "Partner Channel": 1.0,
    "Online Self-Serve": 0.8,
    "Reseller": 0.7,
}

SEGMENT_MULT = {
    "Enterprise": 1.5,
    "Mid-Market": 1.0,
    "SMB": 0.6,
    "Startup": 0.4,
}

SEASONAL_MULT = {
    "Jan": 0.85, "Feb": 0.88, "Mar": 0.95,
    "Apr": 0.92, "May": 0.96, "Jun": 1.05,
    "Jul": 0.90, "Aug": 0.88, "Sep": 1.02,
    "Oct": 1.05, "Nov": 1.12, "Dec": 1.20,
}


def get_connection():
    """Get a connection to the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create the fact_sales table and seed it with deterministic data."""
    random.seed(42)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Drop and recreate
    cursor.execute("DROP TABLE IF EXISTS fact_sales")
    cursor.execute("""
        CREATE TABLE fact_sales (
            order_id TEXT PRIMARY KEY,
            quarter TEXT NOT NULL,
            month TEXT NOT NULL,
            region TEXT NOT NULL,
            sub_region TEXT NOT NULL,
            product_category TEXT NOT NULL,
            sales_channel TEXT NOT NULL,
            customer_segment TEXT NOT NULL,
            revenue REAL NOT NULL,
            cogs REAL NOT NULL,
            shipping_cost REAL NOT NULL,
            material_cost REAL NOT NULL,
            ad_spend REAL NOT NULL,
            churned_customers INTEGER NOT NULL,
            total_customers INTEGER NOT NULL
        )
    """)

    order_id_counter = 10000
    rows = []

    for quarter in QUARTERS:
        months = QUARTER_MONTHS[quarter]
        for month in months:
            for region, sub_regions in REGIONS.items():
                for sub_region in sub_regions:
                    for product in PRODUCT_CATEGORIES:
                        for channel in SALES_CHANNELS:
                            for segment in CUSTOMER_SEGMENTS:
                                order_id_counter += 1
                                order_id = f"ORD-{order_id_counter}"

                                profile = PRODUCT_MARGIN_PROFILE[product]
                                base_revenue = 50000

                                # Apply multipliers
                                revenue = base_revenue
                                revenue *= REGION_REVENUE_MULT[region]
                                revenue *= profile["revenue_mult"]
                                revenue *= CHANNEL_MULT[channel]
                                revenue *= SEGMENT_MULT[segment]
                                revenue *= SEASONAL_MULT[month]

                                # Add controlled randomness
                                revenue *= random.uniform(0.85, 1.15)
                                revenue = round(revenue, 2)

                                # Costs
                                cogs = round(revenue * profile["cogs_pct"] * random.uniform(0.90, 1.10), 2)
                                shipping = round(revenue * profile["shipping_pct"] * random.uniform(0.85, 1.15), 2)
                                material = round(revenue * profile["material_pct"] * random.uniform(0.88, 1.12), 2)
                                ad_spend = round(revenue * random.uniform(0.03, 0.08), 2)

                                # === CRITICAL ANOMALY: 2025-Q3 European shipping spike ===
                                if quarter == "2025-Q3" and region == "Europe":
                                    # Dramatic shipping cost spike for all of Europe
                                    shipping_spike = random.uniform(2.5, 3.5)  # +200-300%
                                    shipping = round(shipping * shipping_spike, 2)

                                    # Extra spike for AI Hardware in EU-West and EU-North
                                    if product == "AI Hardware" and sub_region in ("EU-West", "EU-North"):
                                        shipping = round(shipping * random.uniform(1.3, 1.6), 2)

                                    # Moderate material cost increase in Europe during anomaly
                                    material = round(material * random.uniform(1.15, 1.35), 2)

                                # Churn data
                                total_customers = random.randint(80, 200)
                                base_churn_pct = 0.05
                                if segment == "Startup":
                                    base_churn_pct = 0.12
                                elif segment == "SMB":
                                    base_churn_pct = 0.08
                                elif segment == "Enterprise":
                                    base_churn_pct = 0.03

                                churned = round(total_customers * base_churn_pct * random.uniform(0.6, 1.5))
                                churned = max(0, min(churned, total_customers))

                                rows.append((
                                    order_id, quarter, month, region, sub_region,
                                    product, channel, segment,
                                    revenue, cogs, shipping, material, ad_spend,
                                    churned, total_customers
                                ))

    # Insert all rows
    cursor.executemany("""
        INSERT INTO fact_sales (
            order_id, quarter, month, region, sub_region,
            product_category, sales_channel, customer_segment,
            revenue, cogs, shipping_cost, material_cost, ad_spend,
            churned_customers, total_customers
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, rows)

    conn.commit()
    conn.close()

    print(f"[MetricMind Warehouse] Initialized with {len(rows)} rows in {DB_PATH}")
    return len(rows)


def ensure_db():
    """Initialize the database if it does not exist."""
    if not os.path.exists(DB_PATH):
        init_db()
    else:
        # Verify table exists
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='fact_sales'")
        if cursor.fetchone() is None:
            conn.close()
            init_db()
        else:
            conn.close()


if __name__ == "__main__":
    init_db()
