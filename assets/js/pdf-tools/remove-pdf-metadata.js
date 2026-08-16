(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const S = { file: null, blob: null, pdf: null };
  const fmt = (n) => !n ? "0 KB" : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`;
  const progress = (n, text) => {
    n = Math.max(0, Math.min(100, n));
    if ($("bar")) $("bar").style.width = `${n}%`; if ($("progressBox")) $("progressBox").hidden = false;
    if ($("pct")) $("pct").textContent = `${Math.round(n)}%`;
    if ($("status")) $("status").textContent = text;
  };

  function clearStandardInfo(doc) {
    // pdf-lib exposes these through the Info dictionary. Deleting the keys is
    // stronger than setting them to empty strings.
    try {
      const infoRef = doc.context.trailerInfo && doc.context.trailerInfo.Info;
      if (infoRef) {
        const info = doc.context.lookup(infoRef);
        ["Title", "Author", "Subject", "Keywords", "Creator", "Producer", "CreationDate", "ModDate"].forEach(k => {
          try { info.delete(PDFLib.PDFName.of(k)); } catch (_) {}
        });
      }
    } catch (_) {}
  }

  function clearCatalogMetadata(doc) {
    try { doc.catalog.delete(PDFLib.PDFName.of("Metadata")); } catch (_) {}
  }

  async function load(file) {
    if (!file || !/\.pdf$/i.test(file.name)) {
      alert("Please select a PDF file.");
      return;
    }
    try {
      S.file = file;
      S.blob = null;
      const bytes = await file.arrayBuffer();
      S.pdf = await PDFLib.PDFDocument.load(bytes, { updateMetadata: false });
      $("fileSize").textContent = fmt(file.size);
      $("pageCount").textContent = S.pdf.getPageCount();
      if ($("fileName")) $("fileName").textContent = file.name;
      $("run").disabled = false;
      $("download").disabled = true;
      $("resultInfo").textContent = "—";
      progress(0, "PDF ready. Metadata can be removed now.");
    } catch (err) {
      console.error(err);
      S.file = S.pdf = S.blob = null;
      $("run").disabled = true;
      progress(0, "Could not read this PDF.");
      alert("This PDF could not be opened. It may be damaged or password protected.");
    }
  }

  async function removeMetadata() {
    if (!S.file || !S.pdf) return;
    $("run").disabled = true;
    $("download").disabled = true;
    progress(20, "Removing document metadata…");
    try {
      const doc = S.pdf;
      clearStandardInfo(doc);
      clearCatalogMetadata(doc);
      progress(70, "Creating clean PDF…");
      const out = await doc.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false });
      S.blob = new Blob([out], { type: "application/pdf" });
      $("resultInfo").textContent = fmt(S.blob.size);
      $("resultEmpty").textContent = "Metadata removed successfully. Your original PDF was not changed.";
      $("download").disabled = false;
      progress(100, "Done. Standard PDF metadata has been removed.");
    } catch (err) {
      console.error(err);
      progress(0, "Metadata removal failed.");
      alert(`Could not remove PDF metadata: ${err.message || err}`);
    } finally {
      $("run").disabled = !S.pdf;
    }
  }

  function download() {
    if (!S.blob) return;
    const url = URL.createObjectURL(S.blob);
    const a = document.createElement("a");
    a.href = url;
    const base = (S.file?.name || "document.pdf").replace(/\.pdf$/i, "");
    a.download = `${base}-metadata-removed.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function reset() {
    S.file = S.blob = S.pdf = null;
    $("fileInput").value = "";
    if ($("fileName")) $("fileName").textContent = "No file selected";
    if ($("progressBox")) $("progressBox").hidden = true;
    $("fileSize").textContent = "0 KB";
    $("pageCount").textContent = "0";
    $("resultInfo").textContent = "—";
    $("resultEmpty").textContent = "Your result will appear here.";
    $("run").disabled = true;
    $("download").disabled = true;
    progress(0, "Choose a file to begin.");
  }

  $("fileInput").addEventListener("change", e => load(e.target.files[0]));
  $("upload").addEventListener("dragover", e => { e.preventDefault(); $("upload").classList.add("drag"); });
  $("upload").addEventListener("dragleave", () => $("upload").classList.remove("drag"));
  $("upload").addEventListener("drop", e => { e.preventDefault(); $("upload").classList.remove("drag"); load(e.dataTransfer.files[0]); });
  $("run").addEventListener("click", removeMetadata);
  $("download").addEventListener("click", download);
  $("reset").addEventListener("click", reset);
})();
