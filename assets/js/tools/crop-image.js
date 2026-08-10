// ======================================
// OneToolBox Crop Image Tool - Fixed
// ======================================

let cropper = null;
let currentFile = null;
let resultUrl = null;
let scaleX = 1;
let scaleY = 1;
let currentRotation = 0;
let currentZoom = 1;
let currentBackground = "#ffffff";

const $ = id => document.getElementById(id);

const imageInput = $("imageInput");
const cropImage = $("cropImage");
const uploadIcon = $("uploadIcon");
const uploadText = $("uploadText");
const uploadInfo = $("uploadInfo");
const uploadArea = $("uploadArea");

const fileName = $("fileName");
const originalSize = $("originalSize");
const originalResolution = $("originalResolution");
const originalFormat = $("originalFormat");

const resultImage = $("resultImage");
const resultText = $("resultText");
const newSize = $("newSize");
const newResolution = $("newResolution");
const newFormat = $("newFormat");
const downloadBtn = $("downloadBtn");

const resetBtn = $("resetBtn");
const resetCropBtn = $("resetCrop");
const cropBtn = $("cropBtn");

const rotationRange = $("rotationRange");
const rotationValue = $("rotationValue");
const resetRotation = $("resetRotation");
const zoomRange = $("zoomRange");
const qualityRange = $("qualityRange");
const qualityValue = $("qualityValue");
const formatSelect = $("formatSelect");
const moveMode = $("moveMode");
const cropMode = $("cropMode");


// ======================================
// SAFE ELEMENT CHECK
// ======================================
function exists(el){
    return !!el;
}


// ======================================
// LOAD IMAGE
// ======================================
function loadImage(file){

    if(!file) return;

    if(!file.type || !file.type.startsWith("image/")){
        alert("Please choose a valid image file.");
        return;
    }

    currentFile = file;

    fileName.textContent = file.name;
    originalSize.textContent = formatSize(file.size);
    originalFormat.textContent = formatName(file.type);

    const reader = new FileReader();

    reader.onload = function(e){

        cropImage.src = e.target.result;
        cropImage.style.display = "block";

        uploadIcon.style.display = "none";
        uploadText.style.display = "none";
        uploadInfo.style.display = "none";

        cropImage.onload = function(){

            originalResolution.textContent =
                cropImage.naturalWidth + " × " +
                cropImage.naturalHeight + " px";

            createCropper();
        };
    };

    reader.onerror = function(){
        alert("Unable to read the image.");
    };

    reader.readAsDataURL(file);
}


// ======================================
// CREATE CROPPER
// ======================================
function createCropper(){

    if(typeof Cropper === "undefined"){
        alert("Cropper.js could not be loaded. Please check your internet connection or CDN.");
        return;
    }

    if(cropper){
        cropper.destroy();
        cropper = null;
    }

    scaleX = 1;
    scaleY = 1;
    currentRotation = 0;
    currentZoom = 1;

    rotationRange.value = 0;
    rotationValue.textContent = "0°";
    zoomRange.value = 1;

    cropper = new Cropper(cropImage, {
        viewMode: 1,
        dragMode: "crop",
        autoCropArea: 0.88,
        responsive: true,
        restore: false,
        checkCrossOrigin: false,
        background: false,
        movable: true,
        zoomable: true,
        rotatable: true,
        scalable: true,
        cropBoxMovable: true,
        cropBoxResizable: true,
        guides: true,
        center: true,
        highlight: true,
        toggleDragModeOnDblclick: false,
        ready(){
            if(aspectRatioSelect) setRatio(aspectRatioSelect.value);
            setCropMode("crop");
        }
    });
}


// ======================================
// FILE INPUT
// ======================================
if(exists(imageInput)){
    imageInput.addEventListener("change", e => {
        if(e.target.files && e.target.files[0]){
            loadImage(e.target.files[0]);
        }
    });
}


// ======================================
// DRAG & DROP
// ======================================
if(exists(uploadArea)){

    ["dragenter","dragover"].forEach(name => {
        uploadArea.addEventListener(name, e => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.add("dragging");
        });
    });

    ["dragleave","drop"].forEach(name => {
        uploadArea.addEventListener(name, e => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove("dragging");
        });
    });

    uploadArea.addEventListener("drop", e => {
        if(e.dataTransfer.files && e.dataTransfer.files[0]){
            loadImage(e.dataTransfer.files[0]);
        }
    });
}


// ======================================
// PASTE
// ======================================
document.addEventListener("paste", e => {

    if(!e.clipboardData || !e.clipboardData.items) return;

    for(const item of e.clipboardData.items){

        if(item.type && item.type.startsWith("image/")){

            const file = item.getAsFile();

            if(file) loadImage(file);

            break;
        }
    }
});


// ======================================
// ASPECT RATIO
// ======================================
const aspectRatioSelect = $("aspectRatioSelect");

