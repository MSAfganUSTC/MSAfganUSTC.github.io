---
layout: null
permalink: /certificate/
sitemap: false
---
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Experience Certificate</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 18px;
      background: #f7f7f7;
      color: #222;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    }
    .certificate-viewer {
      max-width: 1050px;
      margin: 0 auto;
    }
    .certificate-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 12px;
      font-size: 14px;
    }
    .certificate-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }
    .certificate-download,
    .certificate-download:visited {
      color: #4da6ff;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
    }
    .certificate-download:hover,
    .certificate-download:focus {
      color: #4da6ff;
      text-decoration: underline;
    }
    .certificate-image {
      display: block;
      width: 100%;
      height: auto;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #ddd;
    }
    .certificate-error {
      display: none;
      padding: 20px;
      background: #fff;
      border: 1px solid #ddd;
    }
    @media (max-width: 600px) {
      body { padding: 10px; }
      .certificate-toolbar { align-items: flex-start; }
    }
  </style>
</head>
<body>
  <main class="certificate-viewer">
    <div class="certificate-toolbar">
      <p id="certificate-title" class="certificate-title">Experience Certificate</p>
      <a id="certificate-download" class="certificate-download" href="#" download>Download</a>
    </div>
    <img id="certificate-image" class="certificate-image" alt="Experience certificate">
    <p id="certificate-error" class="certificate-error">The requested certificate could not be loaded.</p>
  </main>

  <script>
    (function () {
      "use strict";

      const params = new URLSearchParams(window.location.search);
      const file = params.get("file") || "";
      const title = params.get("title") || "Experience Certificate";
      const validFile = /^\/images\/[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp)$/i.test(file);

      const titleNode = document.getElementById("certificate-title");
      const imageNode = document.getElementById("certificate-image");
      const downloadNode = document.getElementById("certificate-download");
      const errorNode = document.getElementById("certificate-error");

      titleNode.textContent = title;
      document.title = title;

      if (!validFile) {
        imageNode.style.display = "none";
        downloadNode.style.display = "none";
        errorNode.style.display = "block";
        return;
      }

      imageNode.src = file;
      imageNode.alt = title;
      downloadNode.href = file;
      downloadNode.setAttribute("download", file.split("/").pop());

      imageNode.addEventListener("error", function () {
        imageNode.style.display = "none";
        downloadNode.style.display = "none";
        errorNode.style.display = "block";
      });
    })();
  </script>
</body>
</html>
