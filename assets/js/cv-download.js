(function () {
  "use strict";

  /*
   * Dynamic CV generator.
   *
   * This intentionally does NOT use html2canvas/html2pdf. The earlier
   * screenshot-based approach could create a valid but blank PDF in some
   * browsers. This version reads the live one-page CV DOM and writes real
   * text into jsPDF, so the downloaded PDF always reflects the currently
   * rendered website content.
   */

  const JSPDF_URL = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
  const PDF_FILENAME = "Muhammad_Sher_Afgan_CV.pdf";
  let libraryPromise = null;
  let generating = false;

  function setStatus(message) {
    const status = document.getElementById("cv-download-status");
    if (status) status.textContent = message || "";
  }

  function loadJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF) {
      return Promise.resolve(window.jspdf.jsPDF);
    }
    if (libraryPromise) return libraryPromise;

    libraryPromise = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = JSPDF_URL;
      script.async = true;
      script.onload = function () {
        if (window.jspdf && window.jspdf.jsPDF) resolve(window.jspdf.jsPDF);
        else reject(new Error("jsPDF loaded but was not initialized."));
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

  function createPdfWriter(jsPDF) {
    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 44;
    const marginTop = 44;
    const marginBottom = 46;
    const contentWidth = pageWidth - (marginX * 2);
    let y = marginTop;

    function addPage() {
      doc.addPage();
      y = marginTop;
    }

    function ensureSpace(height) {
      if (y + height > pageHeight - marginBottom) addPage();
    }

    function font(style, size, color) {
      doc.setFont("helvetica", style || "normal");
      doc.setFontSize(size || 9.5);
      doc.setTextColor.apply(doc, color || [40, 40, 40]);
    }

    function wrappedLines(text, width, size) {
      font("normal", size || 9.5);
      return doc.splitTextToSize(cleanText(text), width || contentWidth);
    }

    function writeHeader(name, bio, contact) {
      font("bold", 20, [45, 49, 52]);
      const nameLines = doc.splitTextToSize(cleanText(name), contentWidth);
      ensureSpace(nameLines.length * 23 + 45);
      doc.text(nameLines, pageWidth / 2, y, { align: "center" });
      y += nameLines.length * 23;

      if (bio) {
        font("normal", 10.5, [70, 74, 78]);
        const lines = doc.splitTextToSize(cleanText(bio), contentWidth);
        doc.text(lines, pageWidth / 2, y, { align: "center" });
        y += lines.length * 14;
      }

      if (contact) {
        font("normal", 9.2, [75, 79, 82]);
        const lines = doc.splitTextToSize(cleanText(contact), contentWidth);
        doc.text(lines, pageWidth / 2, y, { align: "center" });
        y += lines.length * 12;
      }

      y += 8;
      doc.setDrawColor(210, 210, 210);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 18;
    }

    function writeSectionHeading(text) {
      const title = cleanText(text);
      if (!title) return;
      const boxHeight = 31;
      ensureSpace(boxHeight + 12);
      doc.setFillColor(244, 244, 244);
      doc.roundedRect(marginX, y, contentWidth, boxHeight, 4, 4, "F");
      doc.setFillColor(89, 97, 104);
      doc.rect(marginX, y, 4, boxHeight, "F");
      font("bold", 13.2, [76, 82, 87]);
      doc.text(title, marginX + 15, y + 20.5);
      y += boxHeight + 13;
    }

    function writeSubHeading(text, level) {
      const value = cleanText(text);
      if (!value) return;
      const size = level === 2 ? 11.7 : 10.3;
      const lineHeight = level === 2 ? 15 : 13;
      font("bold", size, [52, 56, 60]);
      const lines = doc.splitTextToSize(value, contentWidth);
      ensureSpace(lines.length * lineHeight + 8);
      doc.text(lines, marginX, y);
      y += lines.length * lineHeight + (level === 2 ? 5 : 4);
    }

    function writeParagraph(text, options) {
      const value = cleanText(text);
      if (!value) return;
      const opts = options || {};
      const size = opts.size || 9.4;
      const indent = opts.indent || 0;
      const width = contentWidth - indent;
      const lineHeight = size * 1.42;
      font(opts.bold ? "bold" : "normal", size, [42, 42, 42]);
      const lines = doc.splitTextToSize(value, width);
      ensureSpace(lines.length * lineHeight + 7);
      doc.text(lines, marginX + indent, y, { lineHeightFactor: 1.42 });
      y += lines.length * lineHeight + (opts.tight ? 3 : 7);
    }

    function writeBullet(text, numberLabel) {
      const value = cleanText(text);
      if (!value) return;
      const size = 9.3;
      const bulletIndent = 13;
      const textIndent = 22;
      const width = contentWidth - textIndent;
      const lineHeight = size * 1.4;
      font("normal", size, [42, 42, 42]);
      const lines = doc.splitTextToSize(value, width);
      ensureSpace(lines.length * lineHeight + 4);
      doc.text(numberLabel || "•", marginX + bulletIndent, y);
      doc.text(lines, marginX + textIndent, y, { lineHeightFactor: 1.4 });
      y += lines.length * lineHeight + 4;
    }

    function writeRule() {
      ensureSpace(12);
      y += 2;
      doc.setDrawColor(225, 225, 225);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 10;
    }

    function writeGap(points) {
      ensureSpace(points || 6);
      y += points || 6;
    }

    function addPageNumbers() {
      const total = doc.getNumberOfPages();
      for (let i = 1; i <= total; i += 1) {
        doc.setPage(i);
        font("normal", 8, [120, 120, 120]);
        doc.text("Page " + i + " of " + total, pageWidth / 2, pageHeight - 20, { align: "center" });
      }
    }

    return {
      doc,
      writeHeader,
      writeSectionHeading,
      writeSubHeading,
      writeParagraph,
      writeBullet,
      writeRule,
      writeGap,
      addPageNumbers
    };
  }

  function shouldSkip(node) {
    if (!node || node.nodeType !== 1) return true;
    if (node.classList.contains("no-pdf")) return true;
    return ["DETAILS", "PRE", "SCRIPT", "STYLE", "IMG", "NOSCRIPT"].includes(node.tagName);
  }

  function processElement(node, writer) {
    if (shouldSkip(node)) return;

    const tag = node.tagName;

    if (node.classList.contains("cv-section-title")) return;

    if (tag === "H1" || tag === "H2" || tag === "H3" || tag === "H4") {
      writer.writeSubHeading(node.innerText, tag === "H2" ? 2 : 3);
      return;
    }

    if (tag === "P") {
      writer.writeParagraph(node.innerText);
      return;
    }

    if (tag === "UL" || tag === "OL") {
      const items = Array.from(node.children).filter(function (child) {
        return child.tagName === "LI";
      });
      items.forEach(function (item, index) {
        writer.writeBullet(item.innerText, tag === "OL" ? String(index + 1) + "." : "•");
      });
      writer.writeGap(2);
      return;
    }

    if (tag === "HR") {
      writer.writeRule();
      return;
    }

    if (node.classList.contains("reference-card")) {
      Array.from(node.children).forEach(function (child) {
        processElement(child, writer);
      });
      writer.writeGap(5);
      return;
    }

    Array.from(node.children).forEach(function (child) {
      processElement(child, writer);
    });
  }

  function buildPdfFromCurrentPage(jsPDF) {
    const source = document.getElementById("cv-content");
    if (!source) throw new Error("The current page does not contain CV content.");

    const writer = createPdfWriter(jsPDF);
    const header = source.querySelector(".cv-pdf-header");

    let name = "Muhammad Sher Afgan";
    let bio = "";
    let contact = "";

    if (header) {
      const headerName = header.querySelector("h1");
      const headerParagraphs = header.querySelectorAll("p");
      if (headerName) name = headerName.textContent;
      if (headerParagraphs[0]) bio = headerParagraphs[0].textContent;
      if (headerParagraphs[1]) contact = headerParagraphs[1].textContent;
    }

    writer.writeHeader(name, bio, contact);

    const sections = Array.from(source.querySelectorAll(":scope > .cv-section")).filter(function (section) {
      return !section.classList.contains("no-pdf");
    });

    sections.forEach(function (section) {
      const titleNode = section.querySelector(":scope > .cv-section-title");
      const title = titleNode ? titleNode.innerText : (section.getAttribute("data-pdf-title") || "");
      if (title) writer.writeSectionHeading(title);

      Array.from(section.children).forEach(function (child) {
        if (child === titleNode) return;
        processElement(child, writer);
      });

      writer.writeGap(8);
    });

    writer.addPageNumbers();
    return writer.doc;
  }

  async function generateCurrentCvPdf() {
    if (generating) return;
    if (!document.getElementById("cv-content")) {
      window.location.href = "/#download-cv";
      return;
    }

    generating = true;
    setStatus("Generating the current CV PDF…");

    try {
      const jsPDF = await loadJsPdf();
      const doc = buildPdfFromCurrentPage(jsPDF);
      doc.setProperties({
        title: "Muhammad Sher Afgan - Curriculum Vitae",
        subject: "Academic Curriculum Vitae",
        author: "Muhammad Sher Afgan"
      });
      doc.save(PDF_FILENAME);
      setStatus("");
    } catch (error) {
      console.error(error);
      setStatus("PDF generation failed. Please refresh the page and try again.");
    } finally {
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
    }, 250);
  }
})();
