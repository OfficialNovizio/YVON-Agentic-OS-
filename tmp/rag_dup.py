import sqlite3, os
con = sqlite3.connect("/root/YVON-Agentic-OS-/store/rag.db"); cur = con.cursor()
total = cur.execute("select count(*) from chunks").fetchone()[0]
distinct_raw = cur.execute("select count(distinct source_file) from chunks").fetchone()[0]
distinct_norm = cur.execute("select count(distinct replace(source_file, char(92), '/')) from chunks").fetchone()[0]
print("  total rows                    :", total)
print("  distinct source_file (raw)    :", distinct_raw)
print("  distinct source_file (norm /) :", distinct_norm)
print("  => redundancy factor          :", round(total / max(distinct_norm,1), 2))
print()
print("  --- files stored under BOTH separators ---")
rows = cur.execute("""
  select replace(source_file, char(92), '/') as norm, count(distinct source_file) as variants, count(*) as rows
  from chunks group by norm having variants > 1 order by rows desc limit 8
""").fetchall()
for norm, variants, n in rows:
    print(f"    {variants} variants / {n:>3} rows  {norm[:62]}")
print()
print("  --- chunk_id uniqueness (is the dup in the id too?) ---")
print("    distinct chunk_id:", cur.execute("select count(distinct chunk_id) from chunks").fetchone()[0])
print("    distinct chunk_text:", cur.execute("select count(distinct chunk_text) from chunks").fetchone()[0])
