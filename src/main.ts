import './styles.css';

type FieldKey =
  | 'name'
  | 'title'
  | 'company'
  | 'website'
  | 'email'
  | 'phone'
  | 'linkedin'
  | 'instagram'
  | 'x'
  | 'avatar'
  | 'bio';

type FieldElements = Record<FieldKey, HTMLInputElement | HTMLTextAreaElement>;

type CardData = Record<FieldKey, string>;

const STORAGE_KEY = 'card:data';
const PLACEHOLDER_AVATAR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88"><rect width="100%" height="100%" fill="#0f1218"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#2e3440" font-family="Arial" font-size="12">Foto</text></svg>`,
  );

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element met id "${id}" ontbreekt`);
  }

  return element as T;
}

const form = requireElement<HTMLFormElement>('editForm');
const shareButton = requireElement<HTMLButtonElement>('btnShare');
const vcardButton = requireElement<HTMLButtonElement>('btnVCard');
const logoutButton = requireElement<HTMLButtonElement>('btnLogout');
const generateButton = requireElement<HTMLButtonElement>('btnGenerate');

const fieldElements: FieldElements = {
  name: requireElement<HTMLInputElement>('fieldName'),
  title: requireElement<HTMLInputElement>('fieldTitle'),
  company: requireElement<HTMLInputElement>('fieldCompany'),
  website: requireElement<HTMLInputElement>('fieldWebsite'),
  email: requireElement<HTMLInputElement>('fieldEmail'),
  phone: requireElement<HTMLInputElement>('fieldPhone'),
  linkedin: requireElement<HTMLInputElement>('fieldLinkedIn'),
  instagram: requireElement<HTMLInputElement>('fieldInstagram'),
  x: requireElement<HTMLInputElement>('fieldX'),
  avatar: requireElement<HTMLInputElement>('fieldAvatar'),
  bio: requireElement<HTMLTextAreaElement>('fieldBio'),
};

const preview = {
  name: requireElement<HTMLDivElement>('namePreview'),
  title: requireElement<HTMLDivElement>('titlePreview'),
  company: requireElement<HTMLDivElement>('companyPreview'),
  emailLink: requireElement<HTMLAnchorElement>('emailLink'),
  telLink: requireElement<HTMLAnchorElement>('telLink'),
  webLink: requireElement<HTMLAnchorElement>('webLink'),
  liLink: requireElement<HTMLAnchorElement>('liLink'),
  igLink: requireElement<HTMLAnchorElement>('igLink'),
  xLink: requireElement<HTMLAnchorElement>('xLink'),
  avatar: requireElement<HTMLImageElement>('avatarPreview'),
  tagline: requireElement<HTMLParagraphElement>('tagline'),
};

const fieldKeys: FieldKey[] = [
  'name',
  'title',
  'company',
  'website',
  'email',
  'phone',
  'linkedin',
  'instagram',
  'x',
  'avatar',
  'bio',
];

function readForm(): CardData {
  const result = {} as CardData;
  fieldKeys.forEach((key) => {
    result[key] = fieldElements[key].value.trim();
  });
  return result;
}

function writeForm(data: Partial<CardData>) {
  fieldKeys.forEach((key) => {
    if (typeof data[key] === 'string') {
      fieldElements[key].value = data[key] ?? '';
    }
  });
}

function save(data: CardData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Kon data niet opslaan in localStorage', error);
  }
}

function load(): Partial<CardData> | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as CardData;
  } catch (error) {
    console.warn('Kon data niet laden uit localStorage', error);
    return undefined;
  }
}

function withProtocol(url: string): string {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `https://${url}`;
}

