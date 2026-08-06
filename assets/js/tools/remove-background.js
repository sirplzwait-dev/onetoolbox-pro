// ==========================================
// OneToolBox - Remove Background
// ==========================================

const uploadArea = document.getElementById("uploadArea");
const imageInput = document.getElementById("imageInput");
const selectBtn = document.getElementById("selectBtn");

const beforeImg = document.getElementById("beforeImg");
const afterImg = document.getElementById("afterImg");

const removeBgBtn = document.getElementById("removeBgBtn");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn");

const loader = document.getElementById("loader");
const processingText = document.getElementById("processingText");

const fileSize = document.getElementById("fileSize");
const resolution = document.getElementById("resolution");
const statusText = document.getElementById("statusText");
const resultPlaceholder = document.getElementById("resultPlaceholder");

let selectedFile = null;

// ==========================================
// Select Image
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    if (selectBtn && imageInput) {
        selectBtn.addEventListener("click", () => {
            imageInput.click();
        });
    }
});

if (imageInput) {
    imageInput.addEventListener("change", e => {
        if (e.target.files.length) {
            loadImage(e.target.files[0]);
        }
    });
}

// ==========================================
// Load Image
// ==========================================

function loadImage(file){
    selectedFile = file;
    const reader = new FileReader();

    reader.onload = e => {
        if (beforeImg) {
            beforeImg.src = e.target.result;
            beforeImg.style.display = "block";
        }
        if (afterImg) afterImg.style.display = "none";
        if (resultPlaceholder) resultPlaceholder.style.display = "none";
        if (statusText) statusText.textContent = "Ready";
        if (fileSize) fileSize.textContent = (file.size / 1024).toFixed(1) + " KB";

        const img = new Image();
        img.onload = () => {
            if (resolution) resolution.textContent = img.width + " × " + img.height;
        }
        img.src = e.target.result;
    }

    reader.readAsDataURL(file);
}

// ==========================================
// Drag & Drop
// ==========================================

if (uploadArea) {
    uploadArea.addEventListener("dragover", e => {
        e.preventDefault();
        uploadArea.classList.add("dragover");
    });

    uploadArea.addEventListener("dragleave", () => {
        uploadArea.classList.remove("dragover");
    });

    uploadArea.addEventListener("drop", e => {
        e.preventDefault();
        uploadArea.classList.remove("dragover");
        if (e.dataTransfer.files.length) {
            loadImage(e.dataTransfer.files[0]);
        }
    });
}

// ==========================================
// Paste Image
// ==========================================

document.addEventListener("paste", e => {
    const items = e.clipboardData.items;
    for (const item of items) {
        if (item.type.startsWith("image")) {
            loadImage(item.getAsFile());
            break;
        }
    }
});

// ==========================================
// Remove Background
// ==========================================

if (removeBgBtn) {
    removeBgBtn.addEventListener("click", async () => {
        const file = selectedFile || (imageInput && imageInput.files && imageInput.files[0]);

        if (!file) {
            alert("Please select an image first.");
            return;
        }

        if (loader) loader.style.display = "block";
        if (processingText) processingText.style.display = "block";
        if (statusText) statusText.textContent = "Processing...";
        removeBgBtn.disabled = true;

        try {
            const base64Image = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(file);
            });

            const response = await fetch("/api/remove-background", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ image: base64Image })
            });

            if (!response.ok) {
                let errorMsg = "Failed to process image";
                try {
                    const errData = await response.json();
                    errorMsg = errData.error || errorMsg;
                } catch (jsonErr) {
                    const textErr = await response.text();
                    if (textErr) errorMsg = textErr;
                }
                throw new Error(errorMsg);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            if (afterImg) {
                afterImg.src = url;
                afterImg.style.display = "block";
            }
            if (downloadBtn) {
                downloadBtn.href = url;
                downloadBtn.style.display = "flex";
            }
            if (statusText) statusText.textContent = "Completed";

        }
        catch (err) {
            console.error(err);
            alert("Background remove failed.\n\n" + err.message);
            if (statusText) statusText.textContent = "Failed";
        }
        finally {
            if (loader) loader.style.display = "none";
            if (processingText) processingText.style.display = "none";
            removeBgBtn.disabled = false;
        }
    });
}

// ==========================================
// Reset
// ==========================================

if (resetBtn) {
    resetBtn.addEventListener("click", () => {
        selectedFile = null;
        if (imageInput) imageInput.value = "";
        if (beforeImg) {
            beforeImg.src = "";
            beforeImg.style.display = "none";
        }
        if (afterImg) {
            afterImg.src = "";
            afterImg.style.display = "none";
        }
        if (downloadBtn) downloadBtn.style.display = "none";
        if (resultPlaceholder) resultPlaceholder.style.display = "block";
        if (fileSize) fileSize.textContent = "0 KB";
        if (resolution) resolution.textContent = "0 × 0";
        if (statusText) statusText.textContent = "Waiting...";
    });
}