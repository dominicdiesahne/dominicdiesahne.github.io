/* DE/EN language switch. German is the default.
   Every translatable element carries data-de and data-en. For <meta> tags the
   "content" attribute is swapped; for everything else the text content.
   Optional data-de-label / data-en-label swap the aria-label.
   ?lang=en (or ?lang=de) in the URL forces a language. The choice is stored
   in localStorage when available. */
(function () {
  "use strict";

  var LANGS = { de: "de-AT", en: "en" };
  var STORAGE_KEY = "dm-lang";

  function readStored() {
    try { return window.localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function store(lang) {
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage blocked */ }
  }

  function fromUrl() {
    try {
      var value = new URLSearchParams(window.location.search).get("lang");
      return value ? value.toLowerCase() : null;
    } catch (e) {
      return null;
    }
  }

  function apply(lang) {
    if (!LANGS.hasOwnProperty(lang)) { lang = "de"; }
    document.documentElement.lang = LANGS[lang];

    var nodes = document.querySelectorAll("[data-de][data-en]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var text = el.getAttribute("data-" + lang);
      if (el.tagName === "META") {
        el.setAttribute("content", text);
      } else if (el.tagName === "TITLE") {
        document.title = text;
      } else {
        el.textContent = text;
      }
    }

    var labelled = document.querySelectorAll("[data-de-label][data-en-label]");
    for (var j = 0; j < labelled.length; j++) {
      labelled[j].setAttribute("aria-label", labelled[j].getAttribute("data-" + lang + "-label"));
    }

    var ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) { ogLocale.setAttribute("content", lang === "en" ? "en_GB" : "de_AT"); }
    var ogAlt = document.querySelector('meta[property="og:locale:alternate"]');
    if (ogAlt) { ogAlt.setAttribute("content", lang === "en" ? "de_AT" : "en_GB"); }

    var buttons = document.querySelectorAll(".lang-btn");
    for (var k = 0; k < buttons.length; k++) {
      buttons[k].setAttribute("aria-pressed", buttons[k].getAttribute("data-lang") === lang ? "true" : "false");
    }
  }

  function init() {
    var urlLang = fromUrl();
    var lang = LANGS.hasOwnProperty(urlLang) ? urlLang : readStored();
    if (!LANGS.hasOwnProperty(lang)) { lang = "de"; }
    if (urlLang && LANGS.hasOwnProperty(urlLang)) { store(urlLang); }
    apply(lang);

    var buttons = document.querySelectorAll(".lang-btn");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        var chosen = this.getAttribute("data-lang");
        store(chosen);
        apply(chosen);
        if (window.history && window.history.replaceState && fromUrl()) {
          try {
            var url = new URL(window.location.href);
            url.searchParams.set("lang", chosen);
            window.history.replaceState(null, "", url.toString());
          } catch (e) { /* ignore */ }
        }
      });
    }

    var printButtons = document.querySelectorAll("[data-print]");
    for (var p = 0; p < printButtons.length; p++) {
      printButtons[p].addEventListener("click", function () { window.print(); });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
