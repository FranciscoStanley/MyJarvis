#!/usr/bin/env node
/**
 * Quality gate Stage 3:
 * - Bloqueia em vulnerabilidades CRITICAL em deps de produção
 * - Reporta high/moderate como warning (transitivas comuns em bcrypt/next)
 */
import { execSync } from 'node:child_process';

function runAudit(args) {
  try {
    execSync(`npm audit ${args}`, { stdio: 'inherit' });
    return 0;
  } catch {
    return 1;
  }
}

console.log('--- Audit: produção (critical — bloqueante) ---');
const prodCritical = runAudit('--omit=dev --audit-level=critical');

if (prodCritical !== 0) {
  console.error('\n❌ Stage 3 bloqueada: vulnerabilidades CRITICAL em produção.');
  process.exit(1);
}

console.log('\n--- Audit: produção (high — informativo) ---');
if (runAudit('--omit=dev --audit-level=high') !== 0) {
  console.warn('⚠️  High em transitivas (ex.: tar via bcrypt) — acompanhar upgrades.');
}

console.log('\n--- Audit: devDependencies (informativo) ---');
runAudit('--audit-level=critical');

console.log('\n✅ Audit gate OK');
process.exit(0);
