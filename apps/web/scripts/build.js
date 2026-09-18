#!/usr/bin/env node
import { spawnSync } from 'child_process';

const [major] = process.versions.node.split('.');
if (parseInt(major, 10) < 19) {
  process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --experimental-global-webcrypto`.trim();
}

const result = spawnSync('npx', ['vite', 'build'], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 0);
