"""Record reproducible standalone PWC and local preview checks."""
import json
import os
import subprocess
from pathlib import Path

evidence = Path('.pwc/checks')
evidence.mkdir(exist_ok=True)
checks = {
    'fingerprints-src': ['pwc', 'fingerprints', 'src'],
    'fingerprints-dist': ['pwc', 'fingerprints', 'dist'],
    'weight-dist': ['pwc', 'weight', 'dist'],
    'runtime-preview': ['python', '.pwc/audit_runtime.py'],
    'probe-syntax': ['node', '--check', '.pwc/interaction-probe.js'],
}
for name, command in checks.items():
    environment = os.environ.copy()
    if name == 'runtime-preview':
        environment['IKEA_AUDIT_BASE'] = 'http://127.0.0.1:4173'
    result = subprocess.run(command, capture_output=True, text=True, env=environment)
    record = {'command': command, 'exit_code': result.returncode,
              'stdout': result.stdout, 'stderr': result.stderr}
    (evidence / f'{name}.json').write_text(json.dumps(record, indent=2), encoding='utf-8')
    print(f'{name}: exit={result.returncode}')
    if result.returncode:
        raise SystemExit(result.returncode)
