(function () {
  'use strict';

  const ga4MeasurementId = 'G-VLVEJTC31G';
  const chatbaseId = 'CVVQfXH2Hh60Nb_g6xZ3C';
  const consentKey = 'tag-cookie-consent-v1';
  const consentLifetime = 180 * 24 * 60 * 60 * 1000;
  const language = document.documentElement.lang.split('-')[0];
  const copy = {
    es: {
      title: 'Tú decides sobre las cookies',
      intro: 'Google Analytics mide las visitas y Chatbase ofrece el asistente de chat. Son opcionales: no cargamos ninguno hasta que lo aceptes. Puedes seguir navegando si los rechazas.',
      accept: 'Aceptar todo', reject: 'Rechazar todo', customize: 'Configurar', save: 'Guardar preferencias', close: 'Cerrar sin cambiar', settings: 'Preferencias de cookies',
      necessary: 'Necesarias · siempre activas',
      necessaryText: 'Guardamos tu elección en este navegador durante 180 días (almacenamiento local: tag-cookie-consent-v1). No se usa para publicidad ni analítica. Si el navegador bloquea el almacenamiento, la elección solo se aplica a esta página.',
      analytics: 'Analítica · Google Analytics',
      analyticsText: 'Permite a Google recibir información de navegación, dispositivo e interacciones para medir el uso de la web. Usa cookies como _ga y _ga_VLVEJTC31G; configuramos su duración en 180 días. No es necesario para contactar por email.',
      chat: 'Asistente · Chatbase',
      chatText: 'Carga un servicio externo de Chatbase y permite su almacenamiento de sesión y conversación. Al usarlo, el proveedor recibe tus mensajes y datos técnicos. No compartas información sensible. Rechazarlo no impide contactar por email.',
      providers: 'Estos proveedores pueden tratar datos fuera del Espacio Económico Europeo. Consulta sus políticas para conocer sus tratamientos, conservación y transferencias:',
      google: 'Privacidad de Google', chatbase: 'Privacidad de Chatbase',
      withdrawal: 'Puedes retirar el consentimiento desde «Preferencias de cookies». Al desactivar un servicio recargamos la página y eliminamos sus cookies y almacenamiento accesibles desde esta web. No podemos borrar desde aquí datos ya enviados ni almacenamiento de otros dominios.',
      contact: 'Contacto: team@theappsgarden.com',
      unavailable: 'No hemos podido guardar tu elección en este navegador. Se aplicará solo a esta página.'
    },
    en: {
      title: 'Your cookie choices',
      intro: 'Google Analytics measures visits and Chatbase provides the chat assistant. Both are optional: neither loads until you accept it. You can continue browsing if you reject them.',
      accept: 'Accept all', reject: 'Reject all', customize: 'Customize', save: 'Save preferences', close: 'Close without changes', settings: 'Cookie preferences',
      necessary: 'Necessary · always active',
      necessaryText: 'We remember your choice in this browser for 180 days (local storage: tag-cookie-consent-v1). It is not used for advertising or analytics. If your browser blocks storage, your choice applies only to this page.',
      analytics: 'Analytics · Google Analytics',
      analyticsText: 'Allows Google to receive browsing, device and interaction information to measure website use. Uses cookies such as _ga and _ga_VLVEJTC31G; we configure a 180-day lifetime. It is not needed to contact us by email.',
      chat: 'Assistant · Chatbase',
      chatText: 'Loads an external Chatbase service and allows its session and conversation storage. When you use it, the provider receives your messages and technical data. Do not share sensitive information. Rejecting it does not prevent email enquiries.',
      providers: 'These providers may process data outside the European Economic Area. See their policies for processing, retention and international transfers:',
      google: 'Google privacy', chatbase: 'Chatbase privacy',
      withdrawal: 'You can withdraw consent using “Cookie preferences”. Disabling a service reloads the page and removes its cookies and storage accessible from this website. We cannot delete data already sent or storage on other domains from here.',
      contact: 'Contact: team@theappsgarden.com',
      unavailable: 'We could not save your choice in this browser. It will apply only to this page.'
    },
    ca: {
      title: 'Tu decideixes sobre les galetes',
      intro: 'Google Analytics mesura les visites i Chatbase ofereix l’assistent de xat. Són opcionals: no en carreguem cap fins que ho acceptis. Pots continuar navegant si els rebutges.',
      accept: 'Acceptar-ho tot', reject: 'Rebutjar-ho tot', customize: 'Configurar', save: 'Desar preferències', close: 'Tancar sense canvis', settings: 'Preferències de galetes',
      necessary: 'Necessàries · sempre actives',
      necessaryText: 'Desem la teva elecció en aquest navegador durant 180 dies (emmagatzematge local: tag-cookie-consent-v1). No es fa servir per a publicitat ni analítica. Si el navegador bloqueja l’emmagatzematge, l’elecció només s’aplica a aquesta pàgina.',
      analytics: 'Analítica · Google Analytics',
      analyticsText: 'Permet a Google rebre informació de navegació, dispositiu i interaccions per mesurar l’ús de la web. Utilitza galetes com _ga i _ga_VLVEJTC31G; en configurem la durada a 180 dies. No cal per contactar per correu.',
      chat: 'Assistent · Chatbase',
      chatText: 'Carrega un servei extern de Chatbase i permet el seu emmagatzematge de sessió i conversa. En fer-lo servir, el proveïdor rep els teus missatges i dades tècniques. No comparteixis informació sensible. Rebutjar-lo no impedeix contactar per correu.',
      providers: 'Aquests proveïdors poden tractar dades fora de l’Espai Econòmic Europeu. Consulta les seves polítiques per conèixer els tractaments, la conservació i les transferències:',
      google: 'Privacitat de Google', chatbase: 'Privacitat de Chatbase',
      withdrawal: 'Pots retirar el consentiment des de «Preferències de galetes». En desactivar un servei recarreguem la pàgina i eliminem les seves galetes i l’emmagatzematge accessibles des d’aquesta web. No podem esborrar des d’aquí dades ja enviades ni l’emmagatzematge d’altres dominis.',
      contact: 'Contacte: team@theappsgarden.com',
      unavailable: 'No hem pogut desar l’elecció en aquest navegador. Només s’aplicarà a aquesta pàgina.'
    }
  }[language] || null;
  if (!copy) return; // Unknown language: fail closed, never load optional services.

  function readConsent() {
    try {
      const value = JSON.parse(localStorage.getItem(consentKey));
      if (value && value.version === 1 && typeof value.analytics === 'boolean' &&
          typeof value.chat === 'boolean' && Number.isFinite(value.savedAt) &&
          value.savedAt <= Date.now() && Date.now() - value.savedAt < consentLifetime) return value;
    } catch (_) { /* Missing, corrupt or inaccessible storage means no consent. */ }
    return null;
  }

  let consent = readConsent();
  const active = { analytics: false, chat: false };

  function loadAllowedServices(value) {
    if (!value) return;
    if (value.analytics && !active.analytics) {
      active.analytics = true;
      window['ga-disable-' + ga4MeasurementId] = false;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', ga4MeasurementId, { cookie_expires: 15552000, cookie_update: false });
      const googleTag = document.createElement('script');
      googleTag.async = true;
      googleTag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga4MeasurementId);
      document.head.appendChild(googleTag);
    }
    if (value.chat && !active.chat) {
      active.chat = true;
      if (!window.chatbase || window.chatbase('getState') !== 'initialized') {
        window.chatbase = (...args) => {
          if (!window.chatbase.q) window.chatbase.q = [];
          window.chatbase.q.push(args);
        };
        window.chatbase = new Proxy(window.chatbase, {
          get(target, property) {
            if (property === 'q') return target.q;
            return (...args) => target(property, ...args);
          }
        });
      }
      const embed = document.createElement('script');
      embed.src = 'https://www.chatbase.co/embed.min.js';
      embed.id = chatbaseId;
      embed.domain = 'www.chatbase.co';
      document.body.appendChild(embed);
    }
  }

  function isServiceStorage(name, service) {
    return service === 'analytics' ? /^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name) : /^(?:chatbase|cb_chat)/i.test(name);
  }

  function clearServiceStorage(service) {
    if (service === 'analytics') window['ga-disable-' + ga4MeasurementId] = true;
    // Only remove these providers' readable storage; never clear unrelated site data.
    const paths = ['/'];
    const segments = location.pathname.split('/').filter(Boolean);
    let path = '';
    segments.forEach(segment => { path += '/' + segment; paths.push(path, path + '/'); });
    const hostParts = location.hostname.split('.');
    const domains = [''];
    for (let i = 0; i < hostParts.length - 1; i++) {
      const domain = hostParts.slice(i).join('.');
      domains.push('; domain=' + domain, '; domain=.' + domain);
    }
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (!isServiceStorage(name, service)) return;
      paths.forEach(p => domains.forEach(domain => {
        document.cookie = name + '=; Max-Age=0; path=' + p + domain;
      }));
    });
    ['localStorage', 'sessionStorage'].forEach(type => {
      try {
        const storage = window[type];
        Object.keys(storage).forEach(key => {
          if (isServiceStorage(key, service)) storage.removeItem(key);
        });
      } catch (_) { /* Storage may be unavailable. */ }
    });
  }

  // Clean readable leftovers from an expired or withdrawn choice, without any vendor request.
  if (!consent || !consent.analytics) clearServiceStorage('analytics');
  if (!consent || !consent.chat) clearServiceStorage('chat');

  function element(tag, text, parent) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (parent) parent.appendChild(node);
    return node;
  }
  function button(text, parent, callback) {
    const node = element('button', text, parent);
    node.type = 'button';
    node.className = 'btn btn--outline';
    node.addEventListener('click', callback);
    return node;
  }

  const opener = button(copy.settings, document.body, () => openPreferences(true));
  opener.className = 'cookie-preferences';
  opener.setAttribute('aria-haspopup', 'dialog');
  const dialog = element('dialog', '', document.body);
  dialog.className = 'cookie-consent';
  dialog.setAttribute('aria-labelledby', 'cookie-consent-title');
  dialog.setAttribute('aria-describedby', 'cookie-consent-intro');
  element('h2', copy.title, dialog).id = 'cookie-consent-title';
  element('p', copy.intro, dialog).id = 'cookie-consent-intro';
  const actions = element('div', '', dialog);
  actions.className = 'cookie-actions';
  button(copy.accept, actions, () => saveConsent(true, true));
  button(copy.reject, actions, () => saveConsent(false, false));
  const configure = button(copy.customize, actions, () => {
    options.hidden = false;
    analytics.focus();
  });
  configure.setAttribute('aria-controls', 'cookie-consent-options');
  configure.setAttribute('aria-expanded', 'false');
  configure.addEventListener('click', () => configure.setAttribute('aria-expanded', 'true'));
  const options = element('div', '', dialog);
  options.id = 'cookie-consent-options';
  options.hidden = true;
  element('h3', copy.necessary, options);
  element('p', copy.necessaryText, options);
  function choice(name, description) {
    const label = element('label', '', options);
    label.className = 'cookie-choice';
    const input = element('input', '', label);
    input.type = 'checkbox';
    element('span', name, label);
    const info = element('p', description, options);
    info.id = 'cookie-choice-' + (options.querySelectorAll('input').length);
    input.setAttribute('aria-describedby', info.id);
    return input;
  }
  const analytics = choice(copy.analytics, copy.analyticsText);
  const chat = choice(copy.chat, copy.chatText);
  element('p', copy.providers, options);
  [[copy.google, 'https://policies.google.com/privacy'], [copy.chatbase, 'https://www.chatbase.co/privacy']].forEach(([text, url]) => {
    const link = element('a', text, options);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'cookie-provider-link';
  });
  element('p', copy.withdrawal, options);
  const contact = element('a', copy.contact, options);
  contact.href = 'mailto:team@theappsgarden.com';
  const save = button(copy.save, options, () => saveConsent(analytics.checked, chat.checked));
  save.className = 'btn btn--outline cookie-save';
  const status = element('p', '', dialog);
  status.setAttribute('role', 'status');
  button(copy.close, dialog, () => dialog.close());
  dialog.addEventListener('close', () => opener.focus());

  function openPreferences(expanded) {
    analytics.checked = !!(consent && consent.analytics);
    chat.checked = !!(consent && consent.chat);
    options.hidden = !expanded;
    configure.setAttribute('aria-expanded', String(expanded));
    if (!dialog.open) dialog.showModal();
  }

  function saveConsent(allowAnalytics, allowChat) {
    const reload = (active.analytics && !allowAnalytics) || (active.chat && !allowChat);
    const value = { version: 1, analytics: allowAnalytics, chat: allowChat, savedAt: Date.now() };
    let persisted = false;
    try {
      localStorage.setItem(consentKey, JSON.stringify(value));
      persisted = true;
    } catch (_) { /* Apply only to this page if storage is blocked. */ }
    consent = value;
    if (!allowAnalytics) clearServiceStorage('analytics');
    if (!allowChat) clearServiceStorage('chat');
    // Reload unloads all previously accepted scripts and their frames/listeners.
    // A failed write also fails closed on reload (the old grant is removed if possible).
    if (reload) {
      if (!persisted) {
        try { localStorage.removeItem(consentKey); } catch (_) { /* Read also fails closed. */ }
      }
      location.reload();
      return;
    }
    loadAllowedServices(value);
    if (persisted) dialog.close();
    else status.textContent = copy.unavailable;
  }

  // Other tabs must stop using a service when this browser's preference changes.
  window.addEventListener('storage', event => {
    if (event.key !== consentKey && event.key !== null) return;
    const updated = readConsent();
    if ((active.analytics && !(updated && updated.analytics)) || (active.chat && !(updated && updated.chat))) {
      location.reload();
      return;
    }
    consent = updated;
    if (!updated) openPreferences(false);
    else if (!dialog.open) loadAllowedServices(updated);
  });

  loadAllowedServices(consent);
  if (!consent) openPreferences(false);
})();
