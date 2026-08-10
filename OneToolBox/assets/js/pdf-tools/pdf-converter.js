/* =========================================================
   OneToolBox - PDF Converter
   Dedicated browser-side JavaScript
   PDF.js -> JPG / PNG / TXT / HTML
   ========================================================= */

(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const fileInput = $("fileInput");
  const upload = $("upload");
  const runBtn = $("run");
  const downloadBtn = $("download");
  const resetBtn = $("reset");

  const fileSizeEl = $("fileSize");
  const pageCountEl = $("pageCount");
  const quality = $("quality");
  const qualityValue = $("qualityValue");

  const resultImg = $("result");
  const resultText = $("resultText");
  const resultEmpty = $("resultEmpty");
  const resultInfo = $("resultInfo");

  const bar = $("bar");
  const pct = $("pct");
  const status = $("status");

  let currentFile = null;
  let pdfDoc = null;
  let resultBlob = null;
  let resultUrl = null;

  const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const setStatus = (text) => {
    if (status) status.textContent = text;
  };

  const setProgress = (value) => {
    const n = Math.max(0, Math.min(100, Math.round(value)));
    if (bar) bar.style.width = `${n}%`;
    if (pct) pct.textContent = `${n}%`;
  };

  const selectedFormat = () => {
    const checked = document.querySelector('input[name="format"]:checked');
    return checked ? checked.value : "jpg";
  };

  const clearResult = () => {
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      resultUrl = null;
    }

    resultBlob = null;

    if (resultImg) {
      resultImg.hidden = true;
      resultImg.removeAttribute("src");
    }

    if (resultText) {
      resultText.hidden = true;
      resultText.textContent = "";
    }

    if (resultEmpty) resultEmpty.hidden = false;
    if (resultInfo) resultInfo.textContent = "—";
    if (downloadBtn) downloadBtn.disabled = true;
  };

  const canvasToBlob = (canvas, type, qualityValueNum) =>
    new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Canvas export failed.")),
        type,
        qualityValueNum
      );
    });

  async function readPdf(file) {
    if (!window.pdfjsLib) {
      throw new Error("PDF.js could not be loaded. Check your internet connection.");
    }

    const buffer = await file.arrayBuffer();

    // Copy the Uint8Array so PDF.js can safely own the data.
    const bytes = new Uint8Array(buffer);
    return await window.pdfjsLib.getDocument({ data: bytes }).promise;
  }

  async function handleFile(file) {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setStatus("Please select a PDF file.");
      return;
    }

    currentFile = file;
    clearResult();
    setProgress(0);

    fileSizeEl.textContent = formatBytes(file.size);
    pageCountEl.textContent = "…";
    runBtn.disabled = true;
    setStatus("Reading PDF…");

    try {
      pdfDoc = await readPdf(file);
      pageCountEl.textContent = String(pdfDoc.numPages);
      runBtn.disabled = false;
      setStatus("PDF ready. Choose an output format and convert.");
    } catch (error) {
      pdfDoc = null;
      pageCountEl.textContent = "0";
      setStatus(`Could not read PDF: ${error.message || "Unknown error"}`);
      runBtn.disabled = true;
    }
  }

  async function renderPage(page, scale = 1.35) {
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({
      canvasContext: context,
      viewport,
      background: "white"
    }).promise;

    return canvas;
  }

  async function convertImages(format) {
    const qualityNum = Math.max(0.4, Math.min(1, Number(quality.value) / 100));

    const canvases = [];
    const total = pdfDoc.numPages;

    for (let i = 1; i <= total; i++) {
      setStatus(`Processing page ${i} of ${total}…`);
      setProgress((i - 1) / total * 80);

      const page = await pdfDoc.getPage(i);
      const canvas = await renderPage(page);
      canvases.push(canvas);
    }

    // One combined image is convenient for a single downloadable result.
    const gap = 20;
    const maxWidth = Math.max(...canvases.map(c => c.width));
    const totalHeight =
      canvases.reduce((sum, c) => sum + c.height, 0) +
      gap * Math.max(0, canvases.length - 1);

    const output = document.createElement("canvas");
    output.width = maxWidth;
    output.height = totalHeight;

    const ctx = output.getContext("2d", { alpha: false });
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, output.width, output.height);

    let y = 0;
    canvases.forEach((canvas, index) => {
      const x = Math.floor((maxWidth - canvas.width) / 2);
      ctx.drawImage(canvas, x, y);
      y += canvas.height;
      if (index < canvases.length - 1) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, y, maxWidth, gap);
        y += gap;
      }
      setProgress(80 + ((index + 1) / canvases.length) * 15);
    });

    const mime = format === "png" ? "image/png" : "image/jpeg";
    const ext = format === "png" ? "png" : "jpg";
    const blob = await canvasToBlob(output, mime, qualityNum);

    return {
      blob,
      url: URL.createObjectURL(blob),
      ext
    };
  }

  async function convertText() {
    const lines = [];
    const total = pdfDoc.numPages;

    for (let i = 1; i <= total; i++) {
      setStatus(`Extracting text from page ${i} of ${total}…`);
      setProgress((i - 1) / total * 90);

      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();

      const pageText = content.items
        .map(item => item.str || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      lines.push(`--- Page ${i} ---\n${pageText}`);
    }

    const text = lines.join("\n\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });

    return {
      blob,
      url: URL.createObjectURL(blob),
      ext: "txt",
      text
    };
  }

  async function convertHtml() {
    const pages = [];
    const total = pdfDoc.numPages;

    for (let i = 1; i <= total; i++) {
      setStatus(`Building HTML from page ${i} of ${total}…`);
      setProgress((i - 1) / total * 90);

      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();

      const text = content.items
        .map(item => item.str || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      pages.push(
        `<section><h2>Page ${i}</h2><p>${escapeHtml(text)}</p></section>`
      );
    }

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Converted PDF</title>
<style>
body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;padding:0 20px;color:#1e293b}
section{margin:0 0 30px;padding:20px;border:1px solid #e2e8f0;border-radius:12px}
h1{color:#2563eb} h2{font-size:18px} p{line-height:1.7;white-space:pre-wrap}
</style>
</head>
<body>
<h1>Converted PDF</h1>
${pages.join("\n")}
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });

    return {
      blob,
      url: URL.createObjectURL(blob),
      ext: "html",
      html
    };
  }

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  async function convert() {
    if (!pdfDoc || !currentFile) return;

    runBtn.disabled = true;
    clearResult();
    setProgress(0);

    try {
      const format = selectedFormat();
      let output;

      if (format === "jpg" || format === "png") {
        output = await convertImages(format);

        resultUrl = output.url;
        resultBlob = output.blob;

        resultImg.src = resultUrl;
        resultImg.hidden = false;
        resultText.hidden = true;
        resultEmpty.hidden = true;
      } else if (format === "txt") {
        output = await convertText();

        resultUrl = output.url;
        resultBlob = output.blob;

        resultText.textContent = output.text || "No readable text found.";
        resultText.hidden = false;
        resultImg.hidden = true;
        resultEmpty.hidden = true;
      } else {
        output = await convertHtml();

        resultUrl = output.url;
        resultBlob = output.blob;

        resultText.textContent = "HTML file created successfully. Click Download Result.";
        resultText.hidden = false;
        resultImg.hidden = true;
        resultEmpty.hidden = true;
      }

      setProgress(100);
      resultInfo.textContent = formatBytes(resultBlob.size);
      downloadBtn.disabled = false;
      setStatus("Conversion completed successfully.");
    } catch (error) {
      console.error("PDF Converter:", error);
      clearResult();
      setProgress(0);
      setStatus(`Conversion failed: ${error.message || "Browser could not complete the operation."}`);
    } finally {
      runBtn.disabled = !pdfDoc;
    }
  }

  function downloadResult() {
    if (!resultBlob || !resultUrl || !currentFile) return;

    const format = selectedFormat();
    const base = currentFile.name.replace(/\.pdf$/i, "");
    const ext = format === "jpg" ? "jpg" : format;

    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${base}-converted.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function reset() {
    currentFile = null;
    pdfDoc = null;

    if (fileInput) fileInput.value = "";

    fileSizeEl.textContent = "0 KB";
    pageCountEl.textContent = "0";
    quality.value = "85";
    qualityValue.textContent = "85%";

    const jpg = document.querySelector('input[name="format"][value="jpg"]');
    if (jpg) jpg.checked = true;

    clearResult();
    setProgress(0);
    setStatus("Choose a file to begin.");
    runBtn.disabled = true;
  }

  // File selection
  fileInput?.addEventListener("change", (event) => {
    handleFile(event.target.files?.[0]);
  });

  // Clicking the upload box opens the file picker, except when clicking
  // directly on the label/input.
  upload?.addEventListener("click", (event) => {
    if (event.target.closest("label")) return;
    fileInput?.click();
  });

  // Drag & drop
  ["dragenter", "dragover"].forEach(type => {
    upload?.addEventListener(type, event => {
      event.preventDefault();
      upload.classList.add("drag");
    });
  });

  ["dragleave", "drop"].forEach(type => {
    upload?.addEventListener(type, event => {
      event.preventDefault();
      upload.classList.remove("drag");
    });
  });

  upload?.addEventListener("drop", event => {
    const file = event.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });

  quality?.addEventListener("input", () => {
    qualityValue.textContent = `${quality.value}%`;
  });

  runBtn?.addEventListener("click", convert);
  downloadBtn?.addEventListener("click", downloadResult);
  resetBtn?.addEventListener("click", reset);

  window.addEventListener("beforeunload", () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  });
})();
