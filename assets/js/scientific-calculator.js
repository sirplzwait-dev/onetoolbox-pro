(()=>{"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let expr="",memory=0,mode="DEG",justEvaluated=false;
const expression=$("#expression"),answer=$("#answer"),modeLabel=$("#modeLabel"),memoryLabel=$("#memoryLabel"),memoryValue=$("#memoryValue");
const names={sin:"Math.sin",cos:"Math.cos",tan:"Math.tan",asin:"Math.asin",acos:"Math.acos",atan:"Math.atan",sqrt:"Math.sqrt",cbrt:"Math.cbrt",abs:"Math.abs",ln:"Math.log",log:"Math.log10",exp:"Math.exp",floor:"Math.floor",ceil:"Math.ceil",fact:"fact"};
function render(){expression.textContent=expr||"";answer.textContent=expr?"":"0";modeLabel.textContent=mode;memoryLabel.textContent="M: "+fmt(memory);memoryValue.textContent=fmt(memory)}
function fmt(n){if(!Number.isFinite(n))return"Error";return Number(n.toPrecision(12)).toString()}
function fact(n){if(!Number.isInteger(n)||n<0||n>170)throw Error("Factorial requires an integer from 0 to 170");let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function normalize(s){
 s=s.replaceAll("×","*").replaceAll("÷","/").replaceAll("−","-").replaceAll("π","Math.PI").replace(/\be\b/g,"Math.E").replace(/\^/g,"**");
 for(const [k,v] of Object.entries(names)){if(k==="fact")s=s.replace(/\bfact\(/g,"fact(");else s=s.replace(new RegExp("\\b"+k+"\\(","g"),v+"(")}
 if(mode==="DEG"){
   s=s.replace(/Math\.sin\(/g,"sinD(").replace(/Math\.cos\(/g,"cosD(").replace(/Math\.tan\(/g,"tanD(")
      .replace(/Math\.asin\(/g,"asinD(").replace(/Math\.acos\(/g,"acosD(").replace(/Math\.atan\(/g,"atanD(");
 }
 s=s.replace(/(\d+(?:\.\d+)?)%/g,"($1/100)");
 return s;
}
function calculate(){
 if(!expr)return;
 try{
   let s=normalize(expr);
   if(!/^[0-9+\-*/().A-Za-z_*]+$/.test(s)||/(constructor|prototype|window|document|globalThis|eval|Function|fetch|import)/i.test(s))throw Error("Invalid expression");
   const sinD=x=>Math.sin(x*Math.PI/180),cosD=x=>Math.cos(x*Math.PI/180),tanD=x=>Math.tan(x*Math.PI/180);
   const asinD=x=>Math.asin(x)*180/Math.PI,acosD=x=>Math.acos(x)*180/Math.PI,atanD=x=>Math.atan(x)*180/Math.PI;
   const value=Function("sinD","cosD","tanD","asinD","acosD","atanD","fact",`"use strict";return (${s})`)(sinD,cosD,tanD,asinD,acosD,atanD,fact);
   if(!Number.isFinite(value))throw Error("Result is not finite");
   expression.textContent=expr+" =";answer.textContent=fmt(value);return value;
 }catch(e){answer.textContent="Error";expression.textContent=e.message}
}
function insert(v){
 if(justEvaluated&&!/[+\-×÷^%]/.test(v)&&!v.endsWith("(")){expr="";justEvaluated=false}
 if(v==="x²")v="^2";
 if(v==="1/")v="1/(";
 expr+=v;render();
}
function back(){expr=expr.slice(0,-1);justEvaluated=false;render()}
function clear(){expr="";justEvaluated=false;render()}
function action(a){
 if(a==="equals"){const v=calculate();if(Number.isFinite(v)){expr=fmt(v);justEvaluated=true}}
 if(a==="clear")clear(); if(a==="back")back();
 if(a==="memory-plus"){try{memory+=calculate()||0}catch{}render()}
 if(a==="memory-minus"){try{memory-=calculate()||0}catch{}render()}
 if(a==="memory-recall"){expr+=fmt(memory);render()}
 if(a==="memory-clear"){memory=0;render()}
}
$$("[data-insert]").forEach(b=>b.addEventListener("click",()=>insert(b.dataset.insert)));
$$("[data-action]").forEach(b=>b.addEventListener("click",()=>action(b.dataset.action)));
$$("[data-mode]").forEach(b=>b.addEventListener("click",()=>{mode=b.dataset.mode;$$("[data-mode]").forEach(x=>x.classList.toggle("active",x===b));render()}));
$("#clearAll").onclick=clear;$("#backspace").onclick=back;
document.addEventListener("keydown",e=>{
 if(/^[0-9.]$/.test(e.key))insert(e.key);
 else if(["+","-","*","/","^","%","(",")"].includes(e.key))insert(e.key==="*"?"×":e.key==="-"?"−":e.key);
 else if(e.key==="Enter")action("equals"); else if(e.key==="Backspace")back(); else if(e.key==="Escape")clear();
});
$$(".tab").forEach(tab=>tab.addEventListener("click",()=>{
 $$(".tab").forEach(x=>x.classList.remove("active"));tab.classList.add("active");
 const p=tab.dataset.panel;
 document.querySelector(".function-panel").style.display=p==="main"?"grid":"none";
 document.querySelector(".number-panel").style.display=p==="main"?"grid":"none";
 $$(".extra-panels .panel").forEach(x=>x.style.display="none");
 if(p!=="main")$("#"+p).style.display="grid";
}));
$("#themeBtn").onclick=()=>document.body.classList.toggle("dark");
render();
})();