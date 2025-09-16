const STORAGE_KEY_USER = 'user:email';
const STORAGE_KEY_CARD = 'card:data';
const PLACEHOLDER_AVATAR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="100%" height="100%" fill="#0f1218"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#2e3440" font-family="Arial" font-size="12">Foto</text></svg>`,
  );

function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function initAuthPage() {
  if (localStorage.getItem(STORAGE_KEY_USER)) {
    window.location.replace('./dashboard.html');
    return;
  }

  function switchTab(activeId) {
    const tabs = [
      { tab: document.getElementById('tabLogin'), panel: document.getElementById('panelLogin') },
      { tab: document.getElementById('tabRegister'), panel: document.getElementById('panelRegister') },
    ];

    tabs.forEach(({ tab, panel }) => {
      if (!tab || !panel) return;
      const isActive = tab.id === activeId;
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      panel.hidden = !isActive;
    });

    const activeTab = document.getElementById(activeId);
    if (activeTab instanceof HTMLElement) {
      activeTab.focus();
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const emailInput = form.querySelector('input[type="email"]');
    if (!(emailInput instanceof HTMLInputElement)) {
      return;
    }

    const email = emailInput.value.trim();
    if (!email) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY_USER, email);
      window.location.href = './dashboard.html';
    } catch (error) {
      const status = document.getElementById('statusMessage');
      if (status) {
        status.textContent = 'Kon gegevens niet opslaan. Controleer je browserinstellingen.';
      }
      console.error('Kon user:email niet instellen', error);
    }
  }

  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  tabLogin?.addEventListener('click', () => switchTab('tabLogin'));
  tabRegister?.addEventListener('click', () => switchTab('tabRegister'));
  loginForm?.addEventListener('submit', handleSubmit);
  registerForm?.addEventListener('submit', handleSubmit);
}

