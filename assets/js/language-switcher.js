(function () {
  "use strict";

  const TARGET_ID = "google_translate_element";
  const SCRIPT_ID = "google-translate-element-script";

  function initializeGoogleTranslate() {
    const target = document.getElementById(TARGET_ID);
    if (!target || !window.google || !window.google.translate) return;
    if (target.dataset.translateReady === "true") return;

    target.dataset.translateReady = "true";
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        autoDisplay: false,
        layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL
      },
      TARGET_ID
    );
  }

  window.googleTranslateElementInit = initializeGoogleTranslate;

  function loadTranslateScript() {
    if (!document.getElementById(TARGET_ID)) return;

    if (window.google && window.google.translate && window.google.translate.TranslateElement) {
      initializeGoogleTranslate();
      return;
    }

    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.defer = true;
    script.onerror = function () {
      const target = document.getElementById(TARGET_ID);
      if (target) target.textContent = "Translation service unavailable";
    };
    document.head.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadTranslateScript, { once: true });
  } else {
    loadTranslateScript();
  }
})();