function updatePreview() {
  const data = readForm();
  const d = data;

  preview.name.textContent = d.name || 'Jouw Naam';
  preview.title.textContent = d.title || 'Functie';
  preview.company.textContent = d.company || 'Bedrijf';

  preview.emailLink.href = d.email ? `mailto:${d.email}` : '#';
  preview.emailLink.ariaDisabled = d.email ? 'false' : 'true';

  preview.telLink.href = d.phone ? `tel:${d.phone}` : '#';
  preview.telLink.ariaDisabled = d.phone ? 'false' : 'true';

  preview.webLink.href = d.website || '#';
  preview.webLink.ariaDisabled = d.website ? 'false' : 'true';

  if (d.website) {
    const safeWebsite = withProtocol(d.website);
    preview.webLink.href = safeWebsite || '#';
    preview.webLink.target = '_blank';
    preview.webLink.rel = 'noreferrer';
  } else {
    preview.webLink.target = '_self';
    preview.webLink.rel = '';
  }

  const linkedin = withProtocol(d.linkedin);
  preview.liLink.href = linkedin || '#';
  preview.liLink.ariaDisabled = linkedin ? 'false' : 'true';
  preview.liLink.target = linkedin ? '_blank' : '_self';
  preview.liLink.rel = linkedin ? 'noreferrer' : '';

  const instagram = withProtocol(d.instagram);
  preview.igLink.href = instagram || '#';
  preview.igLink.ariaDisabled = instagram ? 'false' : 'true';
  preview.igLink.target = instagram ? '_blank' : '_self';
  preview.igLink.rel = instagram ? 'noreferrer' : '';

  const x = withProtocol(d.x);
  preview.xLink.href = x || '#';
  preview.xLink.ariaDisabled = x ? 'false' : 'true';
  preview.xLink.target = x ? '_blank' : '_self';
  preview.xLink.rel = x ? 'noreferrer' : '';

  const avatar = withProtocol(d.avatar);
  preview.avatar.src = avatar || PLACEHOLDER_AVATAR;
  preview.tagline.textContent = d.bio || '';

  save(data);
}

function handleInput() {
  updatePreview();
}

function handleVCardDownload(event: Event) {
  event.preventDefault();
  const data = readForm();
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    data.name ? `FN:${data.name}` : '',
    data.company ? `ORG:${data.company}` : '',
    data.title ? `TITLE:${data.title}` : '',
    data.email ? `EMAIL;TYPE=INTERNET:${data.email}` : '',
    data.phone ? `TEL;TYPE=CELL:${data.phone}` : '',
    data.website ? `URL:${withProtocol(data.website)}` : '',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\n');

  const blob = new Blob([vcard], { type: 'text/vcard' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'visitekaart.vcf';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function handleShare() {
  const data = readForm();
  const url = window.location.href.split('#')[0];
  const textParts = [data.name, data.title && `— ${data.title}`, data.company && `@ ${data.company}`]
    .filter(Boolean)
    .join(' ');

  try {
    if (navigator.share) {
      await navigator.share({ title: document.title, text: textParts || document.title, url });
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      window.alert('Link gekopieerd naar klembord');
    } else {
      window.prompt('Kopieer de link naar je kaart:', url);
    }
  } catch (error) {
    console.warn('Delen geannuleerd of mislukt', error);
  }
}

function handleLogout() {
  try {
    localStorage.removeItem('user:email');
  } catch (error) {
    console.warn('Kon user:email niet verwijderen', error);
  }
  window.location.href = './index.html';
}

async function handleGenerate() {
  const data = readForm();
  generateButton.disabled = true;
  generateButton.textContent = 'Bezig...';

  try {
    const response = await fetch('./api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        title: data.title,
        company: data.company,
        website: data.website,
        tone: 'vriendelijk, beknopt',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ongeldig antwoord (${response.status})`);
    }

    const payload = (await response.json()) as { text?: string; output?: string };
    const text = (payload.text || payload.output || '').trim();

    if (!text) {
      throw new Error('Geen tekst ontvangen van AI');
    }

    fieldElements.bio.value = text;
    updatePreview();
  } catch (error) {
    console.error('Kon geen tagline genereren', error);
    window.alert('Kon geen tagline genereren. Controleer het /api/generate-endpoint.');
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = 'Genereer tagline met AI';
  }
}

function init() {
  const stored = load();
  if (stored) {
    writeForm(stored);
  }
  updatePreview();

  form.addEventListener('input', handleInput);
  vcardButton.addEventListener('click', handleVCardDownload);
  shareButton.addEventListener('click', handleShare);
  logoutButton.addEventListener('click', handleLogout);
  generateButton.addEventListener('click', handleGenerate);
}

init();