function initDashboardPage() {
  if (!localStorage.getItem(STORAGE_KEY_USER)) {
    window.location.replace('./index.html');
    return;
  }

  const form = document.getElementById('editForm');
  const shareButton = document.getElementById('btnShare');
  const vcardButton = document.getElementById('btnVCard');
  const logoutButton = document.getElementById('btnLogout');
  const generateButton = document.getElementById('btnGenerate');

  if (
    !(form instanceof HTMLFormElement) ||
    !(shareButton instanceof HTMLButtonElement) ||
    !(vcardButton instanceof HTMLButtonElement) ||
    !(logoutButton instanceof HTMLButtonElement) ||
    !(generateButton instanceof HTMLButtonElement)
  ) {
    return;
  }

  const fieldElementsRaw = {
    name: document.getElementById('fieldName'),
    title: document.getElementById('fieldTitle'),
    company: document.getElementById('fieldCompany'),
    website: document.getElementById('fieldWebsite'),
    email: document.getElementById('fieldEmail'),
    phone: document.getElementById('fieldPhone'),
    linkedin: document.getElementById('fieldLinkedIn'),
    instagram: document.getElementById('fieldInstagram'),
    x: document.getElementById('fieldX'),
    avatar: document.getElementById('fieldAvatar'),
    bio: document.getElementById('fieldBio'),
  };

  const fieldElements = {};
  for (const [key, value] of Object.entries(fieldElementsRaw)) {
    if (value instanceof HTMLInputElement || value instanceof HTMLTextAreaElement) {
      fieldElements[key] = value;
    } else {
      console.warn(`Formulierelement met id "${key}" ontbreekt.`);
      return;
    }
  }

  const previewRaw = {
    name: document.getElementById('namePreview'),
    title: document.getElementById('titlePreview'),
    company: document.getElementById('companyPreview'),
    emailLink: document.getElementById('emailLink'),
    telLink: document.getElementById('telLink'),
    webLink: document.getElementById('webLink'),
    liLink: document.getElementById('liLink'),
    igLink: document.getElementById('igLink'),
    xLink: document.getElementById('xLink'),
    avatar: document.getElementById('avatarPreview'),
    tagline: document.getElementById('tagline'),
  };

  const preview = {};
  for (const [key, value] of Object.entries(previewRaw)) {
    if (value instanceof HTMLElement) {
      preview[key] = value;
    } else {
      console.warn(`Element met id "${key}" ontbreekt.`);
      return;
    }
  }

  const fieldKeys = [
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

  function readForm() {
    const result = {};
    fieldKeys.forEach((key) => {
      const element = fieldElements[key];
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        result[key] = element.value.trim();
      }
    });
    return result;
  }

  function writeForm(data) {
    fieldKeys.forEach((key) => {
      const element = fieldElements[key];
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        if (typeof data[key] === 'string') {
          element.value = data[key] ?? '';
        }
      }
    });
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY_CARD, JSON.stringify(data));
    } catch (error) {
      console.warn('Kon data niet opslaan in localStorage', error);
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CARD);
      if (!raw) return undefined;
      return JSON.parse(raw);
    } catch (error) {
      console.warn('Kon data niet laden uit localStorage', error);
      return undefined;
    }
  }

  function withProtocol(url) {
    if (!url) return '';
    if (/^(https?:|data:|blob:)/i.test(url)) return url;
    return `https://${url}`;
  }

  function updatePreview() {
    const data = readForm();
    const name = preview.name;
    const title = preview.title;
    const company = preview.company;
    const emailLink = preview.emailLink;
    const telLink = preview.telLink;
    const webLink = preview.webLink;
    const liLink = preview.liLink;
    const igLink = preview.igLink;
    const xLink = preview.xLink;
    const avatar = preview.avatar;
    const tagline = preview.tagline;

    if (name) {
      name.textContent = data.name || 'Jouw Naam';
    }
    if (title) {
      title.textContent = data.title || 'Functie';
    }
    if (company) {
      company.textContent = data.company || 'Bedrijf';
    }

    if (emailLink instanceof HTMLAnchorElement) {
      if (data.email) {
        emailLink.href = `mailto:${data.email}`;
        emailLink.textContent = 'E-mail';
        emailLink.ariaDisabled = 'false';
      } else {
        emailLink.href = '#';
        emailLink.textContent = 'E-mail';
        emailLink.ariaDisabled = 'true';
      }
    }

    if (telLink instanceof HTMLAnchorElement) {
      if (data.phone) {
        telLink.href = `tel:${data.phone}`;
        telLink.textContent = 'Telefoon';
        telLink.ariaDisabled = 'false';
      } else {
        telLink.href = '#';
        telLink.textContent = 'Telefoon';
        telLink.ariaDisabled = 'true';
      }
    }

    if (webLink instanceof HTMLAnchorElement) {
      if (data.website) {
        const safeWebsite = withProtocol(data.website);
        webLink.href = safeWebsite || '#';
        webLink.textContent = 'Website';
        webLink.target = '_blank';
        webLink.rel = 'noreferrer';
        webLink.ariaDisabled = 'false';
      } else {
        webLink.href = '#';
        webLink.textContent = 'Website';
        webLink.target = '_self';
        webLink.rel = '';
        webLink.ariaDisabled = 'true';
      }
    }

    if (liLink instanceof HTMLAnchorElement) {
      const linkedin = withProtocol(data.linkedin);
      liLink.href = linkedin || '#';
      liLink.ariaDisabled = linkedin ? 'false' : 'true';
      liLink.target = linkedin ? '_blank' : '_self';
      liLink.rel = linkedin ? 'noreferrer' : '';
    }

    if (igLink instanceof HTMLAnchorElement) {
      const instagram = withProtocol(data.instagram);
      igLink.href = instagram || '#';
      igLink.ariaDisabled = instagram ? 'false' : 'true';
      igLink.target = instagram ? '_blank' : '_self';
      igLink.rel = instagram ? 'noreferrer' : '';
    }

    if (xLink instanceof HTMLAnchorElement) {
      const x = withProtocol(data.x);
      xLink.href = x || '#';
      xLink.ariaDisabled = x ? 'false' : 'true';
      xLink.target = x ? '_blank' : '_self';
      xLink.rel = x ? 'noreferrer' : '';
    }

    if (avatar instanceof HTMLImageElement) {
      const src = withProtocol(data.avatar);
      avatar.src = src || PLACEHOLDER_AVATAR;
    }

    if (tagline) {
      tagline.textContent = data.bio || '';
    }

    save(data);
  }

  function handleInput() {
    updatePreview();
  }

  function handleVCardDownload(event) {
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
      localStorage.removeItem(STORAGE_KEY_USER);
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

      const payload = await response.json();
      const text = (payload?.text || payload?.output || '').trim();

      if (!text) {
        throw new Error('Geen tekst ontvangen van AI');
      }

      const bioField = fieldElements.bio;
      if (bioField instanceof HTMLTextAreaElement) {
        bioField.value = text;
      }

      updatePreview();
    } catch (error) {
      console.error('Kon geen tagline genereren', error);
      window.alert('Kon geen tagline genereren. Controleer het /api/generate-endpoint.');
    } finally {
      generateButton.disabled = false;
      generateButton.textContent = 'Genereer tagline met AI';
    }
  }

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