if(exists(aspectRatioSelect)){
    aspectRatioSelect.addEventListener("change", function(){
        setRatio(this.value);
    });
}

function setRatio(value){

    if(!cropper) return;

    if(value === "free" || value === "NaN" || value === ""){
        cropper.setAspectRatio(NaN);
        return;
    }

    const ratio = parseFloat(value);

    if(Number.isFinite(ratio) && ratio > 0){
        cropper.setAspectRatio(ratio);
    }
}


// ======================================
// ROTATE BUTTONS
// ======================================
if(exists($("rotateLeft"))){
    $("rotateLeft").addEventListener("click", () => {
        if(!cropper) return;
        cropper.rotate(-90);
        currentRotation = normalizeRotation(currentRotation - 90);
        updateRotationUI();
    });
}

if(exists($("rotateRight"))){
    $("rotateRight").addEventListener("click", () => {
        if(!cropper) return;
        cropper.rotate(90);
        currentRotation = normalizeRotation(currentRotation + 90);
        updateRotationUI();
    });
}


// ======================================
// ROTATION SLIDER
// ======================================
if(exists(rotationRange)){

    rotationRange.addEventListener("input", function(){

        if(!cropper) return;

        const target = Number(this.value);
        const delta = target - currentRotation;

        if(delta !== 0){
            cropper.rotate(delta);
        }

        currentRotation = target;
        updateRotationUI();
    });
}

function normalizeRotation(value){
    let n = value;
    while(n > 180) n -= 360;
    while(n < -180) n += 360;
    return n;
}

function updateRotationUI(){
    if(rotationRange) rotationRange.value = currentRotation;
    if(rotationValue) rotationValue.textContent = currentRotation + "°";
}


// ======================================
// RESET ROTATION
// ======================================
if(exists(resetRotation)){
    resetRotation.addEventListener("click", () => {

        if(!cropper) return;

        const delta = -currentRotation;

        if(delta !== 0){
            cropper.rotate(delta);
        }

        currentRotation = 0;
        updateRotationUI();
    });
}


// ======================================
// FLIP
// ======================================
if(exists($("flipHorizontal"))){
    $("flipHorizontal").addEventListener("click", () => {
        if(!cropper) return;
        scaleX *= -1;
        cropper.scaleX(scaleX);
    });
}

if(exists($("flipVertical"))){
    $("flipVertical").addEventListener("click", () => {
        if(!cropper) return;
        scaleY *= -1;
        cropper.scaleY(scaleY);
    });
}


// ======================================
// ZOOM BUTTONS
// ======================================
if(exists($("zoomIn"))){
    $("zoomIn").addEventListener("click", () => {
        if(!cropper) return;
        cropper.zoom(0.1);
        currentZoom = Math.min(3, currentZoom + 0.1);
        zoomRange.value = currentZoom.toFixed(2);
    });
}

if(exists($("zoomOut"))){
    $("zoomOut").addEventListener("click", () => {
        if(!cropper) return;
        cropper.zoom(-0.1);
        currentZoom = Math.max(0.1, currentZoom - 0.1);
        zoomRange.value = currentZoom.toFixed(2);
    });
}

if(exists(zoomRange)){
    zoomRange.addEventListener("input", function(){
        if(!cropper) return;
        const target = Number(this.value);
        cropper.zoomTo(target);
        currentZoom = target;
    });
}


// ======================================
// MOVE / CROP MODE
// ======================================
function setCropMode(mode){

    if(!cropper) return;

    cropper.setDragMode(mode);

    if(moveMode) moveMode.classList.toggle("active", mode === "move");
    if(cropMode) cropMode.classList.toggle("active", mode === "crop");
}

if(exists(moveMode)){
    moveMode.addEventListener("click", () => setCropMode("move"));
}

if(exists(cropMode)){
    cropMode.addEventListener("click", () => setCropMode("crop"));
}


// ======================================
// RESET CROP ONLY
// ======================================
if(exists(resetCropBtn)){

    resetCropBtn.addEventListener("click", () => {

        if(!cropper){
            alert("Please upload an image first.");
            return;
        }

        // Reset image transform and crop box.
        cropper.reset();

        scaleX = 1;
        scaleY = 1;
        currentRotation = 0;
        currentZoom = 1;

        updateRotationUI();
        zoomRange.value = "1";

        // Restore the currently selected aspect ratio.
        if(aspectRatioSelect) setRatio(aspectRatioSelect.value);

        setCropMode("crop");
    });
}


// ======================================
// QUALITY SLIDER
// ======================================
if(exists(qualityRange)){

    qualityRange.addEventListener("input", function(){
        if(qualityValue){
            qualityValue.textContent = this.value + "%";
        }
    });
}


// ======================================
// BACKGROUND BUTTONS
// ======================================
document.querySelectorAll(".background-btn").forEach(btn => {

    btn.addEventListener("click", function(){

        document.querySelectorAll(".background-btn")
            .forEach(b => b.classList.remove("active"));

        this.classList.add("active");

        currentBackground = this.dataset.color || "#ffffff";
    });
});


