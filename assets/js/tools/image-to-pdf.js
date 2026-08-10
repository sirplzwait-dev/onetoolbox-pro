/* OneToolBox Image to PDF */
(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const state = {
    images: [],
    orientation: "portrait",
    fit: "contain",
    pageSize: "A4",
    margin: 10,
    quality: 0.90,
    compression: "medium",
    background: "#ffffff",
    pdfUrl: ""
  };

  const imageInput=$("imageInput"), uploadArea=$("uploadArea"), chooseBtn=$("chooseBtn");
  const imageList=$("imageList"), imageCount=$("imageCount"), pageCount=$("pageCount");
  const totalSize=$("totalSize"), clearAllBtn=$("clearAllBtn");
  const generateBtn=$("generatePdfBtn"), downloadBtn=$("downloadPdfBtn");
  const pdfPreview=$("pdfPreview"), pdfPlaceholder=$("pdfPlaceholder");
  const pdfPages=$("pdfPages"), pdfSize=$("pdfSize");
  const marginRange=$("marginRange"), marginValue=$("marginValue");
  const qualityRange=$("qualityRange"), qualityValue=$("qualityValue");
  const pageSize=$("pageSize"), resetBtn=$("resetSettingsBtn");
  const modal=$("pdfModal"), modalText=$("modalText"), modalStage=$("modalStage");
  const modalProgress=$("modalProgress"), modalPercent=$("modalPercent"), modalDone=$("modalDone");

  const fmt = bytes => bytes < 1024 ? `${bytes} B` :
    bytes < 1048576 ? `${(bytes/1024).toFixed(1)} KB` : `${(bytes/1048576).toFixed(2)} MB`;

  function modalOpen(){
    modal.classList.add("show");
    modal.classList.remove("completed");
    modal.setAttribute("aria-hidden","false");
    setProgress(0,"Preparing","Preparing your images...");
  }
  function modalClose(){
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden","true");
  }
  function setProgress(v,stage,text){
    const n=Math.max(0,Math.min(100,v));
    modalProgress.style.width=n+"%";
    modalPercent.textContent=Math.round(n)+"%";
    modalStage.textContent=stage;
    modalText.textContent=text;
  }

  function addFiles(files){
    const valid=[...files].filter(f=>/^image\/(jpeg|png|webp)$/.test(f.type));
    if(!valid.length) return;
    valid.forEach(file=>{
      state.images.push({
        file,
        url:URL.createObjectURL(file),
        id:crypto.randomUUID ? crypto.randomUUID() : Date.now()+"-"+Math.random()
      });
    });
    renderList();
  }

  function renderList(){
    imageList.innerHTML="";
    if(!state.images.length){
      imageList.innerHTML='<div class="empty-list"><i class="fa-regular fa-images"></i><span>Your selected images will appear here</span></div>';
    } else {
      state.images.forEach((item,index)=>{
        const row=document.createElement("div");
        row.className="image-item";
        row.innerHTML=`
          <img class="image-thumb" src="${item.url}" alt="">
          <div class="image-name">
            <strong title="${escapeHtml(item.file.name)}">${escapeHtml(item.file.name)}</strong>
            <span>${fmt(item.file.size)} • Page ${index+1}</span>
          </div>
          <div class="image-actions">
            <button type="button" title="Move up" data-action="up" data-index="${index}" ${index===0?"disabled":""}><i class="fa-solid fa-chevron-up"></i></button>
            <button type="button" title="Move down" data-action="down" data-index="${index}" ${index===state.images.length-1?"disabled":""}><i class="fa-solid fa-chevron-down"></i></button>
            <button type="button" title="Remove" data-action="remove" data-index="${index}"><i class="fa-solid fa-xmark"></i></button>
          </div>`;
        imageList.appendChild(row);
      });
    }
    const bytes=state.images.reduce((s,x)=>s+x.file.size,0);
    imageCount.textContent=`${state.images.length} image${state.images.length===1?"":"s"}`;
    pageCount.textContent=state.images.length;
    totalSize.textContent=fmt(bytes);
  }

  function escapeHtml(s){
    return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  }

  imageList.addEventListener("click",e=>{
    const b=e.target.closest("button"); if(!b) return;
    const i=Number(b.dataset.index), action=b.dataset.action;
    if(action==="remove") state.images.splice(i,1);
    if(action==="up" && i>0) [state.images[i-1],state.images[i]]=[state.images[i],state.images[i-1]];
    if(action==="down" && i<state.images.length-1) [state.images[i+1],state.images[i]]=[state.images[i],state.images[i+1]];
    renderList();
  });

  chooseBtn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();imageInput.click()});
  imageInput.addEventListener("change",e=>{addFiles(e.target.files);e.target.value=""});

  uploadArea.addEventListener("dragover",e=>{e.preventDefault();uploadArea.classList.add("dragover")});
  uploadArea.addEventListener("dragleave",()=>uploadArea.classList.remove("dragover"));
  uploadArea.addEventListener("drop",e=>{
    e.preventDefault();uploadArea.classList.remove("dragover");addFiles(e.dataTransfer.files);
  });
  uploadArea.addEventListener("click",e=>{
    if(!e.target.closest("#chooseBtn")) imageInput.click();
  });

  document.addEventListener("paste",e=>{
    const files=[...e.clipboardData.items].filter(i=>i.type.startsWith("image/")).map(i=>i.getAsFile());
    if(files.length)addFiles(files);
  });

  clearAllBtn.addEventListener("click",()=>{
    state.images.forEach(x=>URL.revokeObjectURL(x.url));
    state.images=[]; renderList();
  });

  document.querySelectorAll("[data-orientation]").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll("[data-orientation]").forEach(x=>x.classList.remove("active"));
    b.classList.add("active"); state.orientation=b.dataset.orientation;
  }));
  document.querySelectorAll("[data-fit]").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll("[data-fit]").forEach(x=>x.classList.remove("active"));
    b.classList.add("active"); state.fit=b.dataset.fit;
  }));
  document.querySelectorAll("[data-compression]").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll("[data-compression]").forEach(x=>x.classList.remove("active"));
    b.classList.add("active"); state.compression=b.dataset.compression;
    const q={small:.65,medium:.82,high:.95}[state.compression];
    state.quality=q; qualityRange.value=Math.round(q*100); qualityValue.textContent=Math.round(q*100)+"%";
  }));
  document.querySelectorAll("[data-bg]").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll("[data-bg]").forEach(x=>x.classList.remove("active"));
    b.classList.add("active"); state.background=b.dataset.bg;
  }));

  marginRange.addEventListener("input",()=>{state.margin=+marginRange.value;marginValue.textContent=state.margin+" mm"});
  qualityRange.addEventListener("input",()=>{state.quality=+qualityRange.value/100;qualityValue.textContent=qualityRange.value+"%"});
  pageSize.addEventListener("change",()=>state.pageSize=pageSize.value);

  resetBtn.addEventListener("click",()=>{
    state.orientation="portrait";state.fit="contain";state.pageSize="A4";state.margin=10;state.quality=.90;state.compression="medium";state.background="#ffffff";
    pageSize.value="A4";marginRange.value=10;marginValue.textContent="10 mm";qualityRange.value=90;qualityValue.textContent="90%";
    document.querySelectorAll(".choice").forEach(b=>b.classList.remove("active"));
    document.querySelector('[data-orientation="portrait"]').classList.add("active");
    document.querySelector('[data-fit="contain"]').classList.add("active");
    document.querySelector('[data-compression="medium"]').classList.add("active");
    document.querySelectorAll(".color-choice").forEach(b=>b.classList.remove("active"));
    document.querySelector('[data-bg="#ffffff"]').classList.add("active");
  });

  function loadImage(file){
    return new Promise((resolve,reject)=>{
      const img=new Image();
      const url=URL.createObjectURL(file);
      img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};
      img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Image could not be loaded."))};
      img.src=url;
    });
  }

  function pageFormat(){
    if(state.pageSize==="AUTO") return null;
    return state.pageSize;
  }

  async function generate(){
    if(!state.images.length){alert("Please choose at least one image.");return}
    if(!window.jspdf?.jsPDF){alert("PDF engine is still loading. Please try again.");return}
    generateBtn.disabled=true; modalOpen();
    try{
      const {jsPDF}=window.jspdf;
      let doc=null;
      const format=pageFormat();
      for(let i=0;i<state.images.length;i++){
        setProgress((i/state.images.length)*90,"Processing image",`Adding image ${i+1} of ${state.images.length}...`);
        const img=await loadImage(state.images[i].file);
        let orient=state.orientation;
        if(state.pageSize==="AUTO"){
          orient=img.naturalWidth>img.naturalHeight?"landscape":"portrait";
        }
        if(!doc) doc=new jsPDF({orientation:orient,unit:"mm",format:format||[210,297],compress:true});
        else doc.addPage(format||[210,297],orient);

        const pageW=doc.internal.pageSize.getWidth(), pageH=doc.internal.pageSize.getHeight();
        doc.setFillColor(state.background);
        doc.rect(0,0,pageW,pageH,"F");

        const margin=state.margin;
        const maxW=Math.max(1,pageW-margin*2), maxH=Math.max(1,pageH-margin*2);
        const iw=img.naturalWidth, ih=img.naturalHeight;
        const scale=state.fit==="cover"?Math.max(maxW/iw,maxH/ih):Math.min(maxW/iw,maxH/ih);
        const w=iw*scale,h=ih*scale;
        const x=(pageW-w)/2,y=(pageH-h)/2;

        const canvas=document.createElement("canvas");
        const maxPixels=state.compression==="small"?1400000:state.compression==="medium"?2200000:3500000;
        const ratio=Math.min(1,Math.sqrt(maxPixels/(iw*ih)));
        canvas.width=Math.max(1,Math.round(iw*ratio));
        canvas.height=Math.max(1,Math.round(ih*ratio));
        const ctx=canvas.getContext("2d",{alpha:false});
        ctx.fillStyle=state.background;ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        const data=canvas.toDataURL("image/jpeg",state.quality);
        doc.addImage(data,"JPEG",x,y,w,h,undefined,"FAST");
      }

      setProgress(96,"Finalizing","Creating your PDF...");
      const blob=doc.output("blob");
      if(state.pdfUrl) URL.revokeObjectURL(state.pdfUrl);
      state.pdfUrl=URL.createObjectURL(blob);

      pdfPreview.src=state.pdfUrl;pdfPreview.style.display="block";pdfPlaceholder.style.display="none";
      pdfPages.textContent=state.images.length;pdfSize.textContent=fmt(blob.size);
      const originalName = state.images[0].file.name.replace(/\.[^/.]+$/,"");
      const safe = (originalName + " - OneToolBox").replace(/[\\/:*?"<>|]+/g,"-").trim();
      downloadBtn.href=state.pdfUrl;
      downloadBtn.download=(safe.endsWith(".pdf")?safe:safe+".pdf");
      downloadBtn.classList.remove("disabled");
      setProgress(100,"Completed","Your PDF is ready.");
      modal.classList.add("completed");
    }catch(err){
      console.error(err);setProgress(0,"Error","Could not generate the PDF.");alert("PDF generation failed. Please try again.");
      modalClose();
    }finally{generateBtn.disabled=false}
  }

  generateBtn.addEventListener("click",generate);
  modalDone.addEventListener("click",modalClose);

  renderList();
})();
