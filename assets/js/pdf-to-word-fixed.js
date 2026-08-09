(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const fileInput = $("fileInput");
  const upload = $("upload");
  const chooseLabel = $("chooseLabel");
  const runBtn = $("run");
  const downloadBtn = $("download");
  const resetBtn = $("reset");

  const fileSize = $("fileSize");
  const pageCount = $("pageCount");
  const status = $("status");
  const libraryStatus = $("libraryStatus");
  const bar = $("bar");
  const pct = $("pct");
  const resultInfo = $("resultInfo");
  const resultEmpty = $("resultEmpty");
  const resultSummary = $("resultSummary");
  const resultText = $("resultText");
  const uploadTitle = $("uploadTitle");
  const uploadHint = $("uploadHint");

  let selectedFile = null;
  let extractedPages = [];
  let resultBlob = null;
  let resultName = "converted-document.docx";

  function formatSize(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
    if (bytes < 1024) return bytes + " Bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function setProgress(value) {
    const n = Math.max(0, Math.min(100, Math.round(value)));
    bar.style.width = n + "%";
    pct.textContent = n + "%";
  }

  function setStatus(message, type = "") {
    status.textContent = message;
    status.classList.remove("success", "error", "warning");
    if (type) status.classList.add(type);
  }

  function setLibrary(message, type = "") {
    libraryStatus.textContent = message;
    libraryStatus.className = "library-status" + (type ? " " + type : "");
  }

  function updateButtons() {
    runBtn.disabled = !selectedFile || !window.pdfjsLib;
    downloadBtn.disabled = !resultBlob;
  }

  function resetResult() {
    resultBlob = null;
    extractedPages = [];
    resultInfo.textContent = "—";
    resultEmpty.hidden = false;
    resultSummary.hidden = true;
    setProgress(0);
    updateButtons();
  }

  async function loadPDF(file) {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setStatus("Please choose a valid PDF file.", "error");
      return;
    }

    selectedFile = file;
    resetResult();

    fileSize.textContent = formatSize(file.size);
    pageCount.textContent = "…";
    uploadTitle.textContent = file.name;
    uploadHint.innerHTML = "PDF selected • Click here to replace";
    setStatus("Reading PDF…");
    setProgress(5);

    try {
      if (!window.pdfjsLib) {
        throw new Error("PDF.js library did not load.");
      }

      const buffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(buffer)
      }).promise;

      pageCount.textContent = pdf.numPages;

      extractedPages = [];

      for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
        const page = await pdf.getPage(pageNo);
        const content = await page.getTextContent();

        const items = content.items || [];
        const lines = [];
        let currentLine = [];
        let lastY = null;

        for (const item of items) {
          const text = (item.str || "").trim();
          if (!text) continue;

          const y = item.transform ? item.transform[5] : null;

          if (
            lastY !== null &&
            y !== null &&
            Math.abs(y - lastY) > 4 &&
            currentLine.length
          ) {
            lines.push(currentLine.join(" "));
            currentLine = [];
          }

          currentLine.push(text);
          if (y !== null) lastY = y;
        }

        if (currentLine.length) lines.push(currentLine.join(" "));

        extractedPages.push(lines.filter(Boolean));

        setProgress(5 + (pageNo / pdf.numPages) * 20);
      }

      setProgress(25);
      setStatus(
        `${pdf.numPages} page${pdf.numPages > 1 ? "s" : ""} ready. Click PDF To Word.`
      );
      updateButtons();

    } catch (error) {
      console.error(error);
      selectedFile = null;
      pageCount.textContent = "0";
      setProgress(0);
      setStatus("Could not read this PDF. Please try another PDF.", "error");
      updateButtons();
    }
  }

  function buildDocxDocument() {
    if (!window.docx) {
      throw new Error("Word library is not available.");
    }

    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = window.docx;

    const children = [];

    extractedPages.forEach((lines, index) => {
      children.push(
        new Paragraph({
          text: `Page ${index + 1}`,
          heading: HeadingLevel.HEADING_2
        })
      );

      if (!lines.length) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: "[No selectable text found on this page]" })]
          })
        );
      } else {
        lines.forEach((line) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line
                })
              ],
              spacing: {
                after: 120
              }
            })
          );
        });
      }

      if (index < extractedPages.length - 1) {
        children.push(
          new Paragraph({
            pageBreakBefore: true,
            children: [new TextRun("")]
          })
        );
      }
    });

    return new Document({
      creator: "OneToolBox",
      title: "PDF To Word",
      description: "Converted by OneToolBox",
      sections: [
        {
          properties: {},
          children
        }
      ]
    });
  }

  async function convertToWord() {
    if (!selectedFile) return;

    runBtn.disabled = true;
    downloadBtn.disabled = true;
    resultBlob = null;
    setProgress(30);
    setStatus("Creating Word document…");

    try {
      if (!window.docx) {
        throw new Error("Word library is not loaded.");
      }

      const doc = buildDocxDocument();
      const blob = await window.docx.Packer.toBlob(doc);

      resultBlob = blob;
      resultName =
        selectedFile.name.replace(/\.pdf$/i, "") + "-converted.docx";

      resultInfo.textContent = formatSize(blob.size);
      resultText.textContent =
        `${extractedPages.length} page${extractedPages.length > 1 ? "s" : ""} converted`;

      resultEmpty.hidden = true;
      resultSummary.hidden = false;

      setProgress(100);
      setStatus("Conversion complete. Your Word file is ready.", "success");
      updateButtons();

    } catch (error) {
      console.error(error);

      setProgress(0);
      setStatus(
        "Word library load नहीं हुई. Internet/CDN connection check करें.",
        "error"
      );

      setLibrary(
        "Word library unavailable. Make sure this page can access jsDelivr, or download the library locally.",
        "error"
      );

      updateButtons();
    }
  }

  function downloadResult() {
    if (!resultBlob) return;

    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");

    a.href = url;
    a.download = resultName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function resetAll() {
    selectedFile = null;
    extractedPages = [];
    resultBlob = null;
    resultName = "converted-document.docx";

    fileInput.value = "";
    fileSize.textContent = "0 KB";
    pageCount.textContent = "0";
    uploadTitle.textContent = "Choose File";
    uploadHint.innerHTML = "📁 Select your PDF<br>🖱️ Drag & Drop";

    resultInfo.textContent = "—";
    resultEmpty.hidden = false;
    resultSummary.hidden = true;

    setProgress(0);
    setStatus("Choose a PDF file to begin.");
    updateButtons();
  }

  /* File input */
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    loadPDF(file);
  });

  /* Upload area */
  upload.addEventListener("click", (event) => {
    if (event.target.closest("label, input")) return;
    fileInput.click();
  });

  upload.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileInput.click();
    }
  });

  upload.addEventListener("dragover", (event) => {
    event.preventDefault();
    upload.classList.add("dragging");
  });

  upload.addEventListener("dragleave", () => {
    upload.classList.remove("dragging");
  });

  upload.addEventListener("drop", (event) => {
    event.preventDefault();
    upload.classList.remove("dragging");

    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) {
      loadPDF(file);
    }
  });

  runBtn.addEventListener("click", convertToWord);
  downloadBtn.addEventListener("click", downloadResult);
  resetBtn.addEventListener("click", resetAll);

  /* Library check */
  window.addEventListener("load", () => {
    if (window.pdfjsLib) {
      if (window.docx) {
        setLibrary("PDF.js + Word library loaded successfully.", "ok");
      } else {
        setLibrary(
          "PDF.js loaded, but Word library did not load. Check Internet/CDN access.",
          "error"
        );
      }
    } else {
      setLibrary("PDF.js did not load. Check Internet/CDN access.", "error");
    }

    updateButtons();
  });

  /* If the script tag itself failed */
  setTimeout(() => {
    if (!window.docx && window.__docxLoadError) {
      setLibrary(
        "Word library failed to load from jsDelivr.",
        "error"
      );
    }
    updateButtons();
  }, 1500);

})();
