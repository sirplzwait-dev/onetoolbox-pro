/* ==========================================================
   OneToolBox — AI Background Remover
   Browser-side processing with @imgly/background-removal
   No Netlify function required.
========================================================== */

const $ = (id) => document.getElementById(id);

const uploadArea = $("uploadArea");
const imageInput = $("imageInput");
const selectBtn = $("selectBtn");
const beforeImg = $("beforeImg");
const originalPreview = $("originalPreview");
const uploadPreview = $("uploadPreview");
const afterImg = $("afterImg");
const removeBgBtn = $("removeBgBtn");
const resetBtn = $("resetBtn");
const downloadBtn = $("downloadBtn");
const loader = $("loader");
const processingText = $("processingText");
const processingMessage = $("processingMessage");
const progressBar = $("progressBar");
const progressText = $("progressText");
const fileSize = $("fileSize");
const resolution = $("resolution");
const statusText = $("statusText");
const resultPlaceholder = $("resultPlaceholder");


const aiModal = $("aiProcessingModal");
const aiModalMessage = $("aiModalMessage");
const aiModalStage = $("aiModalStage");
const aiModalProgress = $("aiModalProgress");
const aiModalProgressBar = $("aiModalProgressBar");
const aiModalDone = $("aiModalDone");
const aiModalError = $("aiModalError");
const aiModalErrorText = $("aiModalErrorText");
const aiModalClose = $("aiModalClose");

let selectedFile = null;
let removedBlob = null;
let removedUrl = "";
let finalUrl = "";
let selectedBackground = "transparent";

const backgrounds = [
  ["Transparent", "transparent"],
  ["White", "#ffffff"],
  ["Black", "#000000"],
  ["Red", "#ef4444"],
  ["Blue", "#2563eb"],
  ["Green", "#16a34a"],
  ["Yellow", "#facc15"],
  ["Gray", "#6b7280"]
];


function openAiModal() {
  if (!aiModal) return;
  aiModal.classList.add("show");
  aiModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("ai-modal-open");
  aiModalDone?.classList.remove("show");
  aiModalError?.classList.remove("show");
  if (aiModalClose) {
    aiModalClose.textContent = "Cancel";
    aiModalClose.style.display = "inline-flex";
  }
  setAiModalProgress(0, "Preparing image", "Loading AI engine...");
}

function closeAiModal(force = false) {
  if (!aiModal) return;
  if (!force && aiModalClose?.dataset.processing === "true") return;
  aiModal.classList.remove("show");
  aiModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("ai-modal-open");
}

function setAiModalProgress(value, stage, message) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  if (aiModalProgressBar) aiModalProgressBar.style.width = `${v}%`;
  if (aiModalProgress) aiModalProgress.textContent = `${Math.round(v)}%`;
  if (aiModalStage && stage) aiModalStage.textContent = stage;
  if (aiModalMessage && message) aiModalMessage.textContent = message;
}

function aiModalComplete() {
  setAiModalProgress(100, "Completed", "Your background has been removed.");
  aiModalDone?.classList.add("show");
  if (aiModalClose) {
    aiModalClose.dataset.processing = "false";
    aiModalClose.textContent = "Done";
  }
}

function aiModalFail(message) {
  aiModalErrorText && (aiModalErrorText.textContent = message);
  aiModalError?.classList.add("show");
  if (aiModalClose) {
    aiModalClose.dataset.processing = "false";
    aiModalClose.textContent = "Close";
  }
}

function setStatus(text) {
  if (statusText) statusText.textContent = text;
}

function setProgress(value, message) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  if (progressBar) progressBar.style.width = `${v}%`;
  if (progressText) progressText.textContent = `${Math.round(v)}%`;
  if (processingMessage && message) processingMessage.textContent = message;
  if (aiModal?.classList.contains("show")) {
    let stage = "Processing";
    if (v < 8) stage = "Preparing image";
    else if (v < 25) stage = "Loading AI model";
    else if (v < 85) stage = "Removing background";
    else if (v < 100) stage = "Refining edges";
    else stage = "Completed";
    setAiModalProgress(v, stage, message || "Processing...");
  }
}

