// Keeps the Android app version in step with package.json (the single source of truth).
//   versionName = package.json "version"
//   versionCode = major * 10000 + minor * 100 + patch   (3.5.0 -> 30500, 4.0.0 -> 40000)
// Usage: node scripts/sync-android-version.mjs [--check]
//   --check  exit 1 if build.gradle is out of date instead of rewriting it.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = join(root, 'package.json');
const gradlePath = join(root, 'android', 'app', 'build.gradle');

export function versionCodeFor(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version);
  if (!match) throw new Error(`Unsupported version "${version}" (expected MAJOR.MINOR.PATCH)`);
  const [major, minor, patch] = match.slice(1).map(Number);
  if (minor > 99 || patch > 99) throw new Error(`minor and patch must be <= 99 (got ${version})`);
  return major * 10000 + minor * 100 + patch;
}

export function applyVersion(gradle, version) {
  const code = versionCodeFor(version);
  const next = gradle
    .replace(/versionCode\s+\d+/, `versionCode ${code}`)
    .replace(/versionName\s+"[^"]*"/, `versionName "${version}"`);
  if (!/versionCode\s+\d+/.test(next) || !/versionName\s+"[^"]*"/.test(next)) {
    throw new Error('build.gradle has no versionCode/versionName line to update');
  }
  return next;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const { version } = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const current = readFileSync(gradlePath, 'utf8');
  const next = applyVersion(current, version);
  if (process.argv.includes('--check')) {
    if (next !== current) {
      console.error(`android/app/build.gradle is out of date for version ${version}. Run: node scripts/sync-android-version.mjs`);
      process.exit(1);
    }
    console.log(`Android version OK (${version}, code ${versionCodeFor(version)})`);
  } else {
    if (next !== current) writeFileSync(gradlePath, next);
    console.log(`Android version set to ${version} (code ${versionCodeFor(version)})`);
  }
}
