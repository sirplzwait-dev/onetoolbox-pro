/* =========================================================
   OneToolBox - Image OCR
   Browser-side OCR using Tesseract.js
   ========================================================= */

const imageInput = document.getElementById("imageInput");
const uploadArea = document.getElementById("uploadArea");
const uploadIcon = document.getElementById("uploadIcon");
const uploadText = document.getElementById("uploadText");
const uploadInfo = document.getElementById("uploadInfo");
const imagePreview = document.getElementById("imagePreview");
const fileName = document.getElementById("fileName");

const ocrLanguage = document.getElementById("ocrLanguage");
const ocrScale = document.getElementById("ocrScale");
const runOcrBtn = document.getElementById("runOcrBtn");
const resetBtn = document.getElementById("resetBtn");
const resetSettingsBtn = document.getElementById("resetSettingsBtn");

const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const statusText = document.getElementById("statusText");

const resultText = document.getElementById("resultText");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const charCount = document.getElementById("charCount");

let selectedFile = null;
let imageURL = null;
let busy = false;

function setProgress(value) {
    const pct = Math.max(0, Math.min(100, Math.round(value)));
    progressBar.style.width = pct + "%";
    progressText.textContent = pct + "%";
}

function setStatus(text) {
    statusText.textContent = text;
}

function updateResultState() {
    const hasText = resultText.value.trim().length > 0;
    copyBtn.disabled = !hasText;
    downloadBtn.disabled = !hasText;
    charCount.textContent = resultText.value.length.toLocaleString();
}

function loadImage(file) {
    if (!file) return;

    if (!file.type || !file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
    }

    selectedFile = file;

    if (imageURL) URL.revokeObjectURL(imageURL);
    imageURL = URL.createObjectURL(file);

    imagePreview.src = imageURL;
    imagePreview.style.display = "block";

    uploadIcon.style.display = "none";
    uploadText.style.display = "none";
    uploadInfo.style.display = "none";

    fileName.textContent = file.name;
    runOcrBtn.disabled = false;

    resultText.value = "";
    updateResultState();
    setProgress(0);
    setStatus("Image ready. Click Extract Text.");
}

imageInput?.addEventListener("change", (event) => {
    loadImage(event.target.files?.[0]);
});

uploadArea?.addEventListener("click", (event) => {
    if (
        event.target.closest("label") ||
        event.target.closest("button") ||
        event.target.closest("input")
    ) return;

    imageInput?.click();
});

uploadArea?.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadArea.classList.add("dragover");
});

uploadArea?.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
});

uploadArea?.addEventListener("drop", (event) => {
    event.preventDefault();
    uploadArea.classList.remove("dragover");
    loadImage(event.dataTransfer?.files?.[0]);
});

document.addEventListener("paste", (event) => {
    for (const item of event.clipboardData?.items || []) {
        if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) loadImage(file);
            break;
        }
    }
});

async function runOCR() {
    if (!selectedFile || busy) return;

    if (typeof Tesseract === "undefined") {
        alert("OCR library could not be loaded. Please check your internet connection and try again.");
        return;
    }

    busy = true;
    runOcrBtn.disabled = true;
    setProgress(0);
    setStatus("Preparing OCR...");

    try {
        const scale = Number(ocrScale.value || 1);

        const worker = await Tesseract.createWorker(
            ocrLanguage.value || "eng",
            1,
            {
                logger: (message) => {
                    if (typeof message.progress === "number") {
                        setProgress(message.progress * 100);
                    }

                    if (message.status) {
                        setStatus(
                            message.status
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, c => c.toUpperCase())
                        );
                    }
                }
            }
        );

        const source = await createScaledImage(selectedFile, scale);

        const result = await worker.recognize(source);

        resultText.value = (result?.data?.text || "").trim();

        await worker.terminate();

        setProgress(100);
        setStatus(resultText.value ? "OCR completed successfully." : "No readable text was found.");
        updateResultState();

        if (resultText.value) {
            resultText.focus();
        }
    } catch (error) {
        console.error("Image OCR error:", error);
        setStatus("OCR failed.");
        alert(error?.message || "OCR failed. Please try another image.");
    } finally {
        busy = false;
        runOcrBtn.disabled = !selectedFile;
    }
}

function createScaledImage(file, scale) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
                canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

                const ctx = canvas.getContext("2d");
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                URL.revokeObjectURL(url);
                resolve(canvas);
            } catch (error) {
                URL.revokeObjectURL(url);
                reject(error);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Could not read the selected image."));
        };

        img.src = url;
    });
}

runOcrBtn?.addEventListener("click", runOCR);

resultText?.addEventListener("input", updateResultState);

copyBtn?.addEventListener("click", async () => {
    const text = resultText.value.trim();
    if (!text) return;

    try {
        await navigator.clipboard.writeText(text);
        setStatus("Text copied to clipboard.");
    } catch {
        resultText.select();
        document.execCommand("copy");
        setStatus("Text copied.");
    }
});

downloadBtn?.addEventListener("click", () => {
    const text = resultText.value;
    if (!text.trim()) return;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "onetoolbox-ocr-text.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
});

function resetSettings() {
    ocrLanguage.value = "eng";
    ocrScale.value = "1.5";
    setStatus(selectedFile ? "Settings reset." : "Choose an image to begin.");
}

resetSettingsBtn?.addEventListener("click", resetSettings);

resetBtn?.addEventListener("click", () => {
    selectedFile = null;

    if (imageURL) {
        URL.revokeObjectURL(imageURL);
        imageURL = null;
    }

    imageInput.value = "";
    imagePreview.src = "";
    imagePreview.style.display = "none";

    uploadIcon.style.display = "";
    uploadText.style.display = "";
    uploadInfo.style.display = "";

    fileName.textContent = "No image selected";
    resultText.value = "";
    runOcrBtn.disabled = true;

    setProgress(0);
    setStatus("Choose an image to begin.");
    updateResultState();
});

updateResultState();
