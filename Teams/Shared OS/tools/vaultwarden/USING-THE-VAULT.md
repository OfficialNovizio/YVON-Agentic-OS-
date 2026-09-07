# Using the Vault (vault.yvon.in) — plain-English guide

The vault is a **password manager**, not a stats dashboard. Its one job: keep
credentials (admin tokens, API keys, GitHub PATs, DB passwords) encrypted so
they stop living in plain `.env` files and chat logs. It runs Vaultwarden —
an open-source, Bitwarden-compatible server — on the VPS, with TLS, and a
weekly backup every Monday 05:00 (plus on-demand backups from the dashboard's
VPS Server tab).

---

## The mental model (this is the part that's confusing)

Everything in the vault lives in one of three places:

| Place | What it is | Example |
|---|---|---|
| **Login** | one credential (username + password + optional TOTP/URL/notes) | the VPS `HERMES_TOKEN` |
| **Folder** | a grouping of logins, inside your personal vault | "VPS", "Sub-brands", "API keys" |
| **Organization** | a SHARED vault that multiple people/collections can access | "YVON Ops" with a "Shared credentials" collection |

When you log in you land on **"All vaults"** — that's just the merged view of
your personal vault + every organization you belong to. It is NOT a list of
machines or accounts. Nothing is wrong if it looks mostly empty: empty vault =
no credentials saved yet.

## First 3 steps (5 minutes)

1. **Open** https://vault.yvon.in → log in with the account you created.
2. **New → Login** (top-right). Give it a name (e.g. "VPS — hermes.yvon.in"),
   paste the username/password, save. Repeat for each secret you want out of
   plain `.env` files. Use **folders** (left sidebar → New folder) to group.
3. **Install the browser extension** (Bitwarden, official store):
   - Click the extension's gear/⚙ → **Server URL** → self-hosted →
     `https://vault.yvon.in` → save, then log in with the SAME account.
   - If the extension shows "install extension" / onboarding screens even
     after installing: that's the extension's own welcome tour, not an error —
     complete the server-URL step above and it will connect.

## What NOT to put in it

- **The master password itself.** If you lose it, the data is unrecoverable
  (zero-knowledge encryption) — there is no admin reset.
- Secrets that another system already manages better (e.g. Supabase's own
  service keys live in Supabase's dashboard + this repo's `.env.local`).

## Where backups live

- Automatic: `/root/vault-backups/` on the VPS, Mondays 05:00 (root cron).
- On demand: **Dashboard → VPS Server tab → "Backup now"** — creates a
  timestamped `vault-<date>T<time>.tgz` in the same folder without touching
  the cron's weekly file.

## Why it isn't part of the dashboard UI

The dashboard's VPS Server tab *shows* vault status and triggers backups, but
the secrets themselves stay at vault.yvon.in behind zero-knowledge encryption:
a stats admin panel must never be able to display raw credentials.
