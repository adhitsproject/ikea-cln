import json
from bs4 import BeautifulSoup

soup=BeautifulSoup(open('.pwc/cloudflare-source/stores.html',encoding='utf-8').read(),'html.parser')
out=[]
for option in soup.select('#slct option'):
    code=option.get('value')
    city=option.get_text(' ',strip=True)
    region=soup.find(id=code)
    cards=[]
    if region:
        for h in region.select('h3'):
            title=h.get_text(' ',strip=True)
            if not title: continue
            container=h.find_parent('div',class_='col-md-3')
            text=container.get_text(' ',strip=True) if container else h.get_text(' ',strip=True)
            if text.startswith(title): text=text[len(title):].strip()
            links=[{'text':a.get_text(' ',strip=True),'href':a.get('href')} for a in (container.select('a[href]') if container else [])]
            cards.append({'title':title,'text':text,'links':links})
    out.append({'city':city,'code':code,'cards':cards})
open('.pwc/cloudflare-source/pickup-data.json','w',encoding='utf-8').write(json.dumps(out,ensure_ascii=False,indent=2))
for x in out:
    print(x['city'],len(x['cards']),'; '.join(y['title'] for y in x['cards']).encode('ascii','backslashreplace').decode())
