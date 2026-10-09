"""Read-only public crawl. Sitemap inclusion is not Google indexing evidence."""
import concurrent.futures, json, re, urllib.request, urllib.error
from html.parser import HTMLParser
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree

ORIGIN = 'https://thepetclub.ca'
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.title = ''; self.in_title = False; self.h1 = 0
        self.canonical = []; self.robots = []; self.description = []; self.links = set(); self.schemas = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'title': self.in_title = True
        if tag == 'h1': self.h1 += 1
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical.append(a.get('href'))
        if tag == 'meta':
            if a.get('name') == 'robots': self.robots.append(a.get('content'))
            if a.get('name') == 'description': self.description.append(a.get('content'))
        if tag == 'a' and a.get('href', '').startswith('/'): self.links.add(a['href'].split('#')[0].split('?')[0])
        if tag == 'script' and a.get('type') == 'application/ld+json': self.schemas += 1
    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
    def handle_data(self, data):
        if self.in_title: self.title += data

def read(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'ThePetClub-audit/1.0'}), timeout=25) as r:
            body = r.read().decode(); p = Page(); p.feed(body)
            return dict(url=url,status=r.status,final_url=r.url,title=p.title,h1=p.h1,canonical=p.canonical,
                        robots=p.robots,description=p.description,schemas=p.schemas,links=sorted(p.links),
                        analytics_tags=bool(re.search(r'googletagmanager|google-analytics|vercel/analytics|va.vercel-scripts',body)))
    except Exception as e: return dict(url=url,error=str(e))

if __name__ == '__main__':
    sitemap = urllib.request.urlopen(ORIGIN+'/sitemap.xml').read()
    urls = [n.text for n in ElementTree.fromstring(sitemap).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool: pages=list(pool.map(read,urls))
    discovered = sorted({ORIGIN+p for row in pages for p in row.get('links',[]) if p and ORIGIN+p not in urls})
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool: linked=list(pool.map(read,discovered))
    report=dict(observed_at=datetime.now(timezone.utc).isoformat(),sitemap_urls=len(urls),pages=pages,linked_pages=linked,
                limitation='Public HTTP audit only; no Search Console indexing, field CWV, visits, conversions or revenue data.')
    Path('docs/growth/live-audit.json').write_text(json.dumps(report,indent=2))
    print(json.dumps(dict(sitemap_urls=len(urls),linked_pages=len(linked),failed=[p for p in pages+linked if p.get('status') != 200],
        bad_h1=[p['url'] for p in pages if p.get('h1')!=1],analytics_pages=sum(p.get('analytics_tags',False) for p in pages))))
