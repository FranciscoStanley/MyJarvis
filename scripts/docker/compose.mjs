#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const composeArgs = args.length ? args : ['up', '-d', '--build'];

const result = spawnSync('docker', ['compose', ...composeArgs], {
  stdio: 'inherit',
  env: {
    ...process.env,
    COMPOSE_PARALLEL_LIMIT: process.env.COMPOSE_PARALLEL_LIMIT ?? '2',
  },
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
