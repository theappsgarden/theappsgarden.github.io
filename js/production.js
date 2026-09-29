(function () {
  const ga4MeasurementId = 'G-VLVEJTC31G';

  if (/^G-[A-Z0-9]+$/.test(ga4MeasurementId)) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ga4MeasurementId);

    const googleTag = document.createElement('script');
    googleTag.async = true;
    googleTag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga4MeasurementId);
    document.head.appendChild(googleTag);
  }

  const chatbaseId = 'CVVQfXH2Hh60Nb_g6xZ3C';
  if (document.getElementById(chatbaseId)) return;

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

  const chatbaseEmbed = document.createElement('script');
  chatbaseEmbed.src = 'https://www.chatbase.co/embed.min.js';
  chatbaseEmbed.id = chatbaseId;
  chatbaseEmbed.domain = 'www.chatbase.co';
  document.body.appendChild(chatbaseEmbed);
})();
