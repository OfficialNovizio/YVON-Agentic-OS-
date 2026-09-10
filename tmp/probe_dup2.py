import sqlite3
con = sqlite3.connect("/root/YVON-Agentic-OS-/store/rag.db"); cur = con.cursor()
q = "select count(*) from chunks where instr(source_file, char(92)) > 0"
bs = cur.execute(q).fetchone()[0]
fs = cur.execute("select count(*) from chunks where instr(source_file, char(92)) = 0").fetchone()[0]
print("rows WITH backslash   :", bs)
print("rows WITHOUT backslash:", fs)
print()
print("--- created_at by separator kind ---")
rows = cur.execute("""
  select case when instr(source_file, char(92)) > 0 then 'backslash' else 'forward' end as k,
         min(created_at), max(created_at), count(*)
  from chunks group by k
""").fetchall()
for k, lo, hi, n in rows:
    print(f"  {k:10s} n={n:<6} created_at {lo}  ..  {hi}")
print()
print("--- same file under both, showing timestamps ---")
rows = cur.execute("""
  select source_file, created_at from chunks
  where replace(source_file, char(92), '/') = 'Engineering/dev/operational/commands/dev-commands.md'
  order by created_at limit 4
""").fetchall()
for sf, ca in rows:
    print(f"  {ca}  {repr(sf)[:72]}")
