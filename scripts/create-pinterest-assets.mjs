import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
const dir = 'docs/growth/pinterest';
await mkdir(dir, { recursive: true });
const pins = [
  { id: 'cat-budget', eyebrow: 'CANADIAN PET PARENTS', title: ['Build your', 'cat budget'], sub: 'Use local quotes, not a national average.', items: ['Separate setup and monthly costs', 'Include irregular and emergency costs', 'Compare insurance with savings'], slug: 'cost-of-owning-a-cat-in-canada', caption: 'Build a cat budget using local quotes for equipment, food, litter, veterinary care and unexpected costs. Read the Canadian checklist. This guide includes Amazon affiliate links; ThePetClub.ca may earn a commission from qualifying purchases.', alt: 'Cat budget checklist: separate setup, recurring and unexpected costs and use local quotes.' },
  { id: 'indoor-enrichment', eyebrow: 'INDOOR CAT LIFE', title: ['A home your', 'cat can use'], sub: 'Start with choices, space and shared play.', items: ['Offer a quiet place to withdraw', 'Secure perches and accessible routes', 'Choose play your cat enjoys'], slug: 'indoor-cat-enrichment-canadian-homes', caption: 'Practical indoor cat enrichment for Canadian homes: hiding places, secure height, shared play and separated resources. Includes clearly disclosed examples of different toy activities. This guide includes Amazon affiliate links; ThePetClub.ca may earn a commission from qualifying purchases.', alt: 'Indoor cat enrichment checklist showing quiet hiding places, secure perches and shared play.' },
  { id: 'insurance-questions', eyebrow: 'PET INSURANCE IN CANADA', title: ['Read the policy', 'before you buy'], sub: 'Compare the wording, not just the premium.', items: ['Ask about exclusions and waiting periods', 'Check deductible, limits and reimbursement', 'Keep the provincial policy document'], slug: 'pet-insurance-in-canada', caption: 'Before buying pet insurance in Canada, compare exclusions, waiting periods, deductible, reimbursement and limits in the actual policy. General information, not a personal insurance recommendation.', alt: 'Three questions to check in a Canadian pet insurance policy before buying.' },
];
const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
for (const pin of pins) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500" viewBox="0 0 1000 1500" role="img"><title>${escape(pin.alt)}</title>
<rect width="1000" height="1500" fill="#f4f1e8"/><rect x="48" y="48" width="904" height="1404" rx="32" fill="#fcfcfa"/>
<path d="M690 48H920Q952 48 952 80V390Q835 320 690 48" fill="#e1eadd"/><circle cx="865" cy="128" r="24" fill="#315c42"/>
<text x="104" y="153" fill="#315c42" font-family="sans-serif" font-weight="700" font-size="25" letter-spacing="3">THE PET CLUB</text>
<text x="104" y="263" fill="#696960" font-family="sans-serif" font-size="22" letter-spacing="2">${escape(pin.eyebrow)}</text>
${pin.title.map((line,i)=>`<text x="104" y="${400+i*100}" fill="#202c25" font-family="Georgia,serif" font-size="80">${escape(line)}</text>`).join('')}
<path d="M104 568H230" stroke="#bc755d" stroke-width="8"/>
<text x="104" y="640" fill="#4d554d" font-family="sans-serif" font-size="28">${escape(pin.sub)}</text>
${pin.items.map((line,i)=>`<circle cx="129" cy="${785+i*125}" r="24" fill="#e1eadd"/><text x="129" y="${794+i*125}" text-anchor="middle" fill="#315c42" font-family="sans-serif" font-weight="700" font-size="25">${i+1}</text><text x="181" y="${794+i*125}" fill="#202c25" font-family="sans-serif" font-size="27">${escape(line)}</text>`).join('')}
<rect x="104" y="1200" width="792" height="105" rx="18" fill="#315c42"/><text x="500" y="1265" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="31">Read the Canadian guide</text>
<text x="104" y="1385" fill="#696960" font-family="sans-serif" font-size="24">thepetclub.ca</text><text x="896" y="1385" text-anchor="end" fill="#696960" font-family="sans-serif" font-size="19">General information</text></svg>`;
  await writeFile(`${dir}/${pin.id}.svg`, svg);
  await sharp(Buffer.from(svg)).png().toFile(`${dir}/${pin.id}.png`);
  pin.destination = `https://thepetclub.ca/guides/${pin.slug}?utm_source=pinterest&utm_medium=organic_social&utm_campaign=canadian_guides&utm_content=${pin.id}`;
  pin.status = 'prepared_not_posted';
}
await writeFile(`${dir}/pins.json`, JSON.stringify(pins, null, 2));
process.stdout.write(`Created ${pins.length} editable SVG templates and 1000×1500 PNG exports; no posts submitted.\n`);
