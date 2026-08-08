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
// Compress Image
// ==========================================

async function compressImage(file) {

    return new Promise((resolve) => {

        const reader = new FileReader();

        reader.onload = e => {

            const img = new Image();

            img.onload = () => {

                let width = img.width;
                let height = img.height;

                const MAX = 1024;

                if (width > height && width > MAX) {

                    height = Math.round(height * MAX / width);
                    width = MAX;

                } else if (height > MAX) {

                    width = Math.round(width * MAX / height);
                    height = MAX;

                }

                const canvas = document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL("image/jpeg", 0.75));

            };

            img.src = e.target.result;

        };

        reader.readAsDataURL(file);

    });

}

// ==========================================
// Select Image
// ==========================================

selectBtn?.addEventListener("click", () => {

    imageInput.click();

});

imageInput?.addEventListener("change", e => {

    if (!e.target.files.length) return;

    loadImage(e.target.files[0]);

});

// ==========================================
// Load Image
// ==========================================

function loadImage(file) {

    selectedFile = file;

    const reader = new FileReader();

    reader.onload = e => {

        beforeImg.src = e.target.result;

        beforeImg.style.display = "block";

        afterImg.style.display = "none";

        downloadBtn.style.display = "none";

        resultPlaceholder.style.display = "none";

        statusText.textContent = "Ready";

        fileSize.textContent =
            (file.size / 1024).toFixed(1) + " KB";

        const img = new Image();

        img.onload = () => {

            resolution.textContent =
                img.width + " × " + img.height;

        };

        img.src = e.target.result;

    };

    reader.readAsDataURL(file);

}

// ==========================================
// Drag & Drop
// ==========================================

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

    if (e.dataTransfer.files.length) {

        loadImage(e.dataTransfer.files[0]);

    }

});

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

removeBgBtn?.addEventListener("click", async () => {

    if (!selectedFile) {
        alert("Please select an image first.");
        return;
    }

    loader.style.display = "block";
    processingText.style.display = "block";
    statusText.textContent = "Compressing Image...";

    removeBgBtn.disabled = true;

    try {

        // Compress image before upload
        const base64Image = await compressImage(selectedFile);

        statusText.textContent = "Removing Background...";

      const response = await fetch("/.netlify/functions/remove-background", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        image: base64Image
    })
});

const responseText = await response.text();

console.log("Function Status:", response.status);
console.log("Function Response:", responseText);

let result = {};

try {
    result = responseText ? JSON.parse(responseText) : {};
} catch (e) {
    throw new Error(
        `Server returned invalid response. HTTP ${response.status}\n\n${responseText || "Empty response"}`
    );
}

if (!response.ok || !result.success) {
    throw new Error(
        result.error || `Background remove failed. HTTP ${response.status}`
    );
}





// ==========================================
// Reset
// ==========================================

resetBtn?.addEventListener("click", () => {

    selectedFile = null;

    imageInput.value = "";

    beforeImg.src = "";
    beforeImg.style.display = "none";

    afterImg.src = "";
    afterImg.style.display = "none";

    downloadBtn.style.display = "none";

    if (resultPlaceholder)
        resultPlaceholder.style.display = "block";

    if (fileSize)
        fileSize.textContent = "0 KB";

    if (resolution)
        resolution.textContent = "0 × 0";

    if (statusText)
        statusText.textContent = "Waiting...";

});

// ==========================================
// Download
// ==========================================

downloadBtn?.addEventListener("click", () => {

    console.log("Download Started");

});

// ==========================================
// Startup
// ==========================================

window.addEventListener("load", () => {

    console.log("OneToolBox Remove Background Ready");

});
