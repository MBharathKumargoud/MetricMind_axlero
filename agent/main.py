import os
from dotenv import load_dotenv
import snowflake.connector
from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent
from langchain_core.tools import tool

load_dotenv()

def run_snowflake_query(sql: str):
    conn = snowflake.connector.connect(
        account=os.getenv("SNOWFLAKE_ACCOUNT"),
        user=os.getenv("SNOWFLAKE_USER"),
        password=os.getenv("SNOWFLAKE_PASSWORD"),
        database=os.getenv("SNOWFLAKE_DATABASE"),
        schema=os.getenv("SNOWFLAKE_SCHEMA"),
        warehouse=os.getenv("SNOWFLAKE_WAREHOUSE"),
    )
    cursor = conn.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    conn.close()
    return result

# --- These are the ONLY approved "actions" the AI is allowed to take ---
# This is the governance rule in action: the AI cannot write its own SQL.

@tool
def get_total_revenue() -> str:
    """Use this to answer questions about total revenue."""
    result = run_snowflake_query("SELECT total_revenue FROM governance_check")
    return f"Total revenue is {result[0][0]}"

@tool
def get_total_margin() -> str:
    """Use this to answer questions about total margin or profit."""
    result = run_snowflake_query("SELECT total_margin FROM governance_check")
    return f"Total margin is {result[0][0]}"

@tool
def get_margin_percentage() -> str:
    """Use this to answer questions about margin percentage."""
    result = run_snowflake_query("SELECT margin_percentage FROM governance_check")
    return f"Margin percentage is {result[0][0]}%"

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)

tools = [get_total_revenue, get_total_margin, get_margin_percentage]

agent = create_react_agent(llm, tools)

if __name__ == "__main__":
    question = input("Ask MetricMind a question: ")
    result = agent.invoke({"messages": [{"role": "user", "content": question}]})
    final_answer = result["messages"][-1].content
    print("\nAnswer:", final_answer)