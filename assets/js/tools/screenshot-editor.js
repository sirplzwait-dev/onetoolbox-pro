/* ONETOOLBOX SCREENSHOT EDITOR */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("editorCanvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const input1 = document.getElementById("imageInput");
    const input2 = document.getElementById("imageInput2");
    const empty = document.getElementById("emptyState");
    const wrap = document.getElementById("canvasWrap");
    const color = document.getElementById("colorInput");
    const size = document.getElementById("sizeRange");
    const sizeValue = document.getElementById("sizeValue");
    const textInput = document.getElementById("textInput");
    const fontSize = document.getElementById("fontSize");
    const zoom = document.getElementById("zoomRange");
    const zoomValue = document.getElementById("zoomValue");
    const note = document.getElementById("editorNote");
    const undo = document.getElementById("undoBtn");
    const redo = document.getElementById("redoBtn");

    let originalImage = null;
    let tool = "select";
    let drawing = false, startX = 0, startY = 0, snapshot = null;
    let undoStack = [], redoStack = [];
    let scale = 1;

    const setNote = t => note.textContent = t;

    function history() {
        if (!canvas.width) return;
        undoStack.push(ctx.getImageData(0,0,canvas.width,canvas.height));
        if (undoStack.length > 25) undoStack.shift();
        redoStack = [];
        updateHistory();
    }
    function updateHistory() {
        undo.disabled = !undoStack.length;
        redo.disabled = !redoStack.length;
    }
    function restore(data) { ctx.putImageData(data,0,0); }

    function loadFile(file) {
        if (!file || !file.type.startsWith("image/")) return;
        const url = URL.createObjectURL(file), img = new Image();
        img.onload = () => {
            originalImage = img;
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.drawImage(img,0,0);
            canvas.style.display = "block";
            empty.style.display = "none";
            undoStack=[]; redoStack=[]; updateHistory();
            zoom.value=100; scale=1; applyZoom();
            setNote(`${img.naturalWidth} × ${img.naturalHeight}px`);
            URL.revokeObjectURL(url);
        };
        img.onerror = () => { setNote("Unable to open this image."); URL.revokeObjectURL(url); };
        img.src=url;
    }

    input1.addEventListener("change",e=>loadFile(e.target.files[0]));
    input2.addEventListener("change",e=>loadFile(e.target.files[0]));

    document.querySelectorAll(".edit-tool").forEach(btn=>{
        btn.addEventListener("click",()=>{
            document.querySelectorAll(".edit-tool").forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
            tool=btn.dataset.tool;
            setNote(`${btn.textContent.trim()} selected`);
        });
    });

    size.addEventListener("input",()=>sizeValue.textContent=size.value);
    zoom.addEventListener("input",()=>{scale=Number(zoom.value)/100;zoomValue.textContent=zoom.value+"%";applyZoom();});
    function applyZoom(){if(canvas.width){canvas.style.width=Math.round(canvas.width*scale)+"px";canvas.style.height=Math.round(canvas.height*scale)+"px";}}

    function pos(e){
        const r=canvas.getBoundingClientRect();
        return {x:(e.clientX-r.left)*(canvas.width/r.width),y:(e.clientY-r.top)*(canvas.height/r.height)};
    }

    canvas.addEventListener("pointerdown",e=>{
        if(!originalImage)return;
        e.preventDefault();
        const p=pos(e); startX=p.x; startY=p.y; drawing=true;

        if(tool==="text"){
            const text=textInput.value.trim();
            if(!text){setNote("Type text first.");drawing=false;return;}
            history();
            ctx.fillStyle=color.value; ctx.font=`${fontSize.value}px Arial`; ctx.textBaseline="top";
            ctx.fillText(text,p.x,p.y); drawing=false; setNote("Text added."); return;
        }

        if(["pen","highlight","eraser"].includes(tool)){
            history(); ctx.beginPath(); ctx.moveTo(p.x,p.y);
        } else if(["rect","circle","arrow"].includes(tool)){
            history(); snapshot=ctx.getImageData(0,0,canvas.width,canvas.height);
        } else if(tool==="crop"){
            history(); snapshot=ctx.getImageData(0,0,canvas.width,canvas.height);
        } else if(tool==="blur"){
            history(); blurAt(p.x,p.y); drawing=false;
        }
    });

    canvas.addEventListener("pointermove",e=>{
        if(!drawing)return;
        const p=pos(e);
        if(["pen","highlight","eraser"].includes(tool)){
            ctx.lineCap="round";ctx.lineJoin="round";ctx.lineWidth=Number(size.value);
            ctx.globalAlpha=tool==="highlight"?.28:1;
            ctx.strokeStyle=tool==="eraser"?"#fff":color.value;
            ctx.lineTo(p.x,p.y);ctx.stroke();ctx.beginPath();ctx.moveTo(p.x,p.y);
        } else if(["rect","circle","arrow","crop"].includes(tool)){
            restore(snapshot); preview(startX,startY,p.x,p.y);
        }
    });

    canvas.addEventListener("pointerup",e=>{
        if(!drawing)return;
        const p=pos(e);
        if(["rect","circle","arrow"].includes(tool)){restore(snapshot);preview(startX,startY,p.x,p.y);}
        if(tool==="crop") crop(startX,startY,p.x,p.y);
        drawing=false;ctx.globalAlpha=1;ctx.beginPath();
    });
    canvas.addEventListener("pointercancel",()=>{drawing=false;ctx.globalAlpha=1;});

    function preview(x1,y1,x2,y2){
        ctx.globalAlpha=1;ctx.strokeStyle=color.value;ctx.lineWidth=Number(size.value);ctx.lineCap="round";ctx.lineJoin="round";
        if(tool==="rect")ctx.strokeRect(x1,y1,x2-x1,y2-y1);
        if(tool==="circle"){const r=Math.hypot(x2-x1,y2-y1);ctx.beginPath();ctx.arc(x1,y1,r,0,Math.PI*2);ctx.stroke();}
        if(tool==="arrow"){
            const a=Math.atan2(y2-y1,x2-x1),h=12+Number(size.value)*1.5;
            ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
            ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-h*Math.cos(a-Math.PI/6),y2-h*Math.sin(a-Math.PI/6));ctx.moveTo(x2,y2);ctx.lineTo(x2-h*Math.cos(a+Math.PI/6),y2-h*Math.sin(a+Math.PI/6));ctx.stroke();
        }
    }

    function crop(x1,y1,x2,y2){
        const left=Math.max(0,Math.min(x1,x2)),top=Math.max(0,Math.min(y1,y2));
        const right=Math.min(canvas.width,Math.max(x1,x2)),bottom=Math.min(canvas.height,Math.max(y1,y2));
        const w=Math.floor(right-left),h=Math.floor(bottom-top);
        if(w<5||h<5){setNote("Crop area is too small.");return;}
        const temp=document.createElement("canvas");temp.width=w;temp.height=h;
        temp.getContext("2d").drawImage(canvas,left,top,w,h,0,0,w,h);
        canvas.width=w;canvas.height=h;ctx.drawImage(temp,0,0);applyZoom();setNote(`Cropped to ${w} × ${h}px`);
    }

    function blurAt(x,y){
        const r=Math.max(15,Number(size.value)*4),sx=Math.max(0,Math.floor(x-r)),sy=Math.max(0,Math.floor(y-r));
        const sw=Math.min(canvas.width-sx,Math.ceil(r*2)),sh=Math.min(canvas.height-sy,Math.ceil(r*2));
        const temp=document.createElement("canvas");temp.width=sw;temp.height=sh;
        const t=temp.getContext("2d");t.filter=`blur(${Math.max(3,Number(size.value))}px)`;t.drawImage(canvas,sx,sy,sw,sh,0,0,sw,sh);ctx.drawImage(temp,sx,sy);
    }

    undo.addEventListener("click",()=>{if(!undoStack.length)return;redoStack.push(ctx.getImageData(0,0,canvas.width,canvas.height));restore(undoStack.pop());updateHistory();});
    redo.addEventListener("click",()=>{if(!redoStack.length)return;undoStack.push(ctx.getImageData(0,0,canvas.width,canvas.height));restore(redoStack.pop());updateHistory();});

    document.getElementById("clearBtn").addEventListener("click",()=>{
        if(!canvas.width)return;history();ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);setNote("Canvas cleared.");
    });

    document.getElementById("resetBtn").addEventListener("click",()=>{
        if(!originalImage)return;canvas.width=originalImage.naturalWidth;canvas.height=originalImage.naturalHeight;ctx.drawImage(originalImage,0,0);undoStack=[];redoStack=[];updateHistory();applyZoom();setNote("Original image restored.");
    });

    function rotate(deg){
        if(!canvas.width)return;history();
        const old=document.createElement("canvas");old.width=canvas.width;old.height=canvas.height;old.getContext("2d").drawImage(canvas,0,0);
        const w=old.width,h=old.height,swap=deg%180!==0;
        canvas.width=swap?h:w;canvas.height=swap?w:h;ctx.save();ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(deg*Math.PI/180);ctx.drawImage(old,-w/2,-h/2);ctx.restore();applyZoom();setNote("Image rotated.");
    }
    function flip(horizontal){
        if(!canvas.width)return;history();
        const old=document.createElement("canvas");old.width=canvas.width;old.height=canvas.height;old.getContext("2d").drawImage(canvas,0,0);
        ctx.save();ctx.clearRect(0,0,canvas.width,canvas.height);
        if(horizontal){ctx.translate(canvas.width,0);ctx.scale(-1,1);}else{ctx.translate(0,canvas.height);ctx.scale(1,-1);}
        ctx.drawImage(old,0,0);ctx.restore();setNote("Image flipped.");
    }

    document.getElementById("rotateLeft").addEventListener("click",()=>rotate(-90));
    document.getElementById("rotateRight").addEventListener("click",()=>rotate(90));
    document.getElementById("flipH").addEventListener("click",()=>flip(true));
    document.getElementById("flipV").addEventListener("click",()=>flip(false));

    function download(type){
        if(!canvas.width){setNote("Choose an image first.");return;}
        const mime=type==="jpg"?"image/jpeg":"image/png",ext=type==="jpg"?"jpg":"png";
        const a=document.createElement("a");a.href=canvas.toDataURL(mime,.92);a.download=`screenshot-edited.${ext}`;a.click();setNote(`Downloaded as ${ext.toUpperCase()}.`);
    }
    document.getElementById("downloadPng").addEventListener("click",()=>download("png"));
    document.getElementById("downloadJpg").addEventListener("click",()=>download("jpg"));

    document.addEventListener("paste",e=>{
        for(const item of (e.clipboardData?.items||[])){if(item.type.startsWith("image/")){loadFile(item.getAsFile());break;}}
    });
    wrap.addEventListener("dragover",e=>e.preventDefault());
    wrap.addEventListener("drop",e=>{e.preventDefault();loadFile(e.dataTransfer.files[0]);});
});