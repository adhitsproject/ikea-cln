import json, re
from bs4 import BeautifulSoup

soup = BeautifulSoup(open('.pwc/cloudflare-source/home.html', encoding='utf-8').read(), 'html.parser')
cards = soup.select('div.ins-product-content')
out = []
for card in cards:
    image = card.select_one('img.ins-image-area')
    link = card.select_one('a.ins-product-box[href]')
    if not image or not link: continue
    name_el = card.select_one('[aria-label^="Product name:"]')
    name = (name_el.get('aria-label','').replace('Product name:','').strip() if name_el else image.get('alt',''))
    desc_el = card.select_one('[data-dynamic-text-value*="description-default"]')
    description = desc_el.get_text(' ', strip=True) if desc_el else ''
    price_candidates = re.findall(r'Rp\s*[\d.]+', card.get_text(' ', strip=True))
    raw_price = price_candidates[-1] if price_candidates else ''
    price_digits = re.sub(r'\D', '', raw_price)
    price = 'Rp ' + f'{int(price_digits):,}'.replace(',', '.') if price_digits else ''
    sale = bool(card.select_one('.ins-custom-sale-badge'))
    out.append({'name':name,'description':description,'price':price,'image':image.get('src',''),'href':link['href'],'sale':sale})
out = out[:16]
print('cards',len(cards),'extracted',len(out))
for item in out: print(item['name'].encode('ascii','backslashreplace').decode(),item['price'],item['image'].split('/')[-1])
open('.pwc/cloudflare-source/home-products.json','w',encoding='utf-8').write(json.dumps(out,ensure_ascii=False,indent=2))
