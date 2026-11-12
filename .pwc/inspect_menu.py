from pathlib import Path
t=Path('src/main.jsx').read_text(encoding='utf-8')
a=t.index('{menu&&<')
b=t.index('{menu&&<button className="scrim"')
print(t[a:b])