function setProcessing(show, message = "Preparing AI...") {
  if (processingText) processingText.style.display = show ? "block" : "none";
  if (aiModalClose) aiModalClose.dataset.processing = show ? "true" : "false";
  if (loader) loader.style.display = show ? "block" : "none";
  if (removeBgBtn) removeBgBtn.disabled = show;
  if (selectBtn) selectBtn.disabled = show;
  if (message) setProgress(0, message);
}

function formatSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function revoke(url) {
  if (url) URL.revokeObjectURL(url);
}

function showOriginal(file) {
  const url = URL.createObjectURL(file);

  if (originalPreview) {
    originalPreview.src = url;
    originalPreview.style.display = "block";
    uploadPreview?.classList.add("has-image");
  }

  // Keep the old result preview hidden; the Result card is reserved for the
  // processed foreground only.
  if (beforeImg) {
    beforeImg.removeAttribute("src");
    beforeImg.style.display = "none";
  }
  if (originalPreview) {
    originalPreview.removeAttribute("src");
    originalPreview.style.display = "none";
  }
  uploadPreview?.classList.remove("has-image");

  const img = new Image();
  img.onload = () => {
    if (resolution) resolution.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
    URL.revokeObjectURL(img.src);
  };
  img.src = URL.createObjectURL(file);

  if (fileSize) fileSize.textContent = formatSize(file.size);
}

function clearResult() {
  revoke(removedUrl);
  revoke(finalUrl);
  removedUrl = "";
  finalUrl = "";
  removedBlob = null;

  if (afterImg) {
    afterImg.removeAttribute("src");
    afterImg.style.display = "none";
  }
  if (downloadBtn) {
    downloadBtn.removeAttribute("href");
    downloadBtn.style.display = "none";
  }
  if (resultPlaceholder) resultPlaceholder.style.display = "block";
}

function createBackgroundControls() {
  const note = document.querySelector(".tool-note");
  if (!note) return;

  let box = document.getElementById("backgroundControls");
  if (!box) {
    box = document.createElement("div");
    box.id = "backgroundControls";
    box.className = "background-controls";
    note.after(box);
  }

  box.innerHTML = `
    <div class="background-title">
      <span><i class="fa-solid fa-palette"></i> Background</span>
      <small>Choose output background</small>
    </div>
    <div class="background-options">
      ${backgrounds.map(([name, value]) => `
        <button type="button"
                class="background-option ${value === selectedBackground ? "active" : ""}"
                data-background="${value}">
          <span class="background-swatch" style="--swatch:${value === "transparent" ? "transparent" : value}"></span>
          ${name}
        </button>
      `).join("")}
    </div>
  `;

  box.querySelectorAll(".background-option").forEach(btn => {
    btn.addEventListener("click", async () => {
      selectedBackground = btn.dataset.background;
      box.querySelectorAll(".background-option").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      if (removedBlob) await renderFinal();
    });
  });
}

async function blobToImage(blob) {
  const url = URL.createObjectURL(blob);
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
  return { img, url };
}

async function renderFinal() {
  if (!removedBlob) return;

  const { img, url } = await blobToImage(removedBlob);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");

  if (selectedBackground !== "transparent") {
    ctx.fillStyle = selectedBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);

  const finalBlob = await new Promise(resolve =>
    canvas.toBlob(resolve, "image/png")
  );

  if (!finalBlob) throw new Error("Could not create the PNG result.");

  revoke(finalUrl);
  finalUrl = URL.createObjectURL(finalBlob);

  if (beforeImg) {
    beforeImg.removeAttribute("src");
    beforeImg.style.display = "none";
  }
  if (originalPreview) {
    originalPreview.removeAttribute("src");
    originalPreview.style.display = "none";
  }
  uploadPreview?.classList.remove("has-image");
  afterImg.src = finalUrl;
  afterImg.style.display = "block";
  resultPlaceholder.style.display = "none";

  downloadBtn.href = finalUrl;
  downloadBtn.download = selectedBackground === "transparent"
    ? "background-removed.png"
    : "background-removed.png";
  downloadBtn.style.display = "inline-flex";
}


let removeBackgroundFn = null;

