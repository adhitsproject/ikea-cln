from bs4 import BeautifulSoup
s=BeautifulSoup(open('.pwc/cloudflare-source/stores.html',encoding='utf-8').read(),'html.parser')
for select in s.select('select'):
    print('SELECT',select.get('id'),select.get('class'),select.get('name'))
    for option in select.select('option'): print('OPT',option.get('value'),option.get_text(' ',strip=True).encode('ascii','backslashreplace').decode())
for x in s.find_all(string=lambda x:x and ('Pick-up Point' in x or 'Click & Collect' in x))[:15]:
    print('TEXT',x.strip()[:150].encode('ascii','backslashreplace').decode(),'P',x.parent.name,x.parent.get('class'))
sel=s.select_one('#slct')
p=sel
for i in range(5):
    print('AN',i,p.name,p.get('class'),p.get('id'),len(p.get_text(' ',strip=True)))
    p=p.parent
for h in s.select('h3'):
    if 'Click & Collect' in h.get_text(' ',strip=True) or 'Pick-up Point' in h.get_text(' ',strip=True):
        p=h.parent
        a=p
        path=[]
        for _ in range(6):
            path.append((a.name,a.get('class'),a.get('id'),a.get('data-city'),a.get('style')))
            a=a.parent
        print('POINT',h.get_text(' ',strip=True).encode('ascii','backslashreplace').decode(),path)
