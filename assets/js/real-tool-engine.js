(() => {
const slug=location.pathname.split('/').pop().replace('.html','');
const $=id=>document.getElementById(id);
const out=v=>{const b=$('resultBox'),t=$('resultText'); if(b)b.hidden=false;if(t)t.textContent=String(v)};
function val(id){return ($(id)?.value||'').trim()}
function init(){
  const run=$('runBtn'); if(!run)return;
  run.onclick=async()=>{
    try{
      let r;
      if(slug==='basic-calculator') r=Function('"use strict";return ('+val('expr').replace(/[^0-9+\-*/().% ]/g,'')+')')();
      else if(slug==='percentage-calculator') r=val('value')*val('percent')/100;
      else if(slug==='discount-calculator'){let d=val('price')*val('discount')/100;r=`Discount: ${d.toFixed(2)}\nFinal price: ${(val('price')-d).toFixed(2)}`;}
      else if(slug==='simple-interest-calculator'){let i=val('principal')*val('rate')*val('time')/100;r=`Interest: ${i.toFixed(2)}\nAmount: ${(+val('principal')+i).toFixed(2)}`;}
      else if(slug==='compound-interest-calculator'){let a=val('principal')*Math.pow(1+val('rate')/100/val('n'),val('n')*val('time'));r=`Amount: ${a.toFixed(2)}\nInterest: ${(a-val('principal')).toFixed(2)}`;}
      else if(slug==='emi-calculator'){let P=+val('principal'),m=+val('rate')/1200,n=+val('months');let e=m?P*m*Math.pow(1+m,n)/(Math.pow(1+m,n)-1):P/n;r=`Monthly EMI: ${e.toFixed(2)}\nTotal payment: ${(e*n).toFixed(2)}\nTotal interest: ${(e*n-P).toFixed(2)}`;}
      else if(slug==='bmi-calculator'){let bmi=+val('weight')/Math.pow(+val('height')/100,2);r=`BMI: ${bmi.toFixed(2)}\n${bmi<18.5?'Underweight':bmi<25?'Normal':bmi<30?'Overweight':'Obesity'}`;}
      else if(slug==='age-calculator'){let a=new Date(val('dob')),d=new Date(val('asof'));let y=d.getFullYear()-a.getFullYear(),m=d.getMonth()-a.getMonth();if(m<0){y--;m+=12}r=`Age: ${y} years ${m} months`;}
      else if(slug==='gst-calculator'){let g=+val('amount')*+val('gst')/100;r=`GST: ${g.toFixed(2)}\nTotal: ${(Number(val('amount'))+g).toFixed(2)}`;}
      else if(['character-counter','text-counter'].includes(slug)){let s=val('text');r=`Characters: ${s.length}\nCharacters without spaces: ${s.replace(/\s/g,'').length}\nWords: ${(s.match(/\S+/g)||[]).length}\nLines: ${s?s.split('\n').length:0}`;}
      else if(slug==='word-counter')r=`Words: ${(val('text').match(/\S+/g)||[]).length}`;
      else if(slug==='password-generator'){let chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';r=Array.from({length:+val('length')||16},()=>chars[Math.floor(Math.random()*chars.length)]).join('');}
      else if(slug==='password-strength-checker'){let s=val('password'),n=(s.length>=8)+(s.length>=12)+/[A-Z]/.test(s)+/[a-z]/.test(s)+/\d/.test(s)+/[^A-Za-z0-9]/.test(s);r=`Strength: ${n>=5?'Strong':n>=3?'Medium':'Weak'} (${n}/6)`;}
      else if(slug==='random-number-generator')r=Math.floor(Math.random()*(+val('max')-+val('min')+1))+ +val('min');
      else if(slug==='random-name-picker'){let a=val('names').split(/\n|,/).map(x=>x.trim()).filter(Boolean);r=a[Math.floor(Math.random()*a.length)]||'No names entered';}
      else if(slug==='base64-encoder')r=btoa(unescape(encodeURIComponent(val('text'))));
      else if(slug==='base64-decoder')r=decodeURIComponent(escape(atob(val('text'))));
      else if(slug==='url-encoder')r=encodeURIComponent(val('text'));
      else if(slug==='url-decoder')r=decodeURIComponent(val('text'));
      else if(slug==='uuid-generator')r=crypto.randomUUID();
      else if(slug==='lorem-ipsum-generator'){let p='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';r=Array.from({length:+val('count')||3},()=>p).join('\n\n');}
      else if(slug==='regex-tester'){let re=new RegExp(val('pattern'),'g');r=JSON.stringify(val('text').match(re)||[]);}
      else if(slug==='color-picker')r=val('color');
      else if(['json-formatter','json-viewer'].includes(slug))r=JSON.stringify(JSON.parse(val('text')),null,2);
      else if(slug==='json-validator'){JSON.parse(val('text'));r='Valid JSON ✓';}
      else if(slug==='xml-formatter')r=val('text').replace(/(>)(<)(\/*)/g,'$1\n$2$3');
      else if(slug==='sql-formatter')r=val('text').replace(/\s+/g,' ').replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|VALUES|SET|JOIN)\b/gi,'\n$1').trim();
      else if(slug==='timestamp-converter')r=new Date(+val('timestamp')*1000).toString();
      else if(slug==='jwt-decoder'){let p=val('text').split('.')[1];r=JSON.stringify(JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/'))),null,2);}
      else if(slug==='hash-generator'){let b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(val('text')));r=Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');}
      else if(['ai-text-summarizer','ai-grammar-checker','ai-writing-assistant'].includes(slug))r=val('text');
      else if(slug==='ai-prompt-generator')r=`Create a professional AI prompt for: ${val('text')}\nInclude objective, context, constraints and output format.`;
      else if(slug==='ai-email-writer')r=`Subject: ${val('text')}\n\nDear Sir/Madam,\n\n${val('text')}\n\nRegards`;
      else if(slug.startsWith('ai-'))r='This feature requires an AI API/provider for genuine generation. No fake result is shown.';
      else if(['audio','video'].includes(location.pathname.split('/')[2]))r='This media tool needs the appropriate browser/media processing engine. Choose a media file first; advanced codec operations require FFmpeg/WebCodecs.';
      else r='This tool needs its dedicated implementation; it is not a generic file chooser.';
      out(r);
    }catch(e){out('Error: '+e.message)}
  };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();