{{
    config(
        materialized = 'table'
    )
}}

with days as (
    select
        dateadd(day, seq4(), '2020-01-01'::date) as date_day
    from table(generator(rowcount => 3653))
)

select date_day
from days