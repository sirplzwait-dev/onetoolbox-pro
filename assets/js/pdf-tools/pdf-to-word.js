/* =========================================================
   OneToolBox - PDF To Word
   Dedicated JS
   PDF.js -> DOCX
   Browser based
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
  const resultText = $("resultText");
  const resultEmpty = $("resultEmpty");
  const resultInfo = $("resultInfo");
  const bar = $("bar");
  const pct = $("pct");
  const statusEl = $("status");

  let currentFile = null;
  let pdfDoc = null;
  let resultBlob = null;
  let resultUrl = null;

  function formatBytes(bytes) {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  function setStatus(message) {
    if (statusEl) statusEl.textContent = message;
  }

  function setProgress(value) {
    const n = Math.max(0, Math.min(100, Math.round(value)));
    if (bar) bar.style.width = `${n}%`;
    if (pct) pct.textContent = `${n}%`;
  }

  function clearResult() {
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      resultUrl = null;
    }

    resultBlob = null;

    if (resultText) {
      resultText.textContent = "";
      resultText.hidden = true;
    }

    if (resultEmpty) resultEmpty.hidden = false;
    if (resultInfo) resultInfo.textContent = "—";
    if (downloadBtn) downloadBtn.disabled = true;
  }

  async function loadPdf(file) {
    if (!window.pdfjsLib) {
      throw new Error("PDF.js load नहीं हुआ। Internet/CDN connection check करें.");
    }

    const buffer = await file.arrayBuffer();

    return await pdfjsLib.getDocument({
      data: new Uint8Array(buffer)
    }).promise;
  }

  async function selectFile(file) {
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setStatus("कृपया केवल PDF file select करें.");
      return;
    }

    currentFile = file;
    pdfDoc = null;
    clearResult();
    setProgress(0);

    fileSizeEl.textContent = formatBytes(file.size);
    pageCountEl.textContent = "…";
    runBtn.disabled = true;
    setStatus("PDF पढ़ी जा रही है…");

    try {
      pdfDoc = await loadPdf(file);

      pageCountEl.textContent = String(pdfDoc.numPages);
      runBtn.disabled = false;
      setStatus("PDF तैयार है. अब PDF To Word दबाएँ.");
    } catch (error) {
      console.error(error);

      pageCountEl.textContent = "0";
      runBtn.disabled = true;

      setStatus(
        "PDF open नहीं हो सकी: " +
        (error.message || "Unknown error")
      );
    }
  }

  function getPdfTextItems(content) {
    return content.items
      .filter(item => typeof item.str === "string")
      .map(item => ({
        text: item.str,
        x: item.transform ? item.transform[4] : 0,
        y: item.transform ? item.transform[5] : 0
      }));
  }

  function buildLines(items) {
    if (!items.length) return [];

    // PDF text items are not necessarily returned in visual order.
    // Group approximately by Y coordinate, then sort by X.
    const rows = [];

    items.forEach(item => {
      let row = rows.find(r => Math.abs(r.y - item.y) < 4);

      if (!row) {
        row = { y: item.y, items: [] };
        rows.push(row);
      }

      row.items.push(item);
    });

    rows.sort((a, b) => b.y - a.y);

    return rows.map(row => {
      row.items.sort((a, b) => a.x - b.x);

      let line = "";

      row.items.forEach(item => {
        const value = item.text.trim();

        if (!value) return;

        if (
          line &&
          !/[([{/"'₹$€£-]$/.test(line) &&
          !/^[,.;:!?%)\]}]/.test(value)
        ) {
          line += " ";
        }

        line += value;
      });

      return line.trim();
    }).filter(Boolean);
  }

  async function extractPdfText() {
    const allPages = [];
    const total = pdfDoc.numPages;

    for (let pageNumber = 1; pageNumber <= total; pageNumber++) {
      setStatus(`Page ${pageNumber} of ${total} पढ़ी जा रही है…`);
      setProgress(((pageNumber - 1) / total) * 90);

      const page = await pdfDoc.getPage(pageNumber);
      const content = await page.getTextContent();

      const items = getPdfTextItems(content);
      const lines = buildLines(items);

      allPages.push({
        pageNumber,
        text: lines.join("\n")
      });

      setProgress((pageNumber / total) * 90);
    }

    return allPages;
  }

  function makeDocxParagraphs(pages) {
    const { Paragraph, TextRun } = window.docx;

    const paragraphs = [];

    pages.forEach((page, index) => {
      if (index > 0) {
        paragraphs.push(
          new Paragraph({
            pageBreakBefore: true,
            children: []
          })
        );
      }

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Page ${page.pageNumber}`,
              bold: true,
              size: 24
            })
          ],
          spacing: {
            after: 180
          }
        })
      );

      const lines = page.text
        ? page.text.split("\n")
        : ["[No selectable text found on this page]"];

      lines.forEach(line => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line || " ",
                size: 22
              })
            ],
            spacing: {
              after: 90,
              line: 276
            }
          })
        );
      });
    });

    return paragraphs;
  }

  async function convertToWord() {
    if (!pdfDoc || !currentFile) return;

    if (!window.docx || typeof window.docx.Document !== "function" || typeof window.docx.Packer !== "object") {
      setStatus("Word library load नहीं हुई. Internet/CDN connection check करें.");
      return;
    }

    runBtn.disabled = true;
    downloadBtn.disabled = true;
    clearResult();
    setProgress(0);

    try {
      setStatus("PDF text extract किया जा रहा है…");

      const pages = await extractPdfText();

      setProgress(93);
      setStatus("Word document तैयार किया जा रहा है…");

      const {
        Document,
        Packer
      } = window.docx;

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: makeDocxParagraphs(pages)
          }
        ]
      });

      resultBlob = await Packer.toBlob(doc);
      resultUrl = URL.createObjectURL(resultBlob);

      const previewText = pages
        .map(page => `--- Page ${page.pageNumber} ---\n${page.text}`)
        .join("\n\n");

      resultText.textContent =
        previewText.trim() ||
        "PDF में selectable text नहीं मिला. यह scanned/image PDF हो सकती है.";

      resultText.hidden = false;
      resultEmpty.hidden = true;

      resultInfo.textContent = formatBytes(resultBlob.size);
      downloadBtn.disabled = false;

      setProgress(100);
      setStatus("PDF successfully Word document में convert हो गई.");
    } catch (error) {
      console.error("PDF To Word:", error);

      clearResult();
      setProgress(0);

      setStatus(
        "Conversion failed: " +
        (error.message || "Browser operation complete नहीं कर सका.")
      );
    } finally {
      runBtn.disabled = !pdfDoc;
    }
  }

  function downloadWord() {
    if (!resultBlob || !resultUrl || !currentFile) return;

    const baseName = currentFile.name
      .replace(/\.pdf$/i, "")
      .replace(/[\\/:*?"<>|]/g, "_");

    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `${baseName}-converted.docx`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function resetTool() {
    currentFile = null;
    pdfDoc = null;

    if (fileInput) fileInput.value = "";

    fileSizeEl.textContent = "0 KB";
    pageCountEl.textContent = "0";

    clearResult();
    setProgress(0);
    setStatus("Choose a file to begin.");

    runBtn.disabled = true;
  }

  fileInput?.addEventListener("change", e => {
    selectFile(e.target.files?.[0]);
  });

  upload?.addEventListener("click", e => {
    if (e.target.closest("label")) return;
    fileInput?.click();
  });

  ["dragenter", "dragover"].forEach(eventName => {
    upload?.addEventListener(eventName, e => {
      e.preventDefault();
      upload.classList.add("drag");
    });
  });

  ["dragleave", "drop"].forEach(eventName => {
    upload?.addEventListener(eventName, e => {
      e.preventDefault();
      upload.classList.remove("drag");
    });
  });

  upload?.addEventListener("drop", e => {
    const file = e.dataTransfer?.files?.[0];
    if (file) selectFile(file);
  });

  runBtn?.addEventListener("click", convertToWord);
  downloadBtn?.addEventListener("click", downloadWord);
  resetBtn?.addEventListener("click", resetTool);

  window.addEventListener("beforeunload", () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  });
})();