async function getRemoveBackground() {
  if (removeBackgroundFn) return removeBackgroundFn;

  setProcessing(true, "Loading AI engine...");
  try {
    const mod = await import(
      "https://esm.sh/@imgly/background-removal@1.7.0?bundle"
    );
    removeBackgroundFn = mod.removeBackground || mod.default || mod;
    if (typeof removeBackgroundFn !== "function") {
      throw new Error("AI background removal engine could not be loaded.");
    }
    return removeBackgroundFn;
  } catch (err) {
    console.error("AI module load error:", err);
    throw new Error(
      "AI engine load nahi ho pa raha. Internet connection check karke page ko Ctrl+F5 se reload karein."
    );
  }
}

async function processImage() {
  if (!selectedFile) {
    alert("Please choose an image first.");
    return;
  }

  clearResult();
  openAiModal();
  setProcessing(true, "Loading AI model...");
  setStatus("Processing...");

  try {
    const removeBackground = await getRemoveBackground();
    const blob = await removeBackground(selectedFile, {
      model: "isnet",
      device: "gpu",
      output: {
        type: "foreground",
        format: "image/png",
        quality: 1
      },
      progress: (key, current, total) => {
        const percent = total ? (current / total) * 100 : 0;
        setProgress(percent, key ? `Loading ${key}...` : "Removing background...");
      }
    });

    removedBlob = blob;
    removedUrl = URL.createObjectURL(blob);

    selectedBackground = "transparent";
    createBackgroundControls();
    await renderFinal();

    setProgress(100, "Complete");
    setStatus("Completed");
    aiModalComplete();
  } catch (error) {
    console.error("Background removal error:", error);
    setStatus("Failed");
    aiModalFail(
      error?.message ||
      "Background removal failed. Please try again with a JPG, PNG or WEBP image."
    );
  } finally {
    setProcessing(false);
  }
}


aiModalClose?.addEventListener("click", () => {
  if (aiModalClose.dataset.processing === "true") return;
  closeAiModal(true);
});

aiModal?.addEventListener("click", (e) => {
  if (e.target.classList.contains("ai-modal-backdrop") &&
      aiModalClose?.dataset.processing !== "true") {
    closeAiModal(true);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" &&
      aiModal?.classList.contains("show") &&
      aiModalClose?.dataset.processing !== "true") {
    closeAiModal(true);
  }
});

function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    alert("Please select a valid JPG, PNG or WEBP image.");
    return;
  }

  selectedFile = file;
  clearResult();
  showOriginal(file);
  setStatus("Ready");
  selectedBackground = "transparent";
  createBackgroundControls();
}

if (selectBtn && imageInput) {
  selectBtn.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    imageInput.click();
  });
}
imageInput?.addEventListener("change", e => loadFile(e.target.files?.[0]));

uploadArea?.addEventListener("click", e => {
  if (e.target === imageInput || e.target.closest("#selectBtn")) return;
  imageInput?.click();
});

uploadArea?.addEventListener("dragover", e => {
  e.preventDefault();
  uploadArea.classList.add("dragover");
});

uploadArea?.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragover");
});

uploadArea?.addEventListener("drop", e => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");
  loadFile(e.dataTransfer?.files?.[0]);
});

document.addEventListener("paste", e => {
  const item = [...(e.clipboardData?.items || [])]
    .find(x => x.type?.startsWith("image/"));
  if (item) loadFile(item.getAsFile());
});

removeBgBtn?.addEventListener("click", processImage);

resetBtn?.addEventListener("click", () => {
  selectedFile = null;
  clearResult();
  if (imageInput) imageInput.value = "";
  if (beforeImg) {
    beforeImg.removeAttribute("src");
    beforeImg.style.display = "none";
  }
  if (originalPreview) {
    originalPreview.removeAttribute("src");
    originalPreview.style.display = "none";
  }
  uploadPreview?.classList.remove("has-image");
  if (fileSize) fileSize.textContent = "0 KB";
  if (resolution) resolution.textContent = "0 × 0";
  setStatus("Waiting...");
  setProgress(0, "Preparing AI...");
  const controls = $("backgroundControls");
  controls?.remove();
});
