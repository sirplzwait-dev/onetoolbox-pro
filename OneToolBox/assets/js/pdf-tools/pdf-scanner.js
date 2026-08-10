(()=>{"use strict";
const $=id=>document.getElementById(id);
const S={pages:[],i:0,mode:"color",enhance:35,blob:null};
const status=(t,p=0)=>{$("status").textContent=t;$("percent").textContent=Math.round(p)+"%"};
const read=f=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(f)});
const img=src=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src});
async function canvasFor(p){
 const im=await img(p.src), max=1800, k=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight));
 let c=document.createElement("canvas");c.width=Math.max(1,im.naturalWidth*k);c.height=Math.max(1,im.naturalHeight*k);
 let x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);
 if(p.rotation%360){let r=document.createElement("canvas"),q=r.getContext("2d");r.width=c.height;r.height=c.width;q.translate(r.width/2,r.height/2);q.rotate(p.rotation*Math.PI/180);q.drawImage(c,-c.width/2,-c.height/2);c=r;x=c.getContext("2d")}
 const d=x.getImageData(0,0,c.width,c.height),a=d.data,e=p.enhance/100;
 for(let n=0;n<a.length;n+=4){let R=a[n],G=a[n+1],B=a[n+2];if(p.mode==="gray"||p.mode==="bw"){let y=.299*R+.587*G+.114*B;if(p.mode==="bw")y=y>128?255:0;R=G=B=y;if(e){R=(R-128)*(1+e)+128;G=(G-128)*(1+e)+128;B=(B-128)*(1+e)+128}}a[n]=Math.max(0,Math.min(255,R));a[n+1]=Math.max(0,Math.min(255,G));a[n+2]=Math.max(0,Math.min(255,B))}
 x.putImageData(d,0,0);return c;
}
async function add(fs){const a=[...fs].filter(f=>f.type.startsWith("image/"));if(!a.length)return;for(let n=0;n<a.length;n++){S.pages.push({src:await read(a[n]),name:a[n].name,mode:S.mode,enhance:S.enhance,rotation:0});status("Adding pages…",(n+1)/a.length*90)}S.i=S.pages.length-1;await render();status("Ready",100)}
async function render(){
 const n=S.pages.length;$("count").textContent=n+" page"+(n===1?"":"s");$("pageNo").textContent=n?`${S.i+1} / ${n}`:"0 / 0";$("create").disabled=!n;$("empty").style.display=n?"none":"block";$("canvas").hidden=!n;
 const th=$("thumbs"),pl=$("pages");th.innerHTML="";pl.innerHTML="";
 if(!n){pl.innerHTML='<div class="no">No pages added yet.</div>';return}
 for(let k=0;k<n;k++){let p=S.pages[k],t=document.createElement("button");t.className="thumb"+(k===S.i?" active":"");let im=document.createElement("img");im.src=p.src;t.appendChild(im);t.onclick=()=>{S.i=k;render()};th.appendChild(t);
  let d=document.createElement("div");d.className="page"+(k===S.i?" active":"");let pi=document.createElement("img");pi.src=p.src;let b=document.createElement("b");b.textContent="Page "+(k+1);let ar=document.createElement("div");ar.className="arrows";let u=document.createElement("button");u.textContent="↑";u.disabled=k===0;u.onclick=e=>{e.stopPropagation();move(k,-1)};let dn=document.createElement("button");dn.textContent="↓";dn.disabled=k===n-1;dn.onclick=e=>{e.stopPropagation();move(k,1)};ar.append(u,dn);d.append(pi,b,ar);d.onclick=()=>{S.i=k;render()};pl.appendChild(d)}
 let c=await canvasFor(S.pages[S.i]),v=$("canvas");v.width=c.width;v.height=c.height;v.getContext("2d").drawImage(c,0,0);
}
function move(k,d){let j=k+d;if(j<0||j>=S.pages.length)return;[S.pages[k],S.pages[j]]=[S.pages[j],S.pages[k]];S.i=j;render()}
$("imagesBtn").onclick=$("emptyImages").onclick=()=>$("images").click();
$("cameraBtn").onclick=$("emptyCamera").onclick=()=>$("camera").click();
$("images").onchange=e=>add(e.target.files);$("camera").onchange=e=>add(e.target.files);
document.querySelectorAll(".mode").forEach(b=>b.onclick=()=>{S.mode=b.dataset.mode;document.querySelectorAll(".mode").forEach(x=>x.classList.toggle("active",x===b));if(S.pages[S.i])S.pages[S.i].mode=S.mode;render()});
$("enhance").oninput=e=>{S.enhance=+e.target.value;$("enhanceText").textContent=S.enhance+"%";if(S.pages[S.i])S.pages[S.i].enhance=S.enhance;render()};
$("rotate").onclick=()=>{if(S.pages[S.i]){S.pages[S.i].rotation=(S.pages[S.i].rotation+90)%360;render()}};
$("delete").onclick=()=>{if(!S.pages.length)return;S.pages.splice(S.i,1);S.i=Math.max(0,Math.min(S.i,S.pages.length-1));render()};
$("prev").onclick=()=>{if(S.i>0){S.i--;render()}};$("next").onclick=()=>{if(S.i<S.pages.length-1){S.i++;render()}};
$("reset").onclick=()=>{if(confirm("Remove all pages?")){S.pages=[];S.i=0;S.blob=null;$("resultPanel")?.classList.add("hidden");render();status("Ready",0)}};
$("create").onclick=async()=>{if(!S.pages.length)return;const {jsPDF}=window.jspdf;let doc=new jsPDF({unit:"mm",format:$("size").value});for(let n=0;n<S.pages.length;n++){status("Creating PDF…",n/S.pages.length*95);let c=await canvasFor(S.pages[n]);if(n)doc.addPage("a4",c.width>c.height?"landscape":"portrait");let W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),r=Math.min(W/c.width,H/c.height),w=c.width*r,h=c.height*r;doc.addImage(c.toDataURL("image/jpeg",.92),"JPEG",(W-w)/2,(H-h)/2,w,h)}S.blob=doc.output("blob");status("PDF ready",100);let u=URL.createObjectURL(S.blob),a=document.createElement("a");a.href=u;a.download="scanned-document.pdf";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
$("theme").onclick=()=>document.body.classList.toggle("dark");render();
})();