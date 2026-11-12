import json
from pathlib import Path

from bs4 import BeautifulSoup

root = Path(__file__).resolve().parents[1]
source = BeautifulSoup((root / '.pwc/cloudflare-source/faq.html').read_text(encoding='utf-8'), 'html.parser')
data = json.loads((root / 'src/faq-data.json').read_text(encoding='utf-8'))
panels = {}
for anchor in source.select('a[data-toggle=collapse]'):
    title = anchor.get_text(' ', strip=True)
    target = anchor.get('aria-controls')
    if not target or not title:
        continue
    panel = source.find(id=target)
    if not panel:
        continue
    body = panel.select_one('.col-12.mb-4') or panel
    for item in body.select('script, style, svg, iframe'):
        item.decompose()
    panels[title] = ''.join(str(child) for child in body.contents).strip()

found = 0
for topic in data:
    for item in topic['questions']:
        rich = panels.get(item['question'])
        if rich:
            item['answerHtml'] = rich
            found += 1

(root / '.pwc/cloudflare-source/faq-rich-data.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{found} of {sum(len(t["questions"]) for t in data)} matched; {len(panels)} source panels')
print('with links', sum('<a ' in q.get('answerHtml','') for t in data for q in t['questions']))
print('with lists', sum('<li' in q.get('answerHtml','') for t in data for q in t['questions']))
