# Pope Bot – GitHub Setup Guide

Use this guide to fix GitHub-related issues and complete the bot setup.

## Prerequisites

- **Git** – for pushing code
- **GitHub CLI (gh)** – for auth and repo access

Install if needed:
```powershell
# Git (if missing): https://git-scm.com/download/win
# GitHub CLI
winget install GitHub.cli
```

---

## 1. Authenticate with GitHub CLI

```powershell
gh auth login
```

- Choose **GitHub.com**
- Choose **HTTPS**
- Choose **Login with a web browser**
- Copy the one-time code and press Enter
- Complete the auth in your browser

---

## 2. Verify GitHub Access

```powershell
cd c:\_AI\popebot\popebot-app
gh repo view essensa2/indrek-popebot
```

If this works, your GitHub CLI is authenticated.

---

## 3. Create a new token with `workflow` scope

The bot needs a token that can push workflows and create branches.

1. Go to https://github.com/settings/tokens/new
2. **Note:** `Pope Bot - repo + workflow`
3. **Expiration:** 90 days (or No expiration)
4. **Scopes:** Check:
   - `repo` (full control)
   - `workflow` (Update GitHub Action workflows)
5. Click **Generate token**
6. Copy the token (starts with `ghp_`)

---

## 4. Add token to Coolify

1. In **Coolify** → **Pope Bot** → **Configuration** → **Environment Variables**
2. Add or update:
   - `GH_TOKEN` = your new token

---

## 5. Add token to GitHub Actions secrets

1. Go to https://github.com/essensa2/indrek-popebot/settings/secrets/actions
2. Click **New repository secret**
3. **Name:** `AGENT_GH_TOKEN`
4. **Value:** same token as `GH_TOKEN`

---

## 6. Add GH_WEBHOOK_SECRET (if missing)

Generate a secret:

```powershell
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

Or use: https://generate-secret.vercel.app/32

Add to:
- **Coolify:** `GH_WEBHOOK_SECRET`
- **GitHub Actions:** `GH_WEBHOOK_SECRET` (same value)

---

## 7. Push workflows (requires workflow scope)

```powershell
cd c:\_AI\popebot\popebot-app
git status
git push origin master
```

If you get "refusing to allow a Personal Access Token to create or update workflow", ensure the token has the **workflow** scope (step 3).

---

## 8. Configure GitHub webhook (optional – for Issues)

To have the bot react to new GitHub issues:

1. Go to https://github.com/essensa2/indrek-popebot/settings/hooks
2. Click **Add webhook**
3. **Payload URL:** `http://n400c8ww00g8gosksg444wwc.62.72.33.207.sslip.io/api/github/webhook`  
   (or use your direct port if proxy 404s: `http://62.72.33.207:30080/api/github/webhook`)
4. **Content type:** `application/json`
5. **Secret:** your `GH_WEBHOOK_SECRET` value
6. **Which events:** "Let me select individual events" → check **Issues**
7. Click **Add webhook**

The webhook endpoint supports both:
- **GitHub Actions** (job notifications): `X-GitHub-Webhook-Secret-Token`
- **GitHub native webhooks** (Issues, PRs): `X-Hub-Signature-256` (HMAC)

Use the same `GH_WEBHOOK_SECRET` for both. The `review-github-event` trigger is already enabled in `config/TRIGGERS.json`.

---

## 9. Enable a trigger for GitHub events (optional)

The `review-github-event` trigger is enabled by default. To change it, edit `config/TRIGGERS.json`:

```json
{
  "name": "review-github-event",
  "watch_path": "/github/webhook",
  "actions": [
    { "type": "agent", "job": "A GitHub event occurred. Review the payload and summarize what happened:\n{{body}}" }
  ],
  "enabled": true
}
```

Then commit and push.

---

## 10. Redeploy in Coolify

After updating env vars or code:

1. **Coolify** → **Pope Bot** → **Deploy**

---

## Quick checklist

- [ ] `gh auth login` completed
- [ ] New token with `repo` + `workflow` scopes
- [ ] `GH_TOKEN` in Coolify
- [ ] `AGENT_GH_TOKEN` in GitHub Actions secrets
- [ ] `GH_WEBHOOK_SECRET` in Coolify and GitHub
- [ ] `GH_BRANCH=master` in Coolify (already set)
- [ ] Workflows pushed (`git push origin master`)
- [ ] Redeploy in Coolify

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| Push rejected (workflow) | Token needs `workflow` scope |
| Job create 404 | `GH_BRANCH=master` in Coolify (already set) |
| Webhook 401 | `GH_WEBHOOK_SECRET` must match in Coolify and GitHub |
| Agent jobs fail | Add `AGENT_GH_TOKEN` and `AGENT_OPENAI_API_KEY` in GitHub secrets |
