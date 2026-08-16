"use strict";
(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => [...document.querySelectorAll(s)];
    const input = $("#fileInput"), upload = $("#upload"), fileSize = $("#fileSize"), pageCount = $("#pageCount");
    const preview = $("#preview"), result = $("#result"), resultText = $("#resultText"), resultEmpty = $("#resultEmpty");
    const resultInfo = $("#resultInfo"), download = $("#download"), run = $("#run"), reset = $("#reset");
    const status = $("#status"), bar = $("#bar"), pct = $("#pct"), progressBox = $("#progressBox");
    const sourceText = $("#sourceText"), editText = $("#editText");
    const mode = document.body.dataset.tool || "";
    let file = null, blob = null, pdf = null, outputName = "output.pdf";

    const fmtBytes = (n) => !n ? "0 KB" : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`;
    const setStatus = (text) => { if (status) status.textContent = text; };
    const progress = (n, text) => {
      n = Math.max(0, Math.min(100, n));
      if (progressBox) progressBox.hidden = false;
      if (bar) bar.style.width = `${n}%`;
      if (pct) pct.textContent = `${Math.round(n)}%`;
      setStatus(text || "");
    };
    const enableRun = (yes) => { if (run) run.disabled = !yes; };
    const showResult = (text, ready = true) => {
      if (resultEmpty) resultEmpty.hidden = !!text;
      if (result) result.hidden = true;
      if (resultText) { resultText.hidden = !text; resultText.textContent = text || ""; }
      const box = preview || resultEmpty?.parentElement;
      if (box) box.classList.toggle("ready", ready && !!text);
    };
    const save = (b, filename, message = "Completed successfully.") => {
      blob = b; outputName = filename;
      if (resultInfo) resultInfo.textContent = fmtBytes(b.size);
      if (download) download.disabled = false;
      progress(100, message);
      showResult("Your result is ready. Download it below.", true);
    };
    async function loadPdf(f) {
      if (!f) return false;
      if (!/\.pdf$/i.test(f.name)) { alert("Please choose a PDF file."); return false; }
      try {
        file = f; outputName = f.name.replace(/\.pdf$/i, "") + "-processed.pdf";
        if (fileSize) fileSize.textContent = fmtBytes(f.size);
        const data = await f.arrayBuffer();
        pdf = await pdfjsLib.getDocument({ data }).promise;
        if (pageCount) pageCount.textContent = pdf.numPages;
        if (upload) upload.classList.remove("drag");
        enableRun(true);
        setStatus("PDF ready. Choose your options and run the tool.");
        return true;
      } catch (e) {
        console.error(e); pdf = file = null; enableRun(false); setStatus("Could not read this PDF."); alert("This PDF could not be opened. It may be damaged or password protected."); return false;
      }
    }
    input?.addEventListener("change", e => loadPdf(e.target.files[0]));
    upload?.addEventListener("click", e => { if (e.target.closest("label")) return; input?.click(); });
    ["dragenter", "dragover"].forEach(ev => upload?.addEventListener(ev, e => { e.preventDefault(); upload.classList.add("drag"); }));
    ["dragleave", "drop"].forEach(ev => upload?.addEventListener(ev, e => { e.preventDefault(); upload.classList.remove("drag"); }));
    upload?.addEventListener("drop", e => loadPdf(e.dataTransfer.files[0]));

    if (sourceText) {
      const update = () => enableRun(sourceText.value.trim().length > 0);
      sourceText.addEventListener("input", update); update();
    }
    if (editText && mode === "pdf-signature") editText.addEventListener("input", () => enableRun(!!pdf && editText.value.trim().length > 0));

    reset?.addEventListener("click", () => location.reload());
    download?.addEventListener("click", () => {
      if (!blob) return;
      const u = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = u; a.download = outputName; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(u), 1000);
    });

    function getJsPDF() {
      const ctor = window.jspdf && window.jspdf.jsPDF;
      if (typeof ctor !== "function") {
        throw new Error("jsPDF library is not loaded.");
      }
      return ctor;
    }
    async function renderPages(scale = 1.15, quality = .82) {
      const canvases = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i), v = page.getViewport({ scale });
        const c = document.createElement("canvas"); c.width = Math.round(v.width); c.height = Math.round(v.height);
        await page.render({ canvasContext: c.getContext("2d"), viewport: v }).promise;
        canvases.push(c); progress(i / pdf.numPages * 85, `Processing page ${i} of ${pdf.numPages}…`);
      }
      return canvases;
    }
    async function canvasesToPdf(canvases, quality = .82) {
      const J = getJsPDF(); let out = null;
      canvases.forEach((c, i) => {
        const landscape = c.width > c.height, format = [c.width, c.height];
        if (!out) out = new J({ orientation: landscape ? "landscape" : "portrait", unit: "pt", format, compress: true });
        else out.addPage(format, landscape ? "landscape" : "portrait");
        out.addImage(c.toDataURL("image/jpeg", quality), "JPEG", 0, 0, c.width, c.height, undefined, "FAST");
      });
      return out.output("blob");
    }
    async function textToPdf(text, filename) {
      const J = getJsPDF(); const doc = new J({ unit: "pt", format: "a4" });
      const margin = 42, width = 511, lineHeight = 16; let y = 52;
      const clean = text.replace(/\r\n/g, "\n");
      for (const paragraph of clean.split("\n")) {
        const lines = doc.splitTextToSize(paragraph || " ", width);
        for (const line of lines) { if (y > 790) { doc.addPage(); y = 52; } doc.text(line, margin, y); y += lineHeight; }
        y += 4;
      }
      return [doc.output("blob"), filename];
    }

    run?.addEventListener("click", async () => {
      if (run) run.disabled = true; if (download) download.disabled = true;
      try {
        if (["html-to-pdf", "word-to-pdf", "excel-to-pdf", "powerpoint-to-pdf"].includes(mode)) {
          const text = sourceText?.value.trim();
          if (!text) { alert("Enter some content first."); return; }
          progress(20, "Creating PDF…");
          const [b, n] = await textToPdf(text, mode.replace(/-to-pdf$/, "") + "-converted.pdf");
          save(b, n, "PDF created successfully.");
          return;
        }
        if (!pdf && mode !== "jpg-to-pdf") { alert("Choose a PDF file first."); return; }
        if (mode === "pdf-signature") {
          const text = editText?.value.trim(); if (!text) { alert("Enter a signature name or text."); return; }
          const cs = await renderPages(1.1, .85);
          for (const c of cs) { const x = c.getContext("2d"); x.save(); x.font = "italic 28px cursive"; x.fillStyle = "#111827"; x.fillText(text, 40, c.height - 45); x.restore(); }
          save(await canvasesToPdf(cs, .84), (file.name.replace(/\.pdf$/i, "") || "document") + "-signed.pdf", "Signature added successfully.");
          return;
        }
        if (mode === "pdf-to-jpg") {
          const cs = await renderPages(1.4, .9), c = cs[0];
          const b = await new Promise(r => c.toBlob(r, "image/jpeg", .9));
          if (result) { result.hidden = false; result.src = URL.createObjectURL(b); }
          if (resultEmpty) resultEmpty.hidden = true; if (preview) preview.classList.add("ready");
          save(b, (file.name.replace(/\.pdf$/i, "") || "document") + "-page-1.jpg", "First page converted successfully.");
          return;
        }
        const cs = await renderPages(mode === "pdf-compressor" ? .9 : 1.12, mode === "pdf-compressor" ? .68 : .8);
        if (["pdf-watermark", "pdf-editor"].includes(mode)) {
          const text = $("#watermarkText")?.value.trim() || $("#editText")?.value.trim();
          if (text) for (const c of cs) { const x = c.getContext("2d"); x.save(); x.globalAlpha = mode === "pdf-watermark" ? .25 : 1; x.font = mode === "pdf-watermark" ? "bold 42px Arial" : "24px Arial"; x.fillStyle = "#2563eb"; if (mode === "pdf-watermark") { x.translate(c.width / 2, c.height / 2); x.rotate(-Math.PI / 6); x.textAlign = "center"; } x.fillText(text, mode === "pdf-watermark" ? 0 : 30, mode === "pdf-watermark" ? 0 : c.height - 40); x.restore(); }
        }
        const suffix = mode === "pdf-compressor" ? "-compressed.pdf" : mode === "pdf-size-reducer" ? "-reduced.pdf" : "-processed.pdf";
        save(await canvasesToPdf(cs, mode === "pdf-compressor" ? .68 : .78), file.name.replace(/\.pdf$/i, "") + suffix, "PDF processed successfully.");
      } catch (e) {
        console.error(e); alert("This operation could not be completed in the browser. Please try another PDF or a smaller file."); progress(0, "Operation failed.");
      } finally { if (run) run.disabled = false; }
    });
  });
})();
