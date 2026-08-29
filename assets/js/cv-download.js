(function () {
  "use strict";

  /*
   * Dynamic, multilingual CV generator.
   *
   * The PDF is rendered from the CURRENT visible/translatable DOM. This means
   * the downloaded CV follows the language selected by the visitor. Rendering
   * through the browser (html2canvas/html2pdf) also preserves CJK, Arabic,
   * Urdu, and other scripts without jsPDF font-encoding corruption.
   *
   * Website publication thumbnails are deliberately excluded from the PDF.
   * The profile photo and reference photos are retained.
   */

  const HTML2PDF_URL = "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";
  const PDF_FILENAME = "Muhammad_Sher_Afgan_CV.pdf";
  const RTL_LANGS = new Set(["ar", "fa", "he", "iw", "ur", "ps", "sd", "yi", "ug", "ckb"]);
  let libraryPromise = null;
  let generating = false;

  function setStatus(message) {
    const status = document.getElementById("cv-download-status");
    if (status) status.textContent = message || "";
  }

  function loadHtml2Pdf() {
    if (window.html2pdf) return Promise.resolve(window.html2pdf);
    if (libraryPromise) return libraryPromise;

    libraryPromise = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = HTML2PDF_URL;
      script.async = true;
      script.onload = function () {
        if (window.html2pdf) resolve(window.html2pdf);
        else reject(new Error("html2pdf loaded but was not initialized."));
      };
      script.onerror = function () {
        reject(new Error("Unable to load the PDF generator."));
      };
      document.head.appendChild(script);
    });

    return libraryPromise;
  }

  function cleanText(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\s*\n\s*/g, " ")
      .trim();
  }

  function currentLanguageCode() {
    const combo = document.querySelector(".goog-te-combo");
    const raw = combo && combo.value ? combo.value : (document.documentElement.lang || "en");
    return String(raw || "en").toLowerCase();
  }

  function isRtlLanguage(code) {
    const base = String(code || "").toLowerCase().split("-")[0];
    return RTL_LANGS.has(base);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function abbreviateLatinName(name) {
    const value = cleanText(name).replace(/[.;]+$/, "");
    if (!value) return "";

    /* Keep translated/non-Latin names intact. */
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿĀ-ž'’\-.\s]+$/.test(value)) return value;

    const parts = value.replace(/\./g, "").split(/\s+/).filter(Boolean);
    if (parts.length < 2) return value;

    const surname = parts.pop();
    const initials = parts.map(function (part) {
      const match = part.match(/[A-Za-zÀ-ÖØ-öø-ÿĀ-ž]/);
      return match ? match[0].toUpperCase() + "." : part;
    }).join(" ");

    return cleanText(initials + " " + surname);
  }

  function abbreviateAuthorList(rawAuthors) {
    const authors = cleanText(rawAuthors).replace(/[.;]+$/, "").split(",");
    return authors.map(function (author) {
      return abbreviateLatinName(author);
    }).filter(Boolean);
  }

  function authorListHtml(rawAuthors) {
    return abbreviateAuthorList(rawAuthors).map(function (author) {
      const escaped = escapeHtml(author);
      if (author === "M. S. Afgan" || /Muhammad\s+Sher\s+Afgan/i.test(author)) {
        return "<strong>" + escaped + "</strong>";
      }
      return escaped;
    }).join(", ");
  }

  function absoluteImageSources(root) {
    root.querySelectorAll("img").forEach(function (image) {
      const source = image.getAttribute("src") || image.src;
      if (!source) return;
      try {
        image.src = new URL(source, window.location.href).href;
      } catch (error) {
        // Leave the source unchanged if the browser cannot normalize it.
      }
      image.loading = "eager";
      image.decoding = "sync";
      image.removeAttribute("srcset");
      image.removeAttribute("sizes");
    });
  }

  function waitForImage(image) {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    return new Promise(function (resolve) {
      const done = function () { resolve(); };
      image.addEventListener("load", done, { once: true });
      image.addEventListener("error", done, { once: true });
      window.setTimeout(done, 5000);
    });
  }

  async function waitForAssets(root) {
    absoluteImageSources(root);
    const images = Array.from(root.querySelectorAll("img"));
    await Promise.all(images.map(waitForImage));
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (error) { /* ignore */ }
    }
    await new Promise(function (resolve) {
      requestAnimationFrame(function () { requestAnimationFrame(resolve); });
    });
  }

  function firstAuthorDesktopText(index) {
    const items = Array.from(document.querySelectorAll('.author__urls li.author__desktop'));
    return items[index] ? cleanText(items[index].textContent) : "";
  }

  function findAuthorLink(selector, hrefPattern) {
    const links = Array.from(document.querySelectorAll(selector));
    return links.find(function (link) {
      const href = String(link.getAttribute("href") || link.href || "");
      return hrefPattern.test(href);
    }) || null;
  }

  function createTranslatedHeader() {
    const header = document.createElement("header");
    header.className = "pdf-export-header";

    const visiblePhoto = document.querySelector(".author__avatar img");
    const visibleBio = document.querySelector(".author__bio");
    const emailLink = document.querySelector('.author__urls a[href^="mailto:"]');
    const githubLink = findAuthorLink('.author__urls a[href]', /github\.com\/MSAfganUSTC\/?/i);
    const scholarLink = findAuthorLink('.author__urls a[href]', /scholar\.google\./i);

    const photoSrc = visiblePhoto ? (visiblePhoto.currentSrc || visiblePhoto.src) : "/images/profile.png";
    /* Keep the scholar's personal name canonical across translated versions. */
    const name = "Muhammad Sher Afgan";
    const bio = visibleBio ? cleanText(visibleBio.textContent) : "Computer Vision & Generative AI Researcher | Machine Learning & Deep Learning";
    const email = emailLink ? String(emailLink.getAttribute("href") || "").replace(/^mailto:/i, "") : "msafgan@mail.ustc.edu.cn";
    const githubUrl = githubLink ? githubLink.href : "https://github.com/MSAfganUSTC";
    const scholarUrl = scholarLink ? scholarLink.href : "https://scholar.google.com.pk/citations?hl=en&user=EYOfbFOZuxcC";
    const phone = "+86 13083402573";

    /* author-profile.html renders location first and employer second. Reading the
       visible DOM keeps these two lines in the visitor's selected language. */
    const location = firstAuthorDesktopText(0) || "Hefei, China";
    const university = firstAuthorDesktopText(1) || "University of Science and Technology of China (USTC)";
    const institutionLine = [university, location].filter(Boolean).join(", ");

    header.innerHTML =
      '<div class="pdf-export-header__text">' +
        '<h1>' + escapeHtml(name) + '</h1>' +
        (bio ? '<p class="pdf-export-header__bio">' + escapeHtml(bio) + '</p>' : '') +
        '<p class="pdf-export-header__contact">' +
          '<a href="mailto:' + escapeHtml(email) + '">' + escapeHtml(email) + '</a>' +
          '<span class="pdf-contact-separator">&middot;</span>' +
          '<a href="' + escapeHtml(githubUrl) + '">GitHub</a>' +
          '<span class="pdf-contact-separator">&middot;</span>' +
          '<a href="' + escapeHtml(scholarUrl) + '">Google Scholar</a>' +
          '<span class="pdf-contact-separator">&middot;</span>' +
          '<a href="tel:+8613083402573">' + escapeHtml(phone) + '</a>' +
        '</p>' +
        (institutionLine ? '<p class="pdf-export-header__institution">' + escapeHtml(institutionLine) + '</p>' : '') +
      '</div>' +
      '<img class="pdf-export-header__photo" src="' + escapeHtml(photoSrc) + '" alt="' + escapeHtml(name) + '">';

    return header;
  }


  function groupHeadingBlocks(root, sectionSelector) {
    const section = root.querySelector(sectionSelector);
    if (!section) return;

    /*
     * Keep each logical CV entry together in the PDF. Markdown renders an
     * Education/Experience entry as an H2 followed by its metadata paragraph
     * and list. Avoiding a break on the H2 alone can still orphan the heading
     * or split the university name across pages. Wrapping the complete entry
     * gives html2pdf one atomic block to paginate.
     */
    const children = Array.from(section.childNodes);
    let block = null;

    children.forEach(function (node) {
      const isHeading = node.nodeType === 1 && node.tagName === "H2";
      const isSectionTitle = node.nodeType === 1 && node.classList && node.classList.contains("cv-section-title");

      if (isSectionTitle) {
        block = null;
        return;
      }

      if (isHeading) {
        block = document.createElement("div");
        block.className = "pdf-keep-block";
        section.insertBefore(block, node);
        block.appendChild(node);
        return;
      }

      if (block) {
        /* Whitespace-only text nodes do not need to be moved. */
        if (node.nodeType === 3 && !node.textContent.trim()) return;
        block.appendChild(node);
      }
    });
  }

  function transformPublicationsForPdf(root) {
    root.querySelectorAll(".publication-card").forEach(function (card) {
      const titleNode = card.querySelector(".publication-card__title");
      const authorsNode = card.querySelector(".publication-card__authors");
      const venueNode = card.querySelector(".publication-card__venue");
      const metricNode = card.querySelector(".publication-card__metric");

      const title = titleNode ? cleanText(titleNode.textContent) : "";
      const authors = authorsNode ? cleanText(authorsNode.textContent) : "";
      const venueHtml = venueNode ? venueNode.innerHTML : "";
      const metric = metricNode ? cleanText(metricNode.textContent) : "";

      const entry = document.createElement("div");
      entry.className = "pdf-publication-entry";
      entry.innerHTML =
        '<div class="pdf-publication-entry__bullet">&bull;</div>' +
        '<div class="pdf-publication-entry__content">' +
          '<div class="pdf-publication-entry__citation">' +
            (authors ? '<span class="pdf-publication-entry__authors">' + authorListHtml(authors) + '</span>, ' : '') +
            (title ? '&ldquo;<span class="pdf-publication-entry__title">' + escapeHtml(title) + '</span>,&rdquo; ' : '') +
            (venueHtml ? '<span class="pdf-publication-entry__venue">' + venueHtml + '</span>' : '') +
          '</div>' +
          (metric ? '<div class="pdf-publication-entry__metric">' + escapeHtml(metric.replace(/Impact Factor:/i, "IF:")) + '</div>' : '') +
        '</div>';

      card.replaceWith(entry);
    });
  }

  function preparePdfDom() {
    const source = document.getElementById("cv-content");
    if (!source) throw new Error("The current page does not contain CV content.");

    const clone = source.cloneNode(true);
    clone.removeAttribute("id");
    clone.classList.add("cv-pdf-export-root", "notranslate");
    clone.setAttribute("translate", "no");

    /* The hidden Jekyll PDF header may still be English after Google Translate;
       replace it with a header built from the currently visible translated UI. */
    clone.querySelectorAll(".pdf-only").forEach(function (node) { node.remove(); });
    clone.querySelectorAll(".no-pdf, details, pre, script, noscript").forEach(function (node) { node.remove(); });
    clone.querySelectorAll(".cv-section-title i").forEach(function (node) { node.remove(); });

    transformPublicationsForPdf(clone);

    /* Keep each degree/position together so a heading, institution name,
       dates, and bullets cannot be split across two PDF pages. */
    groupHeadingBlocks(clone, "#education");
    groupHeadingBlocks(clone, "#experience");

    const header = createTranslatedHeader();
    clone.insertBefore(header, clone.firstChild);

    const lang = currentLanguageCode();
    clone.setAttribute("lang", lang);
    clone.setAttribute("dir", isRtlLanguage(lang) ? "rtl" : "ltr");

    const host = document.createElement("div");
    host.className = "cv-pdf-export-host notranslate";
    host.setAttribute("translate", "no");
    host.appendChild(clone);
    document.body.appendChild(host);

    return { host: host, root: clone };
  }

  async function generateCurrentCvPdf() {
    if (generating) return;
    if (!document.getElementById("cv-content")) {
      window.location.href = "/#download-cv";
      return;
    }

    generating = true;
    setStatus("Generating CV PDF…");

    let prepared = null;
    try {
      const html2pdf = await loadHtml2Pdf();
      prepared = preparePdfDom();
      await waitForAssets(prepared.root);

      const options = {
        /* Real page margins prevent content from touching or being clipped at
           the A4 edges. Values are [top, left, bottom, right] in millimetres. */
        margin: [14, 14, 16, 14],
        filename: PDF_FILENAME,
        image: { type: "jpeg", quality: 0.96 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: Math.max(1200, document.documentElement.clientWidth)
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          compress: true
        },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: [
            ".pdf-export-header",
            ".pdf-publication-entry",
            ".reference-card",
            ".academic-service-row",
            ".pdf-keep-block",
            ".cv-section-title",
            "h2",
            "h3"
          ]
        },
        enableLinks: true
      };

      await html2pdf().set(options).from(prepared.root).save();
      setStatus("");
    } catch (error) {
      console.error(error);
      setStatus("PDF generation failed. Please refresh the page and try again.");
    } finally {
      if (prepared && prepared.host && prepared.host.parentNode) {
        prepared.host.parentNode.removeChild(prepared.host);
      }
      generating = false;
    }
  }

  document.addEventListener("click", function (event) {
    const link = event.target.closest('a[href$="#download-cv"]');
    if (!link) return;
    if (!document.getElementById("cv-content")) return;

    event.preventDefault();
    generateCurrentCvPdf();
  });

  if (window.location.hash === "#download-cv" && document.getElementById("cv-content")) {
    window.setTimeout(function () {
      generateCurrentCvPdf();
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }, 300);
  }
})();
