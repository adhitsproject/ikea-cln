import json,sys
for name in ['home','best','stores','faq','about']:
    data=json.load(open(f'.pwc/cloudflare-source/{name}-layout-1440.json',encoding='utf-8'))
    print('\n'+name.upper())
    for n in data['nodes']:
        if n['tag'] in ('H1','H2') or (n['classes'] and any(x in n['classes'].lower() for x in ['header','container','breadcrumb','best','stores','faq','about','grid'])):
            if n['x']>=0 and n['y']<1800 and n['w']>100:
                print(n['tag'],n['classes'][:35],repr(n['text'][:50]),*[round(n[k],1) for k in ('x','y','w','h')],n['fontSize'])
