
/* =========================================================
   OneToolBox Calculator Engine — STABLE FINAL
   One engine. No competing calculator logic.
   ========================================================= */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const slug=(location.pathname.split("/").pop()||"").replace(/\.html$/i,"").toLowerCase();
if(slug==="basic-calculator") return;

const fields=$("toolFields"), run=$("runBtn"), reset=$("resetBtn"), box=$("resultBox"), out=$("resultText"), dl=$("downloadBtn");
if(!fields||!run||!box||!out) return;

const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const val=id=>String($(id)?.value??"").trim();
const num=(id,label)=>{const n=Number(val(id));if(!Number.isFinite(n))throw Error(`${label||id} is required.`);return n};
const inp=(id,label,type="number",value="",ph="")=>`<label for="${id}">${label}</label><input id="${id}" type="${type}" value="${esc(value)}" placeholder="${esc(ph)}">`;
const sel=(id,label,items)=>`<label for="${id}">${label}</label><select id="${id}">${items.map(x=>`<option value="${esc(x[0])}">${esc(x[1])}</option>`).join("")}</select>`;
const money=n=>new Intl.NumberFormat("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const positive=(n,label)=>{if(n<0)throw Error(`${label} cannot be negative.`);return n};
const fmt=n=>Number.isInteger(n)?String(n):n.toFixed(6).replace(/0+$/,"").replace(/\.$/,"");

const units={
 length:{mm:.001,cm:.01,m:1,km:1000,in:.0254,ft:.3048,yd:.9144,mi:1609.344},
 weight:{mg:1e-6,g:.001,kg:1,oz:.028349523125,lb:.45359237,stone:6.35029318,ton:1000},
 volume:{ml:.001,l:1,cm3:1e-6,m3:1000,gal:3.785411784,qt:.946352946,pt:.473176473,cup:.2365882365},
 area:{mm2:1e-6,cm2:1e-4,m2:1,km2:1e6,in2:.00064516,ft2:.09290304,yd2:.83612736,acre:4046.8564224,hectare:10000}
};
const unitNames={
 length:[["mm","Millimeter"],["cm","Centimeter"],["m","Meter"],["km","Kilometer"],["in","Inch"],["ft","Foot"],["yd","Yard"],["mi","Mile"]],
 weight:[["mg","Milligram"],["g","Gram"],["kg","Kilogram"],["oz","Ounce"],["lb","Pound"],["stone","Stone"],["ton","Metric Ton"]],
 volume:[["ml","Milliliter"],["l","Liter"],["cm3","Cubic Centimeter"],["m3","Cubic Meter"],["gal","US Gallon"],["qt","Quart"],["pt","Pint"],["cup","Cup"]],
 area:[["mm2","mm²"],["cm2","cm²"],["m2","m²"],["km2","km²"],["in2","in²"],["ft2","ft²"],["yd2","yd²"],["acre","Acre"],["hectare","Hectare"]]
};
const opts=cat=>unitNames[cat]||unitNames.length;

function show(text){
 box.hidden=false; out.textContent=String(text);
 if(dl){
   dl.onclick=()=>{
     const blob=new Blob([String(text)],{type:"text/plain;charset=utf-8"});
     const a=document.createElement("a"), u=URL.createObjectURL(blob);
     a.href=u;a.download=`onetoolbox-${slug}-result.txt`;document.body.appendChild(a);a.click();a.remove();
     setTimeout(()=>URL.revokeObjectURL(u),500);
   };
 }
}
function fail(e){show("Please check your input.\n\n"+(e?.message||"Invalid input."))}
function set(html){fields.innerHTML=html}
function conv(v,f,t,map){return v*map[f]/map[t]}

function calendarWidget(targetId,dateId){
 const host=$(targetId); if(!host)return;
 host.innerHTML=`<div class="otb-calendar">
   <div class="otb-cal-head"><button type="button" data-cal-prev>‹</button><strong data-cal-title></strong><button type="button" data-cal-next>›</button></div>
   <div class="otb-cal-week">${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(x=>`<span>${x}</span>`).join("")}</div>
   <div class="otb-cal-days" data-cal-days></div>
   <div class="otb-cal-foot"><button type="button" data-cal-today>Today</button></div>
 </div>`;
 const title=host.querySelector("[data-cal-title]"), days=host.querySelector("[data-cal-days]");
 let d=new Date(), selected=val(dateId)?new Date(val(dateId)+"T00:00:00"):new Date();
 if(isNaN(selected))selected=new Date();
 d=new Date(selected.getFullYear(),selected.getMonth(),1);
 const iso=x=>{const y=x.getFullYear(),m=String(x.getMonth()+1).padStart(2,"0"),day=String(x.getDate()).padStart(2,"0");return `${y}-${m}-${day}`};
 const render=()=>{
   title.textContent=d.toLocaleString("en-IN",{month:"long",year:"numeric"});
   days.innerHTML="";
   const first=new Date(d.getFullYear(),d.getMonth(),1).getDay();
   const total=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
   for(let i=0;i<first;i++)days.insertAdjacentHTML("beforeend","<span class='otb-cal-empty'></span>");
   for(let day=1;day<=total;day++){
     const x=new Date(d.getFullYear(),d.getMonth(),day), id=iso(x);
     const cls=[id===iso(selected)?"selected":"",id===iso(new Date())?"today":""].filter(Boolean).join(" ");
     days.insertAdjacentHTML("beforeend",`<button type="button" class="${cls}" data-day="${id}">${day}</button>`);
   }
 };
 host.addEventListener("click",e=>{
   const b=e.target.closest("button");if(!b)return;
   if(b.matches("[data-cal-prev]")){d.setMonth(d.getMonth()-1);render()}
   if(b.matches("[data-cal-next]")){d.setMonth(d.getMonth()+1);render()}
   if(b.matches("[data-cal-today]")){selected=new Date();d=new Date(selected.getFullYear(),selected.getMonth(),1);$(dateId).value=iso(selected);render();$(dateId).dispatchEvent(new Event("change",{bubbles:true}))}
   if(b.dataset.day){selected=new Date(b.dataset.day+"T00:00:00");$(dateId).value=b.dataset.day;d=new Date(selected.getFullYear(),selected.getMonth(),1);render()}
 });
 render();
}

function ageYearsMonthsDays(a,b){
 let y=b.getFullYear()-a.getFullYear(),m=b.getMonth()-a.getMonth(),d=b.getDate()-a.getDate();
 if(d<0){m--;d+=new Date(b.getFullYear(),b.getMonth(),0).getDate()}
 if(m<0){y--;m+=12}
 return {y,m,d}
}

const ui={
"scientific-calculator":()=>set(inp("expression","Expression","text","","Example: sin(30)+sqrt(81)")+sel("angle","Angle Mode",[["DEG","Degrees"],["RAD","Radians"]])),
"percentage-calculator":()=>set(inp("value","Value")+inp("percent","Percentage (%)")),
"discount-calculator":()=>set(inp("price","Original Price")+inp("discount","Discount (%)")),
"gst-calculator":()=>set(inp("amount","Base Amount")+inp("gst","GST Rate (%)","number","18")),
"salary-calculator":()=>set(inp("basic","Basic Salary")+inp("allowance","Allowances","number","0")+inp("deduction","Deductions","number","0")),
"tax-calculator":()=>set(inp("income","Annual Income")+inp("deduction","Deductions","number","0")+inp("taxRate","Estimated Tax Rate (%)","number","10")),
"simple-interest-calculator":()=>set(inp("principal","Principal Amount")+inp("rate","Annual Rate (%)")+inp("time","Time (Years)")),
"compound-interest-calculator":()=>set(inp("principal","Principal Amount")+inp("rate","Annual Rate (%)")+inp("time","Time (Years)")+inp("n","Compounds per Year","number","12")),
"interest-calculator":()=>set(inp("principal","Principal Amount")+inp("rate","Annual Rate (%)")+inp("time","Time (Years)")+inp("n","Compounds per Year","number","12")),
"emi-calculator":()=>set(inp("principal","Loan Amount")+inp("rate","Annual Interest (%)")+inp("months","Tenure (Months)")),
"loan-calculator":()=>set(inp("principal","Loan Amount")+inp("rate","Annual Interest (%)")+inp("months","Tenure (Months)")),
"bmi-calculator":()=>set(inp("weight","Weight (kg)")+inp("height","Height (cm)")),
"bmr-calculator":()=>set(inp("weight","Weight (kg)")+inp("height","Height (cm)")+inp("age","Age (Years)")+sel("sex","Sex",[["m","Male"],["f","Female"]])),
"age-calculator":()=>{set(inp("dob","Date of Birth","date")+inp("asof","Calculate As Of","date",new Date().toISOString().slice(0,10))+'<div class="otb-calendar-wrap" id="ageCalendar"></div>');calendarWidget("ageCalendar","dob")},
"date-calculator":()=>{set(inp("d1","Start Date","date")+inp("d2","End Date","date")+'<div class="otb-calendar-wrap" id="dateCalendar"></div>');calendarWidget("dateCalendar","d1")},
"time-calculator":()=>set(inp("h1","Hours","number","0")+inp("m1","Minutes","number","0")+inp("s1","Seconds","number","0")),
"temperature-calculator":()=>set(inp("v","Temperature")+sel("from","From",[["C","Celsius"],["F","Fahrenheit"],["K","Kelvin"]])+sel("to","To",[["C","Celsius"],["F","Fahrenheit"],["K","Kelvin"]])),
"length-calculator":()=>set(inp("v","Value")+sel("from","From",opts("length"))+sel("to","To",opts("length"))),
"weight-calculator":()=>set(inp("v","Value")+sel("from","From",opts("weight"))+sel("to","To",opts("weight"))),
"volume-calculator":()=>set(inp("v","Value")+sel("from","From",opts("volume"))+sel("to","To",opts("volume"))),
"unit-calculator":()=>set(inp("v","Value")+sel("category","Unit Type",[["length","Length"],["weight","Weight"],["volume","Volume"],["area","Area"]])+'<div id="unitFrom"></div><div id="unitTo"></div>'),
"area-calculator":()=>set(sel("shape","Shape",[["rectangle","Rectangle"],["square","Square"],["circle","Circle"],["triangle","Triangle"]])+'<div id="areaInputs"></div>'),
"currency-calculator":()=>set(inp("amount","Amount")+inp("rate","Exchange Rate","number","1","Example: 1 USD = 83.50 INR"))
};

function dynamic(){
 if(slug==="unit-calculator"){
   const c=val("category")||"length";
   $("unitFrom").innerHTML=sel("from","From",opts(c));
   $("unitTo").innerHTML=sel("to","To",opts(c));
 }
 if(slug==="area-calculator"){
   const s=val("shape")||"rectangle";
   $("areaInputs").innerHTML=s==="rectangle"?inp("l","Length")+inp("w","Width"):
   s==="square"?inp("side","Side"):
   s==="circle"?inp("r","Radius"):inp("base","Base")+inp("height","Height");
 }
}

function sci(s,mode){
 s=s.trim().replace(/\s+/g,"").replace(/π/g,"PI").replace(/\^/g,"**");
 if(!s)throw Error("Expression is required.");
 if(s.length>120||!/^[0-9+\-*/().,%A-Za-z_]+$/.test(s)||/(constructor|prototype|globalThis|window|document|eval|Function|fetch|import)/i.test(s))throw Error("Unsupported expression.");
 const rad=x=>mode==="DEG"?x*Math.PI/180:x, inv=x=>mode==="DEG"?x*180/Math.PI:x;
 const sin=x=>Math.sin(rad(x)),cos=x=>Math.cos(rad(x)),tan=x=>Math.tan(rad(x)),asin=x=>inv(Math.asin(x)),acos=x=>inv(Math.acos(x)),atan=x=>inv(Math.atan(x));
 s=s.replace(/(\d+(?:\.\d+)?)%/g,"($1/100)");
 const f=new Function("PI","E","sin","cos","tan","asin","acos","atan","sqrt","ln","log","abs","exp","floor","ceil",`"use strict";return (${s})`);
 const r=f(Math.PI,Math.E,sin,cos,tan,asin,acos,atan,Math.sqrt,Math.log,Math.log10,Math.abs,Math.exp,Math.floor,Math.ceil);
 if(!Number.isFinite(r))throw Error("Result is not finite.");return r;
}

function calculate(){
 switch(slug){
 case"scientific-calculator":return`Result: ${fmt(sci(val("expression"),val("angle")))}`;
 case"percentage-calculator":{let a=num("value","Value"),p=num("percent","Percentage"),r=a*p/100;return`${p}% of ${a} = ${fmt(r)}`}
 case"discount-calculator":{let p=positive(num("price","Price"),"Price"),d=positive(num("discount","Discount"),"Discount");let s=p*d/100;return`Original Price: ₹${money(p)}\nDiscount: ${d}%\nYou Save: ₹${money(s)}\nFinal Price: ₹${money(p-s)}`}
 case"gst-calculator":{let a=num("amount","Amount"),g=num("gst","GST Rate");let x=a*g/100;return`Base Amount: ₹${money(a)}\nGST (${g}%): ₹${money(x)}\nTotal: ₹${money(a+x)}`}
 case"salary-calculator":{let b=num("basic","Basic Salary"),a=num("allowance","Allowances"),d=num("deduction","Deductions"),gross=b+a;return`Basic: ₹${money(b)}\nAllowances: ₹${money(a)}\nGross: ₹${money(gross)}\nDeductions: ₹${money(d)}\nNet Salary: ₹${money(gross-d)}`}
 case"tax-calculator":{let i=num("income","Income"),d=num("deduction","Deductions"),r=num("taxRate","Tax Rate"),tax=Math.max(0,i-d)*r/100;return`Taxable Income: ₹${money(Math.max(0,i-d))}\nEstimated Tax: ₹${money(tax)}\nAfter-Tax Income: ₹${money(i-tax)}`}
 case"simple-interest-calculator":{let p=num("principal","Principal"),r=num("rate","Rate"),t=num("time","Time"),i=p*r*t/100;return`Principal: ₹${money(p)}\nSimple Interest: ₹${money(i)}\nTotal Amount: ₹${money(p+i)}`}
 case"compound-interest-calculator":
 case"interest-calculator":{let p=num("principal","Principal"),r=num("rate","Rate")/100,t=num("time","Time"),n=num("n","Compounds/Year");if(n<=0)throw Error("Compounds per year must be greater than 0.");let a=p*Math.pow(1+r/n,n*t);return`Principal: ₹${money(p)}\nCompound Interest: ₹${money(a-p)}\nTotal Amount: ₹${money(a)}`}
 case"emi-calculator":
 case"loan-calculator":{let P=num("principal","Loan Amount"),annual=num("rate","Annual Interest"),N=Math.round(num("months","Tenure"));if(P<=0||N<=0)throw Error("Loan amount and tenure must be greater than 0.");let m=annual/1200,emi=m?P*m*Math.pow(1+m,N)/(Math.pow(1+m,N)-1):P/N,total=emi*N;return`Monthly EMI: ₹${money(emi)}\nTotal Interest: ₹${money(total-P)}\nTotal Payment: ₹${money(total)}`}
 case"bmi-calculator":{let w=num("weight","Weight"),h=num("height","Height")/100;if(w<=0||h<=0)throw Error("Weight and height must be greater than 0.");let b=w/(h*h),c=b<18.5?"Underweight":b<25?"Normal":b<30?"Overweight":"Obesity";return`BMI: ${b.toFixed(2)}\nCategory: ${c}`}
 case"bmr-calculator":{let w=num("weight","Weight"),h=num("height","Height"),a=num("age","Age");let b=val("sex")==="m"?10*w+6.25*h-5*a+5:10*w+6.25*h-5*a-161;return`BMR: ${Math.round(b)} kcal/day\nModerate Activity: ${Math.round(b*1.55)} kcal/day`}
 case"age-calculator":{let a=new Date(val("dob")+"T00:00:00"),b=new Date(val("asof")+"T00:00:00");if(isNaN(a)||isNaN(b)||b<a)throw Error("Please select valid dates.");let x=ageYearsMonthsDays(a,b);let total=Math.floor((b-a)/86400000);return`Age: ${x.y} Years, ${x.m} Months, ${x.d} Days\nTotal Days: ${total.toLocaleString()}`}
 case"date-calculator":{let a=new Date(val("d1")+"T00:00:00"),b=new Date(val("d2")+"T00:00:00");if(isNaN(a)||isNaN(b))throw Error("Please select both dates.");let days=Math.round(Math.abs(b-a)/86400000);return`Date Difference: ${days.toLocaleString()} days\nWeeks: ${(days/7).toFixed(2)}\nApprox. Months: ${(days/30.4375).toFixed(2)}\nApprox. Years: ${(days/365.2425).toFixed(2)}`}
 case"time-calculator":{let h=num("h1","Hours"),m=num("m1","Minutes"),s=num("s1","Seconds");if(h<0||m<0||s<0)throw Error("Time cannot be negative.");let total=h*3600+m*60+s,hh=Math.floor(total/3600),mm=Math.floor(total%3600/60),ss=total%60;return`${hh} h ${mm} min ${ss} sec\nTotal Seconds: ${total}`}
 case"temperature-calculator":{let v=num("v","Temperature"),f=val("from"),t=val("to"),c=f==="C"?v:f==="F"?(v-32)*5/9:v-273.15,r=t==="C"?c:t==="F"?c*9/5+32:c+273.15;return`${v} °${f} = ${fmt(r)} °${t}`}
 case"length-calculator":{let v=num("v","Value"),f=val("from"),t=val("to");return`${v} ${f} = ${fmt(conv(v,f,t,units.length))} ${t}`}
 case"weight-calculator":{let v=num("v","Value"),f=val("from"),t=val("to");return`${v} ${f} = ${fmt(conv(v,f,t,units.weight))} ${t}`}
 case"volume-calculator":{let v=num("v","Value"),f=val("from"),t=val("to");return`${v} ${f} = ${fmt(conv(v,f,t,units.volume))} ${t}`}
 case"unit-calculator":{let v=num("v","Value"),c=val("category"),f=val("from"),t=val("to");return`${v} ${f} = ${fmt(conv(v,f,t,units[c]))} ${t}`}
 case"area-calculator":{let s=val("shape"),a=s==="rectangle"?num("l","Length")*num("w","Width"):s==="square"?num("side","Side")**2:s==="circle"?Math.PI*num("r","Radius")**2:.5*num("base","Base")*num("height","Height");return`Area: ${fmt(a)} square units`}
 case"currency-calculator":{let a=num("amount","Amount"),r=num("rate","Exchange Rate");if(r<0)throw Error("Exchange rate cannot be negative.");return`Amount: ${money(a)}\nRate: ${r}\nConverted: ${money(a*r)}`}
 default:throw Error("Calculator configuration not found.")
 }
}

function init(){
 if(ui[slug])ui[slug]();dynamic();
 run.innerHTML='<i class="fa-solid fa-calculator"></i> Calculate';
 run.onclick=()=>{try{calculate()&&show(calculate())}catch(e){fail(e)}};
 /* Avoid calculating twice while preserving clean result */
 run.onclick=()=>{try{show(calculate())}catch(e){fail(e)}};
 if(reset)reset.onclick=()=>{if(ui[slug])ui[slug]();dynamic();box.hidden=true;out.textContent=""};
 fields.addEventListener("change",()=>{dynamic()});
 fields.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.tagName!=="TEXTAREA"){e.preventDefault();try{show(calculate())}catch(x){fail(x)}}});
 fields.addEventListener("input",()=>{box.hidden=true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
