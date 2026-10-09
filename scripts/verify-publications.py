"""Read-only release checks; successful publication does not prove Google indexing."""
import concurrent.futures, json, re, urllib.request
from html.parser import HTMLParser
from pathlib import Path
from datetime import datetime, timezone
from xml.etree import ElementTree
ORIGIN = 'https://thepetclub.ca'
class Document(HTMLParser):
    def __init__(self):
        super().__init__(); self.robots=[]; self.canonical=[]; self.h1=0; self.links=[]; self.scripts=[]; self.in_json=False; self.current=''
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='h1': self.h1+=1
        if tag=='meta' and a.get('name')=='robots': self.robots.append(a.get('content',''))
        if tag=='link' and a.get('rel')=='canonical': self.canonical.append(a.get('href'))
        if tag=='a': self.links.append(a.get('href','').split('#')[0].split('?')[0])
        if tag=='script' and a.get('type')=='application/ld+json': self.in_json=True; self.current=''
    def handle_data(self, data):
        if self.in_json: self.current+=data
    def handle_endtag(self, tag):
        if tag=='script' and self.in_json:
            self.scripts.append(json.loads(self.current)); self.in_json=False

def fetch(path):
    with urllib.request.urlopen(ORIGIN+path,timeout=25) as response:
        doc=Document();doc.feed(response.read().decode());return response.status,doc
registry=Path('src/features/editorial/articles.ts').read_text()
records=[]
for part in re.split(r'\n    slug: "',registry)[1:]:
    slug=part.split('"',1)[0]
    body=part.split('\n    slug:',1)[0]
    status=re.search(r'status: "(published|in-review)"',body)
    if status: records.append((slug,status.group(1)))
sitemap=urllib.request.urlopen(ORIGIN+'/sitemap.xml').read()
urls=[item.text for item in ElementTree.fromstring(sitemap).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
_,library=fetch('/guides')
report=[]
def verify(item):
    slug,status=item;path='/guides/'+slug;code,doc=fetch(path)
    published=status=='published';schemas=[schema for schema in doc.scripts if isinstance(schema,dict) and schema.get('@type')=='Article']
    row=dict(slug=slug,status=status,http_status=code,h1=doc.h1,canonical=doc.canonical,robots=doc.robots,in_sitemap=ORIGIN+path in urls,library_link=path in library.links,article_schema=bool(schemas),datePublished=schemas[0].get('datePublished') if schemas else None)
    row['passed']=code==200 and doc.h1==1 and doc.canonical==[ORIGIN+path] and row['in_sitemap']==published and row['library_link']==published and (('noindex' not in ','.join(doc.robots)) if published else ('noindex' in ','.join(doc.robots))) and bool(schemas) and bool(row['datePublished'])==published
    return row
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool: report=list(pool.map(verify,records))
assert len(report)==35, 'Unexpected repository article count'
result=dict(observed_at=datetime.now(timezone.utc).isoformat(),origin=ORIGIN,sitemap_urls=len(urls),published=sum(r['status']=='published' for r in report),held=sum(r['status']=='in-review' for r in report),failed=[r for r in report if not r['passed']],articles=report,limitation='Public release verification, not evidence of Google indexing or an independent clinical review.')
Path('docs/growth/publication-verification.json').write_text(json.dumps(result,indent=2))
print(json.dumps({k:result[k] for k in ['sitemap_urls','published','held','failed']}))
assert not result['failed'], 'Release verification failed'
