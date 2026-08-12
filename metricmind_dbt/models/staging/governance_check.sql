select
    sum(revenue) as total_revenue,
    sum(margin) as total_margin,
    round(sum(margin) / sum(revenue) * 100, 2) as margin_percentage
from {{ ref('stg_sales') }}