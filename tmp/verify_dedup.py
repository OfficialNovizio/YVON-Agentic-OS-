import sqlite3, os
con = sqlite3.connect("store/rag.db"); cur = con.cursor()
t = cur.execute("select count(*) from chunks").fetchone()[0]
d = cur.execute("select count(distinct chunk_text) from chunks").fetchone()[0]
bs = cur.execute("select count(*) from chunks where instr(source_file, char(92)) > 0").fetchone()[0]
print("  rows                :", t)
print("  distinct chunk_text :", d)
print("  redundancy factor   :", round(t/max(d,1), 3))
print("  backslash paths     :", bs)
print("  db size MB          :", round(os.path.getsize("store/rag.db")/1048576, 1))
print("  integrity           :", cur.execute("PRAGMA integrity_check").fetchone()[0])
