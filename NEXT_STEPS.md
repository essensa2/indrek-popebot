# Pope Bot – Next Steps

Pope Bot is deployed to Coolify in **Indrek > production**.

## Live URL

**Via proxy:** http://n400c8ww00g8gosksg444wwc.62.72.33.207.sslip.io  
**Direct port (if proxy 404s):** http://62.72.33.207:30080

**If you get 404:** Add domain in Coolify UI: **Configuration → General → Domains for event-handler** → enter `n400c8ww00g8gosksg444wwc.62.72.33.207.sslip.io` → **Save** → Redeploy. (API domain updates may not reload the proxy.)

---

## 1. Add secrets in Coolify (REQUIRED – app won't start without these)

In Coolify, open **Pope Bot** → **Configuration** → **Environment Variables** and add:

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | **Yes** | Session encryption. Generate: `openssl rand -base64 32` |
| `APP_URL` | **Yes** | Your app URL, e.g. `http://n400c8ww00g8gosksg444wwc.62.72.33.207.sslip.io` |
| `APP_HOSTNAME` | **Yes** | Same hostname, e.g. `n400c8ww00g8gosksg444wwc.62.72.33.207.sslip.io` |
| `GH_TOKEN` | For runner | GitHub PAT (repo + workflow). Runner is disabled by default until you add this. |
| `GH_OWNER` | For runner | Your GitHub username (e.g. `essensa2`) |
| `GH_REPO` | For runner | Repo name (e.g. `indrek-popebot`) |
| `GH_WEBHOOK_SECRET` | For jobs | `openssl rand -hex 32` |
| `ANTHROPIC_API_KEY` | For chat | Anthropic API key for Claude |

**Runner:** The GitHub Actions runner is disabled by default (it was spamming "Invalid token"). Add `GH_TOKEN` in Coolify, then enable it in compose if needed.

---

## 2. Add GitHub workflows (for agent jobs)

The workflows were not pushed because the GitHub token needs the `workflow` scope.

1. In GitHub: **Settings** → **Developer settings** → **Personal access tokens**
2. Edit your token and enable the **workflow** scope
3. Run:

```powershell
cd c:\_AI\popebot\popebot-app
git add .github
git commit -m "Add GitHub Actions workflows"
git push origin master
```

4. In the repo: **Settings** → **Secrets and variables** → **Actions**
5. Add `GH_WEBHOOK_SECRET` (same value as in Coolify)
6. Add `AGENT_ANTHROPIC_API_KEY` (or your agent LLM key)

---

## 3. Run setup wizard (optional)

For full configuration (Telegram, webhooks, etc.):

```powershell
cd c:\_AI\popebot\popebot-app
npm run setup
```

---

## 4. Custom domain (optional)

To use a custom domain instead of sslip.io:

1. In Coolify: Pope Bot → **Domains**
2. Add your domain and point DNS to `62.72.33.207`
3. Update `APP_URL` and `APP_HOSTNAME` in Coolify env vars
