// Turns tool output into GitHub Actions annotations so problems show on the pull request
// (and through the checks API) without opening raw logs.
//   node scripts/ci-annotate.mjs eslint <eslint-json-report>
//   node scripts/ci-annotate.mjs tsc    <tsc-output.txt>      (run tsc with --pretty false)
//   node scripts/ci-annotate.mjs raw    <any-log.txt>         (tail of the log as one annotation)
// Always exits 0: it only reports, the failing step itself decides the build result.
import { readFileSync, existsSync } from 'node:fs';

const [kind, file] = process.argv.slice(2);
if (!kind || !file || !existsSync(file)) {
  console.log(`ci-annotate: nothing to read (${kind ?? '?'} ${file ?? '?'})`);
  process.exit(0);
}

const text = readFileSync(file, 'utf8');
const data = (s) => s.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
const prop = (s) => data(s).replace(/:/g, '%3A').replace(/,/g, '%2C');
const relative = (p) => p.replace(`${process.cwd()}/`, '');

const problems = [];
if (kind === 'eslint') {
  for (const result of JSON.parse(text)) {
    for (const m of result.messages) {
      problems.push({
        level: m.severity === 2 ? 'error' : 'warning',
        file: relative(result.filePath),
        line: m.line ?? 1,
        col: m.column ?? 1,
        text: `${m.ruleId ?? 'eslint'}: ${m.message}`,
      });
    }
  }
} else if (kind === 'tsc') {
  const pattern = /^(.+?)\((\d+),(\d+)\): (error|warning) (TS\d+): (.*)$/;
  let last = null;
  for (const line of text.split('\n')) {
    const m = pattern.exec(line.trim());
    if (m && !/^\s/.test(line)) {
      last = { level: m[4], file: m[1], line: Number(m[2]), col: Number(m[3]), text: `${m[5]}: ${m[6]}` };
      problems.push(last);
    } else if (last && /^\s+\S/.test(line)) {
      last.text += ` | ${line.trim()}`; // continuation lines explain which part is incompatible
    }
  }
} else {
  console.log(`::error title=${prop(`Log tail: ${file}`)}::${data(text.slice(-4000))}`);
  process.exit(0);
}

// GitHub keeps only the first 10 annotations of each level per step, so put one combined
// annotation that lists every problem first, then up to 8 individual file annotations.
const all = problems.map((p) => `${p.level.toUpperCase()} ${p.file}:${p.line}:${p.col} ${p.text}`).join('\n');
console.log(`::error title=${prop(`${kind}: ${problems.length} problem(s)`)}::${data(all.slice(0, 30000) || 'none found in the report')}`);
for (const p of problems.filter((x) => x.level === 'error').slice(0, 8)) {
  console.log(`::error file=${prop(p.file)},line=${p.line},col=${p.col}::${data(p.text)}`);
}
