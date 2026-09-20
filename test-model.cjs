/**
 * Headless model test suite for Aquarium Shop Tycoon.
 * Runs all pure Node.js model tests without requiring browser/Playwright dependencies.
 */
const { execFileSync } = require('child_process');

const tests = [
  'cargo-model.test.cjs',
  'layout.test.cjs',
  'model.test.cjs',
  'navigation.test.cjs',
  'orders-model.test.cjs',
  'polish-model.test.cjs',
  'recovery-model.test.cjs',
  'bubble-model.test.cjs',
  'restock-indicators.test.cjs',
  'integration-tasks-1-4.test.cjs'
];

let failed = 0;
console.log(`Running ${tests.length} headless model test suites...\n`);

for (const testFile of tests) {
  const start = Date.now();
  try {
    const output = execFileSync(process.execPath, [testFile], { encoding: 'utf8' });
    const duration = Date.now() - start;
    console.log(`\x1b[32m✔ PASS\x1b[0m ${testFile} (${duration}ms)`);
    if (output.trim()) {
      console.log('  ' + output.trim().split('\n').join('\n  '));
    }
  } catch (err) {
    failed++;
    console.error(`\x1b[31m✖ FAIL\x1b[0m ${testFile}`);
    if (err.stdout) console.error('  STDOUT: ' + err.stdout);
    if (err.stderr) console.error('  STDERR: ' + err.stderr);
  }
}

console.log(`\n========================================`);
if (failed === 0) {
  console.log(`\x1b[32mALL ${tests.length} MODEL TEST SUITES PASSED\x1b[0m`);
  process.exit(0);
} else {
  console.error(`\x1b[31m${failed} of ${tests.length} TEST SUITES FAILED\x1b[0m`);
  process.exit(1);
}