function initCardPage() {
  const cardView = document.getElementById('cardView');
  const emptyState = document.getElementById('emptyState');
  const vcardBtn = document.getElementById('vcardBtn');
  const shareBtn = document.getElementById('shareBtn');

  if (!cardView || !emptyState || !(vcardBtn instanceof HTMLButtonElement) || !(shareBtn instanceof HTMLButtonElement)) {
    return;
  }

  function withProtocol(url) {
    if (!url) return '';
    if (/^(https?:|data:|blob:)/i.test(url)) return url;
    return `https://${url}`;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CARD);
      if (!raw) return undefined;
      return JSON.parse(raw);
    } catch (error) {
      console.warn('Kon kaartdata niet laden', error);
      return undefined;
    }
  }

  function setTextContent(element, value) {
    if (!element) return;
    if (value) {
      element.textContent = value;
      element.hidden = false;
    } else {
      element.textContent = '';
      element.hidden = true;
    }
  }

  function handleVCard(data) {
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

  async function handleShare(data) {
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

  function renderCard(data) {
    emptyState.hidden = true;
    cardView.hidden = false;
    vcardBtn.removeAttribute('disabled');
    shareBtn.removeAttribute('disabled');

    const avatar = document.getElementById('cardAvatar');
    if (avatar instanceof HTMLImageElement) {
      avatar.src = withProtocol(data.avatar) || PLACEHOLDER_AVATAR;
    }

    setTextContent(document.getElementById('cardName'), data.name || '');
    setTextContent(document.getElementById('cardTitle'), data.title || '');
    setTextContent(document.getElementById('cardCompany'), data.company || '');
    setTextContent(document.getElementById('cardTagline'), data.bio || '');

    const emailLink = document.getElementById('cardEmail');
    if (emailLink instanceof HTMLAnchorElement) {
      if (data.email) {
        emailLink.href = `mailto:${data.email}`;
        emailLink.textContent = data.email;
        emailLink.hidden = false;
      } else {
        emailLink.removeAttribute('href');
        emailLink.hidden = true;
      }
    }

    const telLink = document.getElementById('cardPhone');
    if (telLink instanceof HTMLAnchorElement) {
      if (data.phone) {
        telLink.href = `tel:${data.phone}`;
        telLink.textContent = data.phone;
        telLink.hidden = false;
      } else {
        telLink.removeAttribute('href');
        telLink.hidden = true;
      }
    }

    const webLink = document.getElementById('cardWebsite');
    if (webLink instanceof HTMLAnchorElement) {
      if (data.website) {
        const safeWebsite = withProtocol(data.website);
        webLink.href = safeWebsite;
        webLink.textContent = data.website;
        webLink.target = '_blank';
        webLink.rel = 'noreferrer';
        webLink.hidden = false;
      } else {
        webLink.removeAttribute('href');
        webLink.textContent = '';
        webLink.target = '_self';
        webLink.rel = '';
        webLink.hidden = true;
      }
    }

    const linkedInLink = document.getElementById('cardLinkedIn');
    if (linkedInLink instanceof HTMLAnchorElement) {
      if (data.linkedin) {
        linkedInLink.href = withProtocol(data.linkedin);
        linkedInLink.hidden = false;
      } else {
        linkedInLink.removeAttribute('href');
        linkedInLink.hidden = true;
      }
    }

    const instagramLink = document.getElementById('cardInstagram');
    if (instagramLink instanceof HTMLAnchorElement) {
      if (data.instagram) {
        instagramLink.href = withProtocol(data.instagram);
        instagramLink.hidden = false;
      } else {
        instagramLink.removeAttribute('href');
        instagramLink.hidden = true;
      }
    }

    const xLink = document.getElementById('cardX');
    if (xLink instanceof HTMLAnchorElement) {
      if (data.x) {
        xLink.href = withProtocol(data.x);
        xLink.hidden = false;
      } else {
        xLink.removeAttribute('href');
        xLink.hidden = true;
      }
    }

    vcardBtn.onclick = () => handleVCard(data);
    shareBtn.onclick = () => handleShare(data);
  }

  function renderEmpty() {
    cardView.hidden = true;
    emptyState.hidden = false;
    vcardBtn.setAttribute('disabled', 'true');
    shareBtn.setAttribute('disabled', 'true');
    vcardBtn.onclick = null;
    shareBtn.onclick = null;
  }

  const data = load();
  if (data) {
    renderCard(data);
  } else {
    renderEmpty();
  }
}

ready(() => {
  const page = document.body?.dataset.page;
  if (!page) {
    return;
  }

  if (page === 'auth') {
    initAuthPage();
  } else if (page === 'dashboard') {
    initDashboardPage();
  } else if (page === 'card') {
    initCardPage();
  }
});
