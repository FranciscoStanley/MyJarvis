#!/usr/bin/env node
/**
 * Quality gate Stage 3:
 * - Bloqueia em vulnerabilidades CRITICAL em deps de produção
 * - Ignora falsos positivos de workspaces locais (ex.: service-gateway vs malware no npm)
 * - Reporta high/moderate como warning (transitivas comuns em bcrypt/next)
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function collectWorkspaceNames() {
  const names = new Set();
  const rootPkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  if (rootPkg.name) names.add(rootPkg.name);

  for (const folder of ['packages', 'services', 'frontends']) {
    const dir = join(root, folder);
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const pkgPath = join(dir, entry.name, 'package.json');
      if (!existsSync(pkgPath)) continue;
      names.add(JSON.parse(readFileSync(pkgPath, 'utf8')).name);
    }
  }

  const testsPkg = join(root, 'tests', 'package.json');
  if (existsSync(testsPkg)) {
    names.add(JSON.parse(readFileSync(testsPkg, 'utf8')).name);
  }

  return names;
}

function runAudit(args) {
  try {
    execSync(`npm audit ${args}`, { cwd: root, stdio: 'inherit' });
    return 0;
  } catch {
    return 1;
  }
}

function getAuditReport(args) {
  try {
    const output = execSync(`npm audit ${args} --json`, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return JSON.parse(output);
  } catch (error) {
    if (error.stdout) return JSON.parse(error.stdout);
    throw error;
  }
}

function filterWorkspaceFalsePositives(vulnerabilities, workspaceNames) {
  const filtered = {};
  const ignored = [];

  for (const [key, vuln] of Object.entries(vulnerabilities ?? {})) {
    if (workspaceNames.has(vuln.name)) {
      ignored.push({ name: vuln.name, severity: vuln.severity });
      continue;
    }
    filtered[key] = vuln;
  }

  return { filtered, ignored };
}

function countBySeverity(vulnerabilities) {
  const counts = { critical: 0, high: 0, moderate: 0, low: 0 };
  for (const vuln of Object.values(vulnerabilities ?? {})) {
    if (counts[vuln.severity] !== undefined) counts[vuln.severity] += 1;
  }
  return counts;
}

const workspaceNames = collectWorkspaceNames();

console.log('--- Audit: produção (critical — bloqueante) ---');
runAudit('--omit=dev --audit-level=critical');

const prodReport = getAuditReport('--omit=dev');
const { filtered: prodVulns, ignored: ignoredProd } = filterWorkspaceFalsePositives(
  prodReport.vulnerabilities,
  workspaceNames,
);

if (ignoredProd.length > 0) {
  console.warn('\n⚠️  Ignorando falsos positivos de workspaces locais:');
  for (const item of ignoredProd) {
    console.warn(`   - ${item.name} (${item.severity})`);
  }
}

const prodCounts = countBySeverity(prodVulns);
if (prodCounts.critical > 0) {
  console.error(
    `\n❌ Stage 3 bloqueada: ${prodCounts.critical} vulnerabilidade(s) CRITICAL em produção.`,
  );
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
