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

selectBtn.addEventListener("click", () => {
    imageInput.click();
});

imageInput.addEventListener("change", e => {
    if (e.target.files.length) {
        loadImage(e.target.files[0]);
    }
});


// ==========================================
// Load Image
// ==========================================

function loadImage(file){
    selectedFile = file;
    const reader = new FileReader();

    reader.onload = e => {
        beforeImg.src = e.target.result;
        beforeImg.style.display = "block";
        afterImg.style.display = "none";
        resultPlaceholder.style.display = "none";
        statusText.textContent = "Ready";
        fileSize.textContent = (file.size / 1024).toFixed(1) + " KB";

        const img = new Image();
        img.onload = () => {
            resolution.textContent = img.width + " × " + img.height;
        }
        img.src = e.target.result;
    }

    reader.readAsDataURL(file);
}

// ==========================================
// Drag & Drop
// ==========================================

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

removeBgBtn.addEventListener("click", async () => {

    const fileInput = document.getElementById("imageInput");
    const file = selectedFile || (fileInput.files && fileInput.files[0]);

    if (!file) {
        alert("Please select an image first.");
        return;
    }

    loader.style.display = "block";
    processingText.style.display = "block";
    statusText.textContent = "Processing...";
    removeBgBtn.disabled = true;

    try {
        // Convert file to Base64 safely using a Promise
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
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to process image");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        afterImg.src = url;
        afterImg.style.display = "block";
        downloadBtn.href = url;
        downloadBtn.style.display = "flex";
        statusText.textContent = "Completed";

    }
    catch (err) {
        console.error(err);
        alert("Background remove failed.\n\n" + err.message);
        statusText.textContent = "Failed";
    }
    finally {
        loader.style.display = "none";
        processingText.style.display = "none";
        removeBgBtn.disabled = false;
    }

});


// ==========================================
// Reset
// ==========================================

resetBtn.addEventListener("click", () => {
    selectedFile = null;
    imageInput.value = "";
    beforeImg.src = "";
    afterImg.src = "";
    beforeImg.style.display = "none";
    afterImg.style.display = "none";
    downloadBtn.style.display = "none";
    resultPlaceholder.style.display = "block";
    fileSize.textContent = "0 KB";
    resolution.textContent = "0 × 0";
    statusText.textContent = "Waiting...";
});
```[cite: 7]