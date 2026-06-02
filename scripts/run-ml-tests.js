const { spawnSync } = require('child_process');

const isWindows = process.platform === 'win32';
const candidates = isWindows
  ? [
      { command: 'py', args: ['-3.12', '-m', 'pytest'] },
      { command: 'py', args: ['-3.11', '-m', 'pytest'] },
      { command: 'python', args: ['-m', 'pytest'] },
    ]
  : [
      { command: 'python', args: ['-m', 'pytest'] },
      { command: 'python3', args: ['-m', 'pytest'] },
    ];

let lastStatus = 1;

for (const candidate of candidates) {
  const result = spawnSync(candidate.command, candidate.args, {
    cwd: 'ml',
    stdio: 'inherit',
    shell: isWindows,
  });

  if (result.error && result.error.code === 'ENOENT') {
    continue;
  }

  lastStatus = result.status ?? 1;
  process.exit(lastStatus);
}

console.error('No compatible Python interpreter found for ML tests.');
process.exit(lastStatus);
