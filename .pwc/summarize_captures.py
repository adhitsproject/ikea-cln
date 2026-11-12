"""Decode immutable remote captures and summarize observed runtime evidence."""
import base64
import hashlib
import io
import json
import re
import sys
from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parent.parent
folder = root / '.pwc' / 'candidate'
version = sys.argv[1]
captures = []
for width in (1440, 390):
    for name in ('home', 'best', 'stores', 'faq', 'about'):
        stem = f'{name}-{version}-{width}'
        encoded = folder / (stem + '.b64')
        if not encoded.exists():
            continue
        png = folder / (stem + '.png')
        if not png.exists():
            Image.open(io.BytesIO(base64.b64decode(encoded.read_text()))).save(png)
        with Image.open(png) as image:
            dimensions = list(image.size)
            image.crop((0, 0, width, 1000 if width == 1440 else 844)).save(folder / (stem + '-viewport.png'))
        html = (folder / (stem + '.html')).read_text(encoding='utf-8')
        matches = re.findall(r'<script id="candidate-observation" type="application/json">(.*?)</script>', html, re.S)
        observation = json.loads(matches[-1]) if matches else {}
        images = observation.get('images', [])
        captures.append({'page': name, 'viewport': [width, 1000 if width == 1440 else 844], 'actual_dimensions': dimensions, 'screenshot': png.name, 'sha256': hashlib.sha256(png.read_bytes()).hexdigest(), 'loaded_images': sum(bool(x['ok']) for x in images), 'image_count': len(images), 'runtime_errors': observation.get('runtimeErrors', []), 'horizontal_overflow': dimensions[0] > width, 'has_main': observation.get('hasMain'), 'hero_frame_normalized': name == 'home'})
report = {'version': version, 'provenance': 'Frozen built JS/CSS rendered through Cloudflare Browser Rendering, local fonts inlined, local media references mapped to original URLs while preserving authored src. Native local browser remains unavailable. Home hero uses original GIF frame 1 only in QA.', 'captures': captures}
(folder / (version + '-capture-manifest.json')).write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report))
