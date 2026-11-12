import re
from pathlib import Path
from collections import Counter

s = Path('src/main.jsx').read_text(encoding='utf-8')
print('hash hrefs:', Counter(re.findall(r'href=["\'](#[^"\']+)["\']', s)))
print('literal /assets refs:', len(re.findall(r'/assets/[A-Za-z0-9_.-]+', s)))
print('remote URLs:', len(re.findall(r'https?://', s)))
print('products constant refs:', len(re.findall(r'\bproducts\b', s)))
print('question-mark placeholders:', [s[max(0, m.start()-50):m.start()+50] for m in re.finditer(r"\?'\?'|'\?'", s)][:8])
for m in re.finditer(r'href=["\'](#[^"\']+)["\']', s):
    print('hash context:', s[max(0,m.start()-45):m.end()+65])
