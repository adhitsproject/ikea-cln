"""Read-only local preview and media HEAD smoke check."""
import json
import os
import urllib.request
from pathlib import Path

base = os.environ.get('IKEA_AUDIT_BASE', 'http://127.0.0.1:5173')
routes = ['/in', '/in/penawaran/produk-terlaris', '/in/lokasi-kami', '/in/layanan-pelanggan/faq', '/in/tentang/perusahaan-ikea']
media = [f'/assets/BestSeller_{part}.mp4' for part in ['89509014', '70362917', '79621879', '90355421', '60349672', '70304239']]
media.append('/assets/28092026_ALPTALL_ALL.mp4')
products = json.loads(Path('src/best-products.json').read_text(encoding='utf-8'))
media.extend(item['image'] for item in products)
media.extend(['/assets/NotoIKEALatin-Regular.ttf', '/assets/NotoIKEALatin-Bold.ttf'])

failures = []
for path in routes + media:
    request = urllib.request.Request(base + path, method='HEAD')
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            status = response.status
            content_type = response.headers.get('Content-Type', '')
            length = int(response.headers.get('Content-Length', '0'))
            expected = ('text/html' if path in routes else 'video/mp4' if path.endswith('.mp4') else 'image/jpeg' if path.endswith('.jpg') else 'font/ttf')
            ok = status == 200 and content_type.startswith(expected) and (path in routes or length > 1000)
            print(f'{"PASS" if ok else "FAIL"} {path} status={status} type={content_type} bytes={length}')
            if not ok:
                failures.append(path)
    except Exception as error:
        print(f'FAIL {path}: {error}')
        failures.append(path)
print(f'checked={len(routes)+len(media)} failures={len(failures)}')
raise SystemExit(bool(failures))
