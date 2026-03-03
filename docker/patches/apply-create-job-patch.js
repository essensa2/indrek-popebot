#!/usr/bin/env node
/** Patch thepopebot create-job.js to use GH_BRANCH env instead of hardcoded 'main' */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '../../node_modules/thepopebot/lib/tools/create-job.js');

let content = readFileSync(file, 'utf8');
const replacement = `  // 1. Get base branch SHA (GH_BRANCH env, default main)
  const baseBranch = process.env.GH_BRANCH || 'main';
  const mainRef = await githubApi(\`\${repo}/git/ref/heads/\${baseBranch}\`);`;

if (content.includes('git/ref/heads/main')) {
  content = content.replace(
    /  \/\/ 1\. Get main branch SHA[^\n]*\n  const mainRef = await githubApi\([^)]+\);/,
    replacement
  );
  writeFileSync(file, content);
  console.log('Patched create-job.js: GH_BRANCH support added');
} else {
  console.log('Patch already applied or file format changed');
}