// ======================================
// CROP / EXPORT
// ======================================
if(exists(cropBtn)){

    cropBtn.addEventListener("click", () => {

        if(!cropper){
            alert("Please upload an image first.");
            return;
        }

        cropBtn.disabled = true;
        cropBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cropping...';

        const outputType = formatSelect.value;
        const quality = Number(qualityRange.value) / 100;

        const canvas = cropper.getCroppedCanvas({
            imageSmoothingEnabled: true,
            imageSmoothingQuality: "high",
            fillColor: outputType === "image/jpeg" ? getJpgBackground() : "transparent"
        });

        if(!canvas){
            alert("Unable to create the cropped image.");
            finishCropButton();
            return;
        }

        if(outputType === "image/jpeg"){

            const finalCanvas = document.createElement("canvas");
            finalCanvas.width = canvas.width;
            finalCanvas.height = canvas.height;

            const ctx = finalCanvas.getContext("2d");
            ctx.fillStyle = getJpgBackground();
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            ctx.drawImage(canvas, 0, 0);

            exportCanvas(finalCanvas, outputType, quality);

        }else{

            exportCanvas(canvas, outputType, quality);
        }
    });
}

function getJpgBackground(){
    // JPG cannot store transparency. White is the safe fallback.
    return currentBackground === "transparent"
        ? "#ffffff"
        : currentBackground;
}

function exportCanvas(canvas, type, quality){

    canvas.toBlob(blob => {

        if(!blob){
            alert("Unable to create the selected output format.");
            finishCropButton();
            return;
        }

        if(resultUrl){
            URL.revokeObjectURL(resultUrl);
        }

        resultUrl = URL.createObjectURL(blob);

        resultImage.src = resultUrl;
        resultImage.style.display = "block";
        resultText.style.display = "none";

        newSize.textContent = formatSize(blob.size);
        newResolution.textContent = canvas.width + " × " + canvas.height + " px";
        newFormat.textContent = formatName(type);

        downloadBtn.href = resultUrl;
        downloadBtn.download = "cropped-image." + extension(type);
        downloadBtn.classList.remove("disabled");
        downloadBtn.setAttribute("aria-disabled", "false");

        finishCropButton();

    }, type, quality);
}


// ======================================
// FINISH CROP BUTTON
// ======================================
function finishCropButton(){
    cropBtn.disabled = false;
    cropBtn.innerHTML = '<i class="fa-solid fa-crop-simple"></i> Crop Image';
}


// ======================================
// RESET EVERYTHING
// ======================================
if(exists(resetBtn)){
    resetBtn.addEventListener("click", resetTool);
}

function resetTool(){

    if(cropper){
        cropper.destroy();
        cropper = null;
    }

    if(resultUrl){
        URL.revokeObjectURL(resultUrl);
        resultUrl = null;
    }

    currentFile = null;
    scaleX = 1;
    scaleY = 1;
    currentRotation = 0;
    currentZoom = 1;
    currentBackground = "#ffffff";

    imageInput.value = "";

    cropImage.removeAttribute("src");
    cropImage.style.display = "none";

    uploadIcon.style.display = "";
    uploadText.style.display = "";
    uploadInfo.style.display = "";

    fileName.textContent = "-";
    originalSize.textContent = "0 KB";
    originalResolution.textContent = "0 × 0 px";
    originalFormat.textContent = "-";

    resultImage.removeAttribute("src");
    resultImage.style.display = "none";
    resultText.style.display = "";

    newSize.textContent = "0 KB";
    newResolution.textContent = "0 × 0 px";
    newFormat.textContent = "-";

    downloadBtn.removeAttribute("href");
    downloadBtn.removeAttribute("download");
    downloadBtn.classList.add("disabled");
    downloadBtn.setAttribute("aria-disabled", "true");

    rotationRange.value = "0";
    rotationValue.textContent = "0°";
    zoomRange.value = "1";
    qualityRange.value = "90";
    qualityValue.textContent = "90%";
    formatSelect.value = "image/jpeg";

    document.querySelectorAll(".background-btn")
        .forEach(b => b.classList.remove("active"));

    const white = document.querySelector('.background-btn[data-color="#ffffff"]');
    if(white) white.classList.add("active");

    if(aspectRatioSelect) aspectRatioSelect.value = "free";

    setCropMode("crop");
    finishCropButton();
}


// ======================================
// HELPERS
// ======================================
function formatName(type){
    if(!type) return "-";
    return type.replace("image/", "").toUpperCase();
}

function extension(type){
    if(type === "image/jpeg") return "jpg";
    if(type === "image/webp") return "webp";
    return "png";
}

function formatSize(bytes){
    if(!bytes || bytes < 1024) return (bytes || 0) + " Bytes";
    if(bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}
