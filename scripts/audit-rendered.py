"""Audit prerendered internal links, assets, metadata and footer credit without a server."""
import json, re
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(); self.ids=[]; self.links=[]; self.assets=[]; self.h1=0; self.fonts=[]; self.canonical=[]; self.credit=False
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.append(a['id'])
        if tag=='h1': self.h1+=1
        if tag=='a' and a.get('href'): self.links.append(a['href'])
        if tag in ('img','video','source'):
            for k in ('src','poster','data-src'):
                if a.get(k): self.assets.append(a[k])
        if tag=='link' and a.get('as')=='font': self.fonts.append(a['href'])
        if tag=='link' and a.get('rel')=='canonical': self.canonical.append(a.get('href'))
    def handle_data(self, data):
        if 'Arvinify Technology Inc.' in data: self.credit=True

root=Path('.next/server/app'); pages={}
for f in root.rglob('*.html'):
    route='/'+str(f.relative_to(root))[:-5]
    if route=='/index': route='/'
    if route.startswith('/_'): continue
    pages[route]=Page(f.read_text())
manifest=json.loads(Path('.next/server/app-paths-manifest.json').read_text())
dynamic={path.removesuffix('/page') or '/' for path in manifest if path.endswith('/page') and '[' not in path}
redirects={'/puppy/11-weeks','/puppy/4-5-months'}
issues=[]; edges=0; image_count=0
for route,p in pages.items():
    if p.h1!=1: issues.append([route,'h1 count',p.h1])
    if len(p.ids)!=len(set(p.ids)): issues.append([route,'duplicate ids'])
    if not p.credit: issues.append([route,'missing builder credit'])
    for href in p.links:
        url=urlsplit(href)
        if url.netloc and url.netloc not in ('thepetclub.ca','www.thepetclub.ca'): continue
        if url.scheme and url.scheme not in ('https','http'): continue
        path=unquote(url.path).rstrip('/') or ('/' if url.path else route)
        if path not in pages and path not in dynamic and path not in redirects and not (Path('public')/path.lstrip('/')).is_file():
            issues.append([route,'unresolved link',href]);continue
        edges+=1
        if url.fragment and path in pages and unquote(url.fragment) not in pages[path].ids:
            issues.append([route,'missing anchor',href])
    for asset in p.assets+p.fonts:
        url=urlsplit(asset)
        if url.netloc: continue
        if url.path.startswith('/_next/image'): continue
        file=Path('.next')/url.path[len('/_next/'):] if url.path.startswith('/_next/') else Path('public')/url.path.lstrip('/')
        image_count+=1
        if not file.is_file(): issues.append([route,'missing asset',asset])
    expected='https://thepetclub.ca'+('' if route=='/' else route)
    if len(p.canonical)!=1 or p.canonical[0].rstrip('/')!=expected: issues.append([route,'canonical',p.canonical])
report={'pages':len(pages),'internal_links':edges,'local_asset_and_font_references':image_count,'issues':issues,'scope':'Prerendered HTML and local assets; dynamic auth and browser rendering are separate checks.'}
Path('docs/design').mkdir(parents=True,exist_ok=True)
Path('docs/design/rendered-audit.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
raise SystemExit(bool(issues))
