#!/usr/bin/env node
/** Patch thepopebot api/index.js to support GitHub native webhooks (X-Hub-Signature-256) for Issues */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '../../node_modules/thepopebot/api/index.js');

let content = readFileSync(file, 'utf8');

// Skip if already patched
if (content.includes('verifyHubSignature')) {
  console.log('Patch already applied: GitHub native webhook support');
  process.exit(0);
}

// 1. Add createHmac to crypto import
content = content.replace(
  "import { createHash, timingSafeEqual } from 'crypto';",
  "import { createHash, createHmac, timingSafeEqual } from 'crypto';"
);

// 2. Replace handleGithubWebhook auth block and body reading
const oldBlock = `async function handleGithubWebhook(request) {
  const { GH_WEBHOOK_SECRET } = process.env;

  // Validate webhook secret (timing-safe, required)
  if (!GH_WEBHOOK_SECRET || !safeCompare(request.headers.get('x-github-webhook-secret-token'), GH_WEBHOOK_SECRET)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const jobId = payload.job_id || extractJobId(payload.branch);
  if (!jobId) return Response.json({ ok: true, skipped: true, reason: 'not a job' });`;

const newBlock = `/**
 * Validate GitHub native webhook signature (X-Hub-Signature-256).
 */
function verifyHubSignature(rawBody, signature, secret) {
  if (!rawBody || !signature || !secret) return false;
  const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex');
  return safeCompare(signature, expected);
}

async function handleGithubWebhook(request) {
  const { GH_WEBHOOK_SECRET } = process.env;
  const rawBody = await request.text();
  const hubSig = request.headers.get('x-hub-signature-256');
  const tokenHeader = request.headers.get('x-github-webhook-secret-token');

  // Native GitHub webhooks (Issues, PRs, etc.) use X-Hub-Signature-256
  if (hubSig && GH_WEBHOOK_SECRET && verifyHubSignature(rawBody, hubSig, GH_WEBHOOK_SECRET)) {
    return Response.json({ ok: true, source: 'github-native' });
  }

  // GitHub Actions workflows use X-GitHub-Webhook-Secret-Token
  if (!GH_WEBHOOK_SECRET || !safeCompare(tokenHeader, GH_WEBHOOK_SECRET)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const jobId = payload.job_id || extractJobId(payload.branch);
  if (!jobId) return Response.json({ ok: true, skipped: true, reason: 'not a job' });`;

if (content.includes('// Validate webhook secret (timing-safe, required)')) {
  content = content.replace(oldBlock, newBlock);
  writeFileSync(file, content);
  console.log('Patched api/index.js: GitHub native webhook (Issues) support added');
} else {
  console.log('Patch skipped: file format changed or already patched');
}
