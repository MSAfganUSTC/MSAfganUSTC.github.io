(function () {
  "use strict";

  const PDF_LIBRARY_URL = "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";
  const PDF_FILENAME = "Muhammad_Sher_Afgan_CV.pdf";
  let libraryPromise = null;
  let generating = false;

  function setStatus(message) {
    const status = document.getElementById("cv-download-status");
    if (status) status.textContent = message || "";
  }

  function loadPdfLibrary() {
    if (window.html2pdf) return Promise.resolve(window.html2pdf);
    if (libraryPromise) return libraryPromise;

    libraryPromise = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = PDF_LIBRARY_URL;
      script.async = true;
      script.onload = function () {
        if (window.html2pdf) resolve(window.html2pdf);
        else reject(new Error("PDF library loaded but was not initialized."));
      };
      script.onerror = function () {
        reject(new Error("Unable to load the PDF generator."));
      };
      document.head.appendChild(script);
    });

    return libraryPromise;
  }

  function createPdfClone(source) {
    const clone = source.cloneNode(true);
    clone.id = "cv-pdf-render";
    clone.classList.add("pdf-rendering");

    clone.querySelectorAll("[id]").forEach(function (node) {
      if (node !== clone) node.removeAttribute("id");
    });

    clone.querySelectorAll("details, .no-pdf").forEach(function (node) {
      node.remove();
    });

    clone.querySelectorAll("a").forEach(function (link) {
      link.removeAttribute("target");
      link.removeAttribute("rel");
    });

    /*
     * Do NOT place the clone far to the left of the viewport. html2canvas can
     * return a blank canvas for elements positioned tens of thousands of
     * pixels off-screen. Instead, place it below the current document where
     * it is renderable but not visible to the visitor.
     */
    clone.style.position = "absolute";
    clone.style.left = "0";
    clone.style.top = (document.documentElement.scrollHeight + 100) + "px";
    clone.style.zIndex = "0";
    clone.style.display = "block";
    clone.style.pointerEvents = "none";

    document.body.appendChild(clone);
    return clone;
  }

  function waitForImages(root) {
    const images = Array.from(root.querySelectorAll("img"));
    return Promise.all(images.map(function (img) {
      if (img.complete) return Promise.resolve();
      return new Promise(function (resolve) {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    }));
  }

  function nextFrame() {
    return new Promise(function (resolve) {
      requestAnimationFrame(function () {
        requestAnimationFrame(resolve);
      });
    });
  }

  async function generateCurrentCvPdf() {
    if (generating) return;

    const source = document.getElementById("cv-content");
    if (!source) {
      window.location.href = "/#download-cv";
      return;
    }

    generating = true;
    setStatus("Generating the current CV PDF…");
    let clone = null;

    try {
      const html2pdf = await loadPdfLibrary();
      clone = createPdfClone(source);

      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await waitForImages(clone);
      await nextFrame();

      const options = {
        margin: [10, 10, 10, 10],
        filename: PDF_FILENAME,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: 900,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait"
        },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: ["h1", "h2", "h3"]
        }
      };

      await html2pdf().set(options).from(clone).save();
      setStatus("");
    } catch (error) {
      console.error(error);
      setStatus("PDF generation failed. Please refresh the page and try again.");
    } finally {
      if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
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
