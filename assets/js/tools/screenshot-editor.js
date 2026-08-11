document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fileInput=$('fileInput'), chooseBtn=$('chooseBtn'), drop=$('drop'), thumb=$('thumb'), uploadEmpty=$('uploadEmpty');
  const recognizeBtn=$('recognizeBtn'), status=$('status'), canvas=$('canvas'), ctx=canvas.getContext('2d'), stage=$('stage'), overlay=$('overlay'), canvasEmpty=$('canvasEmpty'), viewport=$('viewport');
  const zoomValue=$('zoomValue'), textControls=$('textControls'), noSelection=$('noSelection'), textValue=$('textValue'), fontFamily=$('fontFamily'), fontSize=$('fontSize'), textColor=$('textColor'), colorCode=$('colorCode'), letterSpacing=$('letterSpacing'), lineHeight=$('lineHeight');
  const editModeBtn=$('editMode'), moveModeBtn=$('moveMode');
  let img=null,imgUrl='',zoom=1,selected=null,items=[],images=[],history=[],future=[],mode='edit',editingId=null;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function rgbHex(r,g,b){return '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}
  function sampleBg(x,y,w,h){
    const pts=[[x-2,y-2],[x+w+2,y-2],[x-2,y+h+2],[x+w+2,y+h+2],[x+w/2,y-3],[x+w/2,y+h+3]];
    const vals=[];
    for(const [px,py] of pts){const xx=clamp(Math.round(px),0,canvas.width-1),yy=clamp(Math.round(py),0,canvas.height-1);const d=ctx.getImageData(xx,yy,1,1).data;vals.push([d[0],d[1],d[2]])}
    vals.sort((a,b)=>(a[0]+a[1]+a[2])-(b[0]+b[1]+b[2]));
    const mid=vals[Math.floor(vals.length/2)]; return rgbHex(mid[0],mid[1],mid[2]);
  }
  function sampleTextColor(x,y,w,h){
    const data=ctx.getImageData(clamp(Math.floor(x),0,canvas.width-1),clamp(Math.floor(y),0,canvas.height-1),Math.max(1,Math.min(Math.floor(w),canvas.width-Math.floor(x))),Math.max(1,Math.min(Math.floor(h),canvas.height-Math.floor(y)))).data;
    let best=[17,24,39],bestScore=-1;
    for(let i=0;i<data.length;i+=4){const r=data[i],g=data[i+1],b=data[i+2],brightness=(r+g+b)/3,score=Math.max(0,150-brightness);if(score>bestScore){best=[r,g,b];bestScore=score}}
    return rgbHex(...best);
  }
  function snapshot(){history.push(JSON.stringify({items,images}));if(history.length>30)history.shift();future=[]}
  function restore(s){const o=JSON.parse(s);items=o.items||[];images=o.images||[];selected=null;editingId=null;showNoSelection();render()}
  function applyZoom(){zoom=clamp(zoom,.25,3);canvas.style.width=canvas.width*zoom+'px';canvas.style.height=canvas.height*zoom+'px';stage.style.width=canvas.width*zoom+'px';stage.style.height=canvas.height*zoom+'px';overlay.style.width=canvas.width*zoom+'px';overlay.style.height=canvas.height*zoom+'px';zoomValue.textContent=Math.round(zoom*100)+'%';render()}
  function fit(){if(!img)return;const w=Math.max(280,viewport.clientWidth-35),h=Math.max(250,viewport.clientHeight-35);zoom=clamp(Math.min(w/canvas.width,h/canvas.height),.25,1);applyZoom()}
  function loadImage(src){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src})}
  async function loadFile(f){if(!f||!f.type.startsWith('image/'))return;if(imgUrl)URL.revokeObjectURL(imgUrl);imgUrl=URL.createObjectURL(f);img=await loadImage(imgUrl);canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;ctx.drawImage(img,0,0);thumb.src=imgUrl;thumb.style.display='block';uploadEmpty.style.display='none';recognizeBtn.disabled=false;items=[];images=[];selected=null;editingId=null;showNoSelection();canvasEmpty.style.display='none';status.textContent='Screenshot loaded. Click Recognize Text.';requestAnimationFrame(fit)}
  chooseBtn.onclick=()=>fileInput.click();fileInput.onchange=e=>loadFile(e.target.files[0]);
  drop.ondragover=e=>{e.preventDefault();drop.style.borderColor='#2563eb'};drop.ondragleave=()=>drop.style.borderColor='';drop.ondrop=e=>{e.preventDefault();drop.style.borderColor='';loadFile(e.dataTransfer.files[0])};
  document.addEventListener('paste',e=>{for(const it of e.clipboardData?.items||[]){if(it.type.startsWith('image/')){loadFile(it.getAsFile());break}}});

  function setMode(m){finishEdit(true);mode=m;editModeBtn.classList.toggle('active',m==='edit');moveModeBtn.classList.toggle('active',m==='move');status.textContent=m==='edit'?'Edit mode: click text and type. Backspace/Delete works.':'Move mode: drag the selected text to move it.';render()}
  editModeBtn.onclick=()=>setMode('edit'); moveModeBtn.onclick=()=>setMode('move');

  recognizeBtn.onclick=async()=>{
    if(!img)return; recognizeBtn.disabled=true; status.textContent='Recognizing text…';
    try{
      const r=await Tesseract.recognize(imgUrl,'eng',{logger:m=>{if(m.progress)status.textContent=`Recognizing… ${Math.round(m.progress*100)}%`}});
      snapshot();items=[];
      const lines=(r.data.lines||[]).filter(x=>x.text&&x.text.trim()&&x.confidence>=25);
      const source=lines.length?lines:r.data.words.filter(x=>x.text&&x.text.trim()&&x.confidence>=30);
      for(const w of source){
        const x=w.bbox.x0,y=w.bbox.y0,width=w.bbox.x1-w.bbox.x0,height=w.bbox.y1-w.bbox.y0;
        const fs=Math.max(9,Math.round(height*.82));
        items.push({id:crypto.randomUUID(),text:w.text.trim(),x,y,width:Math.max(width,35),height:Math.max(height,18),fontSize:fs,color:sampleTextColor(x,y,width,height),bg:sampleBg(x,y,width,height),font:'Arial',bold:false,italic:false,align:'left',spacing:0,line:1});
      }
      render();status.textContent=`✓ ${items.length} text areas detected. Click any text to edit.`;
    }catch(e){console.error(e);status.textContent='OCR failed. Try a clearer screenshot.'}
    recognizeBtn.disabled=false;
  };

  function showNoSelection(){noSelection.classList.remove('hidden');textControls.classList.add('hidden');selected=null;editingId=null}
  function showControls(o){noSelection.classList.add('hidden');textControls.classList.remove('hidden');textValue.value=o.text;fontFamily.value=o.font;fontSize.value=o.fontSize;textColor.value=o.color;colorCode.textContent=o.color;letterSpacing.value=o.spacing;lineHeight.value=o.line;document.querySelectorAll('.font-buttons button').forEach(b=>b.classList.remove('active'));if(o.bold)$('bold').classList.add('active');if(o.italic)$('italic').classList.add('active')}
  function selectText(o,edit=true){selected=o.id;showControls(o);render();if(edit&&mode==='edit')requestAnimationFrame(()=>beginEdit(o))}
  function beginEdit(o){const el=overlay.querySelector(`[data-id="${o.id}"] .text-editable`);if(!el)return;finishEdit(false);editingId=o.id;el.contentEditable='true';el.classList.add('editing');el.focus();const range=document.createRange();range.selectNodeContents(el);const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);status.textContent='Editing: type new text. Backspace/Delete works. Enter saves, Esc cancels.'}
  function finishEdit(commit=true){if(!editingId)return;const o=items.find(x=>x.id===editingId);const el=overlay.querySelector(`[data-id="${editingId}"] .text-editable`);if(o&&el&&commit){const v=el.innerText.replace(/\n/g,' ').trim();if(v!==o.text){snapshot();o.text=v}}if(el){el.contentEditable='false';el.classList.remove('editing')}editingId=null;render()}
  document.addEventListener('keydown',e=>{if(!editingId)return;if(e.key==='Escape'){e.preventDefault();finishEdit(false)}else if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();finishEdit(true)}});
  document.addEventListener('pointerdown',e=>{if(editingId&&!overlay.querySelector(`[data-id="${editingId}"]`)?.contains(e.target))finishEdit(true)},{capture:true});

  function render(){
    if(editingId)return;
    overlay.innerHTML='';
    items.forEach(o=>{
      const el=document.createElement('div');el.className='text-object'+(selected===o.id?' selected':'');el.dataset.id=o.id;el.style.left=o.x*zoom+'px';el.style.top=o.y*zoom+'px';el.style.width=Math.max(o.width*zoom,25)+'px';el.style.minHeight=o.height*zoom+'px';el.style.fontSize=o.fontSize*zoom+'px';el.style.color=o.color;el.style.fontFamily=o.font;el.style.fontWeight=o.bold?'700':'400';el.style.fontStyle=o.italic?'italic':'normal';el.style.textAlign=o.align;el.style.letterSpacing=o.spacing*zoom+'px';el.style.lineHeight=o.line;
      const cover=document.createElement('span');cover.className='text-cover';cover.style.background=o.bg||'#fff';el.appendChild(cover);
      const t=document.createElement('span');t.className='text-editable';t.textContent=o.text;el.appendChild(t);
      const h=document.createElement('span');h.className='resize-handle';el.appendChild(h);overlay.appendChild(el);
      el.addEventListener('click',e=>{e.stopPropagation();if(e.target===h)return;selectText(o,true)});
      el.addEventListener('pointerdown',e=>{if(e.target===h||mode!=='move')return;e.preventDefault();e.stopPropagation();selectText(o,false);startDrag(o,e)});
      h.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();startResize(o,e)});
    });
    images.forEach(o=>{const el=document.createElement('div');el.className='image-object'+(selected===o.id?' selected':'');el.dataset.id=o.id;el.style.left=o.x*zoom+'px';el.style.top=o.y*zoom+'px';el.style.width=o.width*zoom+'px';el.style.height=o.height*zoom+'px';const im=document.createElement('img');im.src=o.src;el.append(im);const h=document.createElement('span');h.className='resize-handle';el.append(h);overlay.appendChild(el);el.addEventListener('pointerdown',e=>{if(e.target===h)return;selected=o.id;startDrag(o,e)});h.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();startResizeImage(o,e)})});
  }
  function startDrag(o,e){const sx=e.clientX,sy=e.clientY,ox=o.x,oy=o.y;const move=v=>{o.x=ox+(v.clientX-sx)/zoom;o.y=oy+(v.clientY-sy)/zoom;render()};const up=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);snapshot()};document.addEventListener('pointermove',move);document.addEventListener('pointerup',up)}
  function startResize(o,e){const sx=e.clientX,sy=e.clientY,sw=o.width,sh=o.height;const move=v=>{o.width=Math.max(25,sw+(v.clientX-sx)/zoom);o.height=Math.max(18,sh+(v.clientY-sy)/zoom);render()};const up=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up)};document.addEventListener('pointermove',move);document.addEventListener('pointerup',up)}
  function startResizeImage(o,e){const sx=e.clientX,sy=e.clientY,sw=o.width,sh=o.height;const move=v=>{o.width=Math.max(30,sw+(v.clientX-sx)/zoom);o.height=Math.max(30,sh+(v.clientY-sy)/zoom);render()};const up=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up)};document.addEventListener('pointermove',move);document.addEventListener('pointerup',up)}

  $('apply').onclick=()=>{finishEdit(true);const o=items.find(x=>x.id===selected);if(!o)return;snapshot();o.text=textValue.value;o.font=fontFamily.value;o.fontSize=+fontSize.value||o.fontSize;o.color=textColor.value;o.spacing=+letterSpacing.value||0;o.line=+lineHeight.value||1;render()};
  $('delete').onclick=()=>{finishEdit(true);const i=items.findIndex(x=>x.id===selected);if(i<0)return;snapshot();items.splice(i,1);showNoSelection();render()};
  $('clearSelection').onclick=()=>{finishEdit(true);showNoSelection();render()};
  $('addText').onclick=()=>{snapshot();const o={id:crypto.randomUUID(),text:'Type here',x:40,y:40,width:180,height:38,fontSize:28,color:'#111111',bg:'#ffffff',font:'Arial',bold:false,italic:false,align:'left',spacing:0,line:1};items.push(o);setMode('edit');selectText(o,true)};
  $('addImage').onclick=()=>$('addImageFile').click();
  $('addImageFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;const u=URL.createObjectURL(f),im=await loadImage(u);snapshot();images.push({id:crypto.randomUUID(),src:u,x:50,y:50,width:Math.min(260,im.naturalWidth),height:Math.min(180,im.naturalHeight)});render();e.target.value=''};
  $('bold').onclick=()=>{const o=items.find(x=>x.id===selected);if(o){o.bold=!o.bold;render();showControls(o)}};
  $('italic').onclick=()=>{const o=items.find(x=>x.id===selected);if(o){o.italic=!o.italic;render();showControls(o)}};
  $('alignLeft').onclick=()=>align('left');$('alignCenter').onclick=()=>align('center');$('alignRight').onclick=()=>align('right');
  function align(a){const o=items.find(x=>x.id===selected);if(o){o.align=a;render();showControls(o)}}
  textColor.oninput=()=>{colorCode.textContent=textColor.value;const o=items.find(x=>x.id===selected);if(o){o.color=textColor.value;render()}};
  fontFamily.onchange=()=>{const o=items.find(x=>x.id===selected);if(o){o.font=fontFamily.value;render()}};
  fontSize.oninput=()=>{const o=items.find(x=>x.id===selected);if(o){o.fontSize=+fontSize.value||o.fontSize;render()}};
  letterSpacing.oninput=()=>{const o=items.find(x=>x.id===selected);if(o){o.spacing=+letterSpacing.value||0;render()}};
  lineHeight.oninput=()=>{const o=items.find(x=>x.id===selected);if(o){o.line=+lineHeight.value||1;render()}};
  $('zoomIn').onclick=()=>{zoom+=.2;applyZoom()};$('zoomOut').onclick=()=>{zoom-=.2;applyZoom()};$('fit').onclick=fit;
  $('undo').onclick=()=>{finishEdit(true);if(!history.length)return;future.push(JSON.stringify({items,images}));restore(history.pop())};
  $('redo').onclick=()=>{finishEdit(true);if(!future.length)return;history.push(JSON.stringify({items,images}));restore(future.pop())};
  $('reset').onclick=()=>{finishEdit(true);if(!img)return;ctx.drawImage(img,0,0);items=[];images=[];showNoSelection();fit();status.textContent='Reset complete.'};
  $('download').onclick=async()=>{finishEdit(true);if(!img)return;const out=document.createElement('canvas');out.width=canvas.width;out.height=canvas.height;const c=out.getContext('2d');c.drawImage(img,0,0);for(const o of items){c.fillStyle=o.bg||'#fff';c.fillRect(o.x,o.y,o.width,o.height);c.font=`${o.italic?'italic ':''}${o.bold?'700 ':'400'}${o.fontSize}px ${o.font}`;c.fillStyle=o.color;c.textAlign=o.align;c.textBaseline='top';c.fillText(o.text,o.x,o.y)}for(const o of images){const im=await loadImage(o.src);c.drawImage(im,o.x,o.y,o.width,o.height)}const a=document.createElement('a');a.href=out.toDataURL('image/png');a.download='screenshot-edited-OneToolBox.png';a.click()};
});
