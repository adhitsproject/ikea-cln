from bs4 import BeautifulSoup

s = BeautifulSoup(open('.pwc/cloudflare-source/home.html', encoding='utf-8').read(), 'html.parser')
for x in s.find_all(string=lambda x: x and 'Spesial untuk Kamu' in x):
    print('TAG', x.parent.name, x.parent.get('class'), 'PARENT', x.parent.parent.get('class'))
    print(x.parent.parent.prettify()[:1500].encode('ascii', 'backslashreplace').decode())
print('product links', len(s.select('a[href*="/p/"]')), len(s.select('a[href*="produk/"]')))
for a in s.select('a[href*="/p/"],a[href*="produk/"]')[:20]:
    print(a.get('href'), a.get_text(' ', strip=True)[:160].encode('ascii', 'backslashreplace').decode())
for a in s.select('a[href*="produk/"]')[-35:]:
    print('TAIL',a.get('href'),a.get_text(' ',strip=True)[:100].encode('ascii','backslashreplace').decode(), a.parent.get('class'))
u={}
for a in s.select('a[href*="produk/"]'):
    if '-art-' in a.get('href',''):
        u.setdefault(a['href'],a)
print('unique product links',len(u))
for href,a in u.items():
    p=a
    for _ in range(4): p=p.parent
    print('CARD',href.split('/')[-1], 'CLASS', p.get('class'), 'TEXT',p.get_text(' ',strip=True)[:200].encode('ascii','backslashreplace').decode())
a=next(a for href,a in u.items() if 'svardfisk' in href)
p=a
for i in range(8):
    print('AN',i,p.name,p.get('class'),len(p.get_text(' ',strip=True)),p.get_text(' ',strip=True)[:180].encode('ascii','backslashreplace').decode())
    p=p.parent
with open('.pwc/cloudflare-source/home-product-example.html','w',encoding='utf-8') as f: f.write(p.prettify())
