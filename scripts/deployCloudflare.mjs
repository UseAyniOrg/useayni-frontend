import { spawnSync } from 'node:child_process';

const apiOrigin = process.env.CLOUD_RUN_API_ORIGIN?.trim();
if (!apiOrigin) {
  console.error('Set CLOUD_RUN_API_ORIGIN to the deployed HTTPS *.run.app URL before deploying the Worker.');
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(apiOrigin);
} catch {
  console.error('CLOUD_RUN_API_ORIGIN must be a valid HTTPS URL.');
  process.exit(1);
}
if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.run.app')) {
  console.error('CLOUD_RUN_API_ORIGIN must use the HTTPS Cloud Run *.run.app hostname.');
  process.exit(1);
}

const result = spawnSync('npx', ['wrangler', 'deploy', ...process.argv.slice(2), '--var', `API_ORIGIN:${parsed.origin}`], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(result.status ?? 1);