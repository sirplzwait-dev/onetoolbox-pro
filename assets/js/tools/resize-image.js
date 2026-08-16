/* =========================================================
   IMAGE RESIZER — PAGE JS
   Header/Footer are injected by app.js.
   Heading is rendered from the common placeholder below,
   so the HTML contains no hard-coded heading markup.
   ========================================================= */
(function () {
  "use strict";

  function renderCommonToolHeading() {
    const host = document.getElementById("tool-heading-placeholder");
    if (!host) return;

    const title = host.dataset.toolTitle || "";
    const description = host.dataset.toolDescription || "";

    host.innerHTML = `
      <div class="container">
        <h1>${title}</h1>
        <p>${description}</p>
      </div>
    `;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderCommonToolHeading);
  } else {
    renderCommonToolHeading();
  }
})();
// =====================================
// RESIZE IMAGE TOOL JS
// OneToolBox Final
// =====================================


const imageInput = document.getElementById("imageInput");
const uploadArea = document.getElementById("uploadArea");
const resetBtn = document.getElementById("resetBtn");
const resetSettingsBtn = document.getElementById("resetSettingsBtn");


const originalPreview = document.getElementById("originalPreview");
const resizedPreview = document.getElementById("resizedPreview");

const resultText = document.getElementById("resultText");


const uploadIcon = document.getElementById("uploadIcon");
const uploadText = document.getElementById("uploadText");
const uploadInfo = document.getElementById("uploadInfo");


const originalSize = document.getElementById("originalSize");
const originalDimension = document.getElementById("originalDimension");


const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");


const dpiInput = document.getElementById("dpiInput");


const widthUnit = document.getElementById("widthUnit");
const heightUnit = document.getElementById("heightUnit");


const ratioLock = document.getElementById("ratioLock");


const resizeBtn = document.getElementById("resizeBtn");
const downloadBtn = document.getElementById("downloadBtn");


const newDimension = document.getElementById("newDimension");
const newSize = document.getElementById("newSize");



let image = null;

let aspectRatio = 1;

let currentUnit = "px";

let originalWidth = 0;

let originalHeight = 0;








// ==========================
// UNIT CHANGE
// ==========================
document.querySelectorAll('input[name="unit"]').forEach(radio => {
  radio.addEventListener("change", () => {
    if (!radio.checked) return;
    currentUnit = radio.value;
    widthUnit.innerText = currentUnit;
    heightUnit.innerText = currentUnit;
    if (image) showUnitValue();
  });
});

// ==========================
// SELECT IMAGE
// ==========================


uploadArea.addEventListener("click",()=>{

imageInput.click();

});





imageInput.addEventListener("change",(e)=>{


loadImage(e.target.files[0]);


});








function loadImage(file){


if(!file) return;



let url = URL.createObjectURL(file);


let img = new Image();



img.onload = ()=>{


image = img;


originalWidth = img.width;

originalHeight = img.height;


aspectRatio = originalWidth / originalHeight;



originalPreview.src=url;

originalPreview.style.display="block";



uploadIcon.style.display="none";

uploadText.style.display="none";

uploadInfo.style.display="none";



originalSize.innerText=formatSize(file.size);



originalDimension.innerText =
`${originalWidth} × ${originalHeight} px`;



widthInput.value=originalWidth;

heightInput.value=originalHeight;



};



img.src=url;


}









// ==========================
// ASPECT RATIO
// ==========================


widthInput.addEventListener("input",()=>{


if(ratioLock.checked && image){


let width = Number(widthInput.value);



if(currentUnit==="px"){


heightInput.value =
Math.round(width / aspectRatio);


}

else{


heightInput.value =
(width / aspectRatio).toFixed(2);


}


}



});







heightInput.addEventListener("input",()=>{


if(ratioLock.checked && image){


let height = Number(heightInput.value);



if(currentUnit==="px"){


widthInput.value =
Math.round(height * aspectRatio);


}

else{


widthInput.value =
(height * aspectRatio).toFixed(2);


}


}



});









// ==========================
// UNIT DISPLAY
// ==========================


function showUnitValue(){


let dpi =
Number(dpiInput.value)||300;



if(currentUnit==="cm"){


widthInput.value =
(originalWidth*2.54/dpi).toFixed(2);


heightInput.value =
(originalHeight*2.54/dpi).toFixed(2);


}



else if(currentUnit==="inch"){


widthInput.value =
(originalWidth/dpi).toFixed(2);


heightInput.value =
(originalHeight/dpi).toFixed(2);


}



else{


widthInput.value=originalWidth;

heightInput.value=originalHeight;


}


}









// ==========================
// CONVERT PX
// ==========================


function convertToPixel(value){


let dpi =
Number(dpiInput.value)||300;



if(currentUnit==="cm"){


return Math.round(value*dpi/2.54);


}



if(currentUnit==="inch"){


return Math.round(value*dpi);


}



return Math.round(value);


}









// ==========================
// RESIZE
// ==========================
resizeBtn.addEventListener("click", () => {
  if (!image) {
    alert("Please upload image first");
    return;
  }

  let width = convertToPixel(Number(widthInput.value));
  let height = convertToPixel(Number(heightInput.value));

  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    alert("Please enter valid width and height.");
    return;
  }

  // Prevent accidental browser/memory overload.
  const maxPixels = 40_000_000;
  if (width * height > maxPixels) {
    alert("The selected dimensions are too large. Please use smaller dimensions.");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { alpha: true });
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, width, height);

  // Show a reliable local preview immediately using a data URL.
  try {
    const previewUrl = canvas.toDataURL("image/png");
    resizedPreview.src = previewUrl;
    resizedPreview.style.display = "block";
    resultText.style.display = "none";
  } catch (error) {
    console.error("Preview generation failed:", error);
    resizedPreview.style.display = "none";
    resultText.style.display = "block";
    resultText.textContent = "Preview could not be generated. Please try smaller dimensions.";
  }

  canvas.toBlob(blob => {
    if (!blob) {
      alert("Could not create the resized image. Please try again.");
      return;
    }

    if (resizedPreview.src === "") {
      const previewUrl = URL.createObjectURL(blob);
      resizedPreview.src = previewUrl;
      resizedPreview.style.display = "block";
      resultText.style.display = "none";
    }

    const downloadUrl = URL.createObjectURL(blob);
    downloadBtn.href = downloadUrl;
    downloadBtn.download = "resized-image.png";
    downloadBtn.classList.remove("disabled");
    downloadBtn.setAttribute("aria-disabled", "false");

    newDimension.innerText = `${width} × ${height} px`;
    newSize.innerText = formatSize(blob.size);
  }, "image/png");
});


// ==========================
// RESET SETTINGS ONLY
// Keeps the uploaded image but restores resize controls.
// ==========================
function resetSettings() {
  currentUnit = "px";

  document.querySelectorAll('input[name="unit"]').forEach(radio => {
    radio.checked = radio.value === "px";
  });

  widthUnit.innerText = "px";
  heightUnit.innerText = "px";
  dpiInput.value = 300;
  ratioLock.checked = true;

  if (image) {
    widthInput.value = originalWidth;
    heightInput.value = originalHeight;
  } else {
    widthInput.value = "";
    heightInput.value = "";
  }

  resizedPreview.removeAttribute("src");
  resizedPreview.style.display = "none";
  resultText.style.display = "block";
  resultText.textContent = "Resize result will appear here";
  newDimension.innerText = "0 × 0 px";
  newSize.innerText = "0 KB";

  downloadBtn.href = "#";
  downloadBtn.classList.add("disabled");
  downloadBtn.setAttribute("aria-disabled", "true");
}

if (resetSettingsBtn) {
  resetSettingsBtn.addEventListener("click", resetSettings);
}


// ==========================
// RESET
// ==========================


resetBtn.addEventListener("click",()=>{


image=null;


imageInput.value="";


originalPreview.src="";

resizedPreview.src="";



resultText.style.display="block";



originalPreview.style.display="none";



uploadIcon.style.display="block";

uploadText.style.display="block";

uploadInfo.style.display="block";



originalSize.innerText="0 KB";


originalDimension.innerText="0 × 0 px";


newDimension.innerText="0 × 0 px";


newSize.innerText="0 KB";


widthInput.value="";

heightInput.value="";

ratioLock.checked=true;
currentUnit="px";
document.querySelectorAll('input[name="unit"]').forEach(radio=>{
  radio.checked = radio.value === "px";
});
widthUnit.innerText="px";
heightUnit.innerText="px";
dpiInput.value=300;
downloadBtn.href="#";
downloadBtn.classList.add("disabled");
downloadBtn.setAttribute("aria-disabled","true");

});









// ==========================
// DRAG DROP
// ==========================


uploadArea.addEventListener("dragover",(e)=>{

e.preventDefault();

});



uploadArea.addEventListener("drop",(e)=>{


e.preventDefault();


loadImage(e.dataTransfer.files[0]);


});









// ==========================
// SIZE FORMAT
// ==========================


function formatSize(bytes){


if(bytes<1024)

return bytes+" Bytes";



if(bytes<1024*1024)

return (bytes/1024).toFixed(2)+" KB";



return (bytes/(1024*1024)).toFixed(2)+" MB";


}
// ==========================
// EXTRA INPUT UX
// ==========================
document.addEventListener("paste", e => {
  const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith("image/"));
  if (item) loadImage(item.getAsFile());
});

["dragenter","dragover"].forEach(type => uploadArea.addEventListener(type, e => {
  e.preventDefault();
  uploadArea.classList.add("drag");
}));
["dragleave","drop"].forEach(type => uploadArea.addEventListener(type, e => {
  e.preventDefault();
  uploadArea.classList.remove("drag");
}));
uploadArea.addEventListener("drop", e => {
  const file = e.dataTransfer.files?.[0];
  if (file) loadImage(file);
});
