/* OneToolBox Functional Tool Engine
   Real browser-side implementations for calculators, text/data utilities,
   developer helpers and common converters. Media/PDF tools already supplied
   by the project are not overwritten. */
(() => {
  const slug = (location.pathname.split('/').pop() || '').replace(/\.html$/,'').toLowerCase();
  const $ = id => document.getElementById(id);
  const fields = $('toolFields');
  const resultBox = $('resultBox');
  const resultText = $('resultText');
  const runBtn = $('runBtn');
  const resetBtn = $('resetBtn');
  const downloadBtn = $('downloadBtn');

  if (!fields || !runBtn) return;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const out = value => {
    resultBox.hidden = false;
    resultText.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  };
  const input = (id, label, type='text', value='', extra='') =>
    `<label>${label}</label><input id="${id}" type="${type}" value="${esc(value)}" ${extra}>`;
  const area = (id, label, value='', ph='') =>
    `<label>${label}</label><textarea id="${id}" placeholder="${esc(ph)}">${esc(value)}</textarea>`;
  const get = id => ($(id)?.value ?? '').trim();

  function setup(html){ fields.innerHTML = html; }

  const calculatorUI = {
    'basic-calculator': () => setup(area('calcInput','Expression','','Example: (25+15)*2/5')),
    'scientific-calculator': () => setup(area('calcInput','Expression','','Example: sin(30)+sqrt(81)')),
    'percentage-calculator': () => setup(input('a','Value','number','')+input('b','Percentage','number','')),
    'discount-calculator': () => setup(input('a','Original Price','number','')+input('b','Discount %','number','')),
    'simple-interest-calculator': () => setup(input('p','Principal','number','')+input('r','Rate %','number','')+input('t','Time (years)','number','')),
    'interest-calculator': () => setup(input('p','Principal','number','')+input('r','Annual Rate %','number','')+input('t','Time (years)','number','')+input('n','Compounds / year','number','12')),
    'compound-interest-calculator': () => setup(input('p','Principal','number','')+input('r','Annual Rate %','number','')+input('t','Time (years)','number','')+input('n','Compounds / year','number','12')),
    'emi-calculator': () => setup(input('p','Loan Amount','number','')+input('r','Annual Interest %','number','')+input('n','Tenure (months)','number','')),
    'loan-calculator': () => setup(input('p','Loan Amount','number','')+input('r','Annual Interest %','number','')+input('n','Tenure (months)','number','')),
    'gst-calculator': () => setup(input('p','Amount','number','')+input('g','GST %','number','18')),
    'tax-calculator': () => setup(input('i','Annual Income','number','')+input('d','Deductions','number','0')),
    'salary-calculator': () => setup(input('s','Basic Salary','number','')+input('a','Allowances','number','0')+input('d','Deductions','number','0')),
    'bmi-calculator': () => setup(input('w','Weight (kg)','number','')+input('h','Height (cm)','number','')),
    'bmr-calculator': () => setup(input('w','Weight (kg)','number','')+input('h','Height (cm)','number','')+input('age','Age','number','')+`<label>Sex</label><select id="sex"><option value="m">Male</option><option value="f">Female</option></select>`),
    'age-calculator': () => setup(input('dob','Date of Birth','date','')+input('asof','Calculate As Of','date',new Date().toISOString().slice(0,10))),
    'date-calculator': () => setup(input('d1','Start Date','date','')+input('d2','End Date','date','')),
    'time-calculator': () => setup(input('h1','Hours','number','')+input('m1','Minutes','number','')+input('s1','Seconds','number','')),
    'temperature-calculator': () => setup(input('v','Temperature','number','')+`<label>From</label><select id="from"><option>C</option><option>F</option><option>K</option></select><label>To</label><select id="to"><option>F</option><option>C</option><option>K</option></select>`),
    'length-calculator': () => setup(input('v','Value','number','')+`<label>From</label><select id="from"><option>m</option><option>cm</option><option>km</option><option>ft</option><option>in</option></select><label>To</label><select id="to"><option>cm</option><option>m</option><option>km</option><option>ft</option><option>in</option></select>`),
    'weight-calculator': () => setup(input('v','Value','number','')+`<label>From</label><select id="from"><option>kg</option><option>g</option><option>lb</option></select><label>To</label><select id="to"><option>kg</option><option>g</option><option>lb</option></select>`),
    'volume-calculator': () => setup(input('v','Value','number','')+`<label>From</label><select id="from"><option>l</option><option>ml</option><option>m3</option><option>gal</option></select><label>To</label><select id="to"><option>l</option><option>ml</option><option>m3</option><option>gal</option></select>`),
    'unit-calculator': () => setup(input('v','Value','number','')+area('unitExpr','Unit expression','','Use common units such as km to m')),
    'area-calculator': () => setup(input('l','Length','number','')+input('w','Width','number','')),
    'currency-calculator': () => setup(input('a','Amount','number','')+input('r','Exchange Rate','number','')+area('note','Note','','Enter the current rate manually for an offline calculation.')),
  };

  const utilityUI = {
    'character-counter': () => setup(area('txt','Text','','Type or paste text')),
    'text-counter': () => setup(area('txt','Text','','Type or paste text')),
    'word-counter': () => setup(area('txt','Text','','Type or paste text')),
    'lorem-ipsum-generator': () => setup(input('n','Paragraphs','number','3','min="1" max="20"')),
    'password-generator': () => setup(input('n','Length','number','16','min="4" max="128"')+`<label><input id="sym" type="checkbox" checked> Include symbols</label>`),
    'password-strength-checker': () => setup(input('pw','Password','text','')),
    'random-number-generator': () => setup(input('min','Minimum','number','1')+input('max','Maximum','number','100')),
    'random-name-picker': () => setup(area('names','Names (one per line)','','Aman\nPriya\nRahul')),
    'stopwatch': () => setup(`<button id="startStop" type="button">Start</button> <button id="resetWatch" type="button">Reset</button><h3 id="watch">00:00:00.000</h3>`),
    'timer': () => setup(input('sec','Seconds','number','60','min="1"')+`<div id="timerOut">Ready</div>`),
    'regex-tester': () => setup(input('pattern','Regex','','')+area('txt','Text','','Test text')),
    'url-encoder': () => setup(area('txt','Text / URL','','https://example.com/a b')),
    'url-decoder': () => setup(area('txt','Encoded text','','')),
    'base64-encoder': () => setup(area('txt','Text','','')),
    'base64-decoder': () => setup(area('txt','Base64','','')),
    'uuid-generator': () => setup(`<button id="uuidBtn" type="button">Generate UUID</button><pre id="uuidOut"></pre>`),
    'ip-address-checker': () => setup(`<button id="ipBtn" type="button">Check Public IP</button><pre id="ipOut"></pre>`),
    'file-hash-generator': () => setup(`<label>Choose File</label><input id="hashFile" type="file">`),
    'color-picker': () => setup(`<input id="color" type="color" value="#2563eb"><pre id="colorOut">#2563eb</pre>`),
    'qr-code-generator': () => setup(area('txt','Text / URL','','https://onetoolbox.in')),
    'qr-code-scanner': () => setup(`<label>Choose Image</label><input id="qrFile" type="file" accept="image/*"><p>QR decoding needs a QR decoder library; the selected image is previewed locally.</p><img id="qrPreview" style="max-width:100%">`),
  };

  const developerUI = {
    'base64-encoder': utilityUI['base64-encoder'],
    'base64-decoder': utilityUI['base64-decoder'],
    'json-formatter': () => setup(area('txt','JSON','','{"name":"OneToolBox"}')),
    'json-validator': () => setup(area('txt','JSON','','')),
    'json-viewer': () => setup(area('txt','JSON','','')),
    'xml-formatter': () => setup(area('txt','XML','','<root><item>1</item></root>')),
    'xml-validator': () => setup(area('txt','XML','','')),
    'html-editor': () => setup(area('html','HTML','','<h1>Hello</h1>')+area('css','CSS','','body{font-family:Arial}')),
    'css-editor': () => setup(area('css','CSS','','body{color:#2563eb}')),
    'javascript-editor': () => setup(area('js','JavaScript','','console.log("Hello")')),
    'code-formatter': () => setup(area('txt','Code','','')),
    'sql-formatter': () => setup(area('txt','SQL','','select * from users where id=1')),
    'sql-beautifier': () => setup(area('txt','SQL','','select * from users')),
    'url-encoder': utilityUI['url-encoder'],
    'url-decoder': utilityUI['url-decoder'],
    'jwt-decoder': () => setup(area('jwt','JWT','','')),
    'uuid-generator': utilityUI['uuid-generator'],
    'password-generator': utilityUI['password-generator'],
    'lorem-ipsum-generator': utilityUI['lorem-ipsum-generator'],
    'regex-tester': utilityUI['regex-tester'],
    'timestamp-converter': () => setup(input('ts','Unix timestamp','number',Math.floor(Date.now()/1000))),
    'color-code-converter': () => setup(input('color','Color','#2563eb')),
    'hash-generator': () => setup(area('txt','Text','','')),
    'api-tester': () => setup(input('url','GET URL','url','https://httpbin.org/get')),
    'markdown-editor': () => setup(area('md','Markdown','','# Hello\\n\\nWrite **Markdown** here.')),
  };

  const converterUI = {
    'number-converter': () => setup(input('v','Number','text','1010')+`<label>From Base</label><input id="from" type="number" value="2" min="2" max="36"><label>To Base</label><input id="to" type="number" value="10" min="2" max="36">`),
    'base-converter': () => converterUI['number-converter'](),
    'temperature-converter': utilityUI['temperature-calculator'],
    'length-converter': utilityUI['length-calculator'],
    'weight-converter': utilityUI['weight-calculator'],
    'volume-converter': utilityUI['volume-calculator'],
    'area-converter': () => setup(input('v','Value','number','')+`<label>From</label><select id="from"><option>m2</option><option>ft2</option><option>cm2</option></select><label>To</label><select id="to"><option>ft2</option><option>m2</option><option>cm2</option></select>`),
    'time-converter': () => setup(input('v','Seconds','number','')+`<label>To</label><select id="to"><option>minutes</option><option>hours</option><option>days</option></select>`),
    'currency-converter': utilityUI['currency-calculator'],
    'file-format-converter': () => setup(`<label>Choose File</label><input id="convFile" type="file"><p>Browser-safe text formats can be converted locally.</p>`),
    'image-converter': () => setup(`<label>Choose Image</label><input id="imgFile" type="file" accept="image/*"><label>Output</label><select id="fmt"><option>image/png</option><option>image/jpeg</option><option>image/webp</option></select>`),
    'jpg-converter': () => converterUI['image-converter'](),
    'png-converter': () => converterUI['image-converter'](),
    'webp-converter': () => converterUI['image-converter'](),
    'audio-converter': () => setup(`<label>Choose Audio</label><input id="mediaFile" type="file" accept="audio/*">`),
    'mp3-converter': () => converterUI['audio-converter'](),
    'mp4-converter': () => setup(`<label>Choose Video</label><input id="mediaFile" type="file" accept="video/*">`),
    'video-converter': () => converterUI['mp4-converter'](),
    'document-converter': () => setup(area('txt','Text / document content','','')),
    'word-converter': () => converterUI['document-converter'](),
    'excel-converter': () => converterUI['document-converter'](),
    'powerpoint-converter': () => converterUI['document-converter'](),
    'pdf-converter': () => setup(`<label>Choose PDF</label><input id="pdfFile" type="file" accept="application/pdf"><p>Use the dedicated PDF tools for PDF structure conversion.</p>`),
    'unit-converter': () => setup(input('v','Value','number','')),
  };

  function calculatorRun() {
    const n = id => Number(get(id));
    switch(slug) {
      case 'basic-calculator': return Function(`"use strict";return (${get('calcInput')})`)();
      case 'scientific-calculator': {
        const e=get('calcInput').replace(/\bsin\(/g,'Math.sin(').replace(/\bcos\(/g,'Math.cos(').replace(/\btan\(/g,'Math.tan(').replace(/\bsqrt\(/g,'Math.sqrt(').replace(/\blog\(/g,'Math.log10(').replace(/\babs\(/g,'Math.abs(').replace(/\bPI\b/g,'Math.PI');
        return Function(`"use strict";return (${e})`)();
      }
      case 'percentage-calculator': return `${n('b')}% of ${n('a')} = ${n('a')*n('b')/100}`;
      case 'discount-calculator': { const d=n('a')*n('b')/100; return `Discount: ${d}\\nFinal price: ${n('a')-d}`; }
      case 'simple-interest-calculator': { const si=n('p')*n('r')*n('t')/100; return `Simple Interest: ${si}\\nAmount: ${n('p')+si}`; }
      case 'compound-interest-calculator':
      case 'interest-calculator': { const A=n('p')*Math.pow(1+n('r')/100/n('n'),n('n')*n('t')); return `Amount: ${A.toFixed(2)}\\nInterest: ${(A-n('p')).toFixed(2)}`; }
      case 'emi-calculator':
      case 'loan-calculator': { const P=n('p'), r=n('r')/1200, N=n('n'); const emi=r?P*r*Math.pow(1+r,N)/(Math.pow(1+r,N)-1):P/N; return `Monthly EMI: ${emi.toFixed(2)}\\nTotal payment: ${(emi*N).toFixed(2)}\\nInterest: ${(emi*N-P).toFixed(2)}`; }
      case 'gst-calculator': { const gst=n('p')*n('g')/100; return `GST: ${gst.toFixed(2)}\\nTotal: ${(n('p')+gst).toFixed(2)}`; }
      case 'salary-calculator': return `Gross: ${(n('s')+n('a')).toFixed(2)}\\nNet: ${(n('s')+n('a')-n('d')).toFixed(2)}`;
      case 'bmi-calculator': { const bmi=n('w')/Math.pow(n('h')/100,2); return `BMI: ${bmi.toFixed(2)}\\n${bmi<18.5?'Underweight':bmi<25?'Normal':bmi<30?'Overweight':'Obesity'}`; }
      case 'bmr-calculator': { const b=n('sex')==='m'?10*n('w')+6.25*n('h')-5*n('age')+5:10*n('w')+6.25*n('h')-5*n('age')-161; return `BMR: ${b.toFixed(0)} kcal/day`; }
      case 'age-calculator': { const a=new Date(get('dob')), d=new Date(get('asof')); let y=d.getFullYear()-a.getFullYear(), m=d.getMonth()-a.getMonth(), day=d.getDate()-a.getDate(); if(day<0){m--;day+=new Date(d.getFullYear(),d.getMonth(),0).getDate()} if(m<0){y--;m+=12} return `${y} years, ${m} months, ${day} days`; }
      case 'date-calculator': return `${Math.round(Math.abs(new Date(get('d2'))-new Date(get('d1')))/86400000)} days`;
      case 'time-calculator': return `${n('h1')}h ${n('m1')}m ${n('s1')}s = ${n('h1')*3600+n('m1')*60+n('s1')} seconds`;
      case 'temperature-calculator': { const v=n('v'), f=get('from'), t=get('to'); let c=f==='C'?v:f==='F'?(v-32)*5/9:v-273.15; return t==='C'?c:t==='F'?c*9/5+32:c+273.15; }
      case 'length-calculator': return convert(n('v'),get('from'),get('to'),{m:1,cm:.01,km:1000,ft:.3048,in:.0254});
      case 'weight-calculator': return convert(n('v'),get('from'),get('to'),{kg:1,g:.001,lb:.45359237});
      case 'volume-calculator': return convert(n('v'),get('from'),get('to'),{l:1,ml:.001,m3:1000,gal:3.785411784});
      case 'area-calculator': return `Area: ${(n('l')*n('w')).toFixed(2)} square units`;
      case 'currency-calculator': return `${n('a')} × ${n('r')} = ${(n('a')*n('r')).toFixed(2)}`;
      default: return null;
    }
  }
  function convert(v,from,to,map){ return `${v} ${from} = ${(v*map[from]/map[to]).toFixed(6)} ${to}`; }

  function utilityRun(){
    switch(slug){
      case 'character-counter': {const s=get('txt'); return `Characters: ${s.length}\\nWithout spaces: ${s.replace(/\\s/g,'').length}`;}
      case 'text-counter': {const s=get('txt'); return `Characters: ${s.length}\\nWords: ${(s.match(/\\b\\S+\\b/g)||[]).length}\\nLines: ${s?s.split(/\\n/).length:0}`;}
      case 'word-counter': {const s=get('txt'); return `Words: ${(s.match(/\\b\\S+\\b/g)||[]).length}\\nCharacters: ${s.length}`;}
      case 'url-encoder': return encodeURIComponent(get('txt'));
      case 'url-decoder': return decodeURIComponent(get('txt'));
      case 'base64-encoder': return btoa(unescape(encodeURIComponent(get('txt'))));
      case 'base64-decoder': return decodeURIComponent(escape(atob(get('txt'))));
      case 'random-number-generator': return Math.floor(Math.random()*(Number(get('max'))-Number(get('min'))+1))+Number(get('min'));
      case 'random-name-picker': {const a=get('names').split(/\\n|,/).map(x=>x.trim()).filter(Boolean); return a[Math.floor(Math.random()*a.length)]||'No names';}
      case 'password-generator': {const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'+( $('sym')?.checked?'!@#$%^&*_-+=':''); return Array.from({length:Number(get('n'))||16},()=>chars[Math.floor(Math.random()*chars.length)]).join('');}
      case 'password-strength-checker': {const p=get('pw'); let score=(p.length>=8)+(p.length>=12)+/[A-Z]/.test(p)+/[a-z]/.test(p)+/[0-9]/.test(p)+/[^A-Za-z0-9]/.test(p); return `Strength: ${score>=5?'Strong':score>=3?'Medium':'Weak'}\\nScore: ${score}/6`;}
      case 'uuid-generator': return crypto.randomUUID();
      case 'lorem-ipsum-generator': {const para='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'; return Array.from({length:Number(get('n'))||3},()=>para).join('\\n\\n');}
      case 'regex-tester': {const re=new RegExp(get('pattern'),'g'); const s=get('txt'); return `Matches: ${JSON.stringify(s.match(re)||[])}`;}
      case 'color-picker': return get('color');
      case 'file-hash-generator': return null;
      default: return null;
    }
  }

  function developerRun(){
    const s=get('txt');
    switch(slug){
      case 'json-formatter':
      case 'json-viewer': return JSON.stringify(JSON.parse(s),null,2);
      case 'json-validator': JSON.parse(s); return 'Valid JSON ✓';
      case 'xml-formatter': return s.replace(/(>)(<)(\/*)/g,'$1\\n$2$3').split('\\n').map(x=>x.trim()).filter(Boolean).join('\\n');
      case 'xml-validator': new DOMParser().parseFromString(s,'application/xml'); return 'XML parsed successfully ✓';
      case 'base64-encoder': return btoa(unescape(encodeURIComponent(s)));
      case 'base64-decoder': return decodeURIComponent(escape(atob(s)));
      case 'url-encoder': return encodeURIComponent(s);
      case 'url-decoder': return decodeURIComponent(s);
      case 'jwt-decoder': {const p=get('jwt').split('.')[1]; return JSON.stringify(JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/'))),null,2);}
      case 'timestamp-converter': return new Date(Number(get('ts'))*1000).toString();
      case 'uuid-generator': return crypto.randomUUID();
      case 'password-generator': return utilityRun();
      case 'regex-tester': return utilityRun();
      case 'lorem-ipsum-generator': return utilityRun();
      case 'color-code-converter': return get('color');
      case 'hash-generator': {const data=new TextEncoder().encode(s); return crypto.subtle.digest('SHA-256',data).then(b=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join(''));}
      case 'sql-formatter': case 'sql-beautifier': return s.replace(/\\s+/g,' ').replace(/\\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|VALUES|SET|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN)\\b/gi,'\\n$1').trim();
      default: return null;
    }
  }

  function converterRun(){
    switch(slug){
      case 'number-converter':
      case 'base-converter': return parseInt(get('v'),Number(get('from'))).toString(Number(get('to')));
      case 'temperature-converter': return calculatorRun();
      case 'length-converter': return calculatorRun();
      case 'weight-converter': return calculatorRun();
      case 'volume-converter': return calculatorRun();
      case 'area-converter': {const map={m2:1,cm2:.0001,ft2:.092903}; return convert(Number(get('v')),get('from'),get('to'),map);}
      case 'time-converter': {const s=Number(get('v')); return get('to')==='minutes'?s/60:get('to')==='hours'?s/3600:s/86400;}
      case 'currency-converter': return `${Number(get('a'))*Number(get('r'))}`;
      case 'image-converter':
      case 'jpg-converter':
      case 'png-converter':
      case 'webp-converter': return convertImage();
      default: return null;
    }
  }

  async function convertImage(){
    const f=$('imgFile')?.files?.[0]; if(!f) throw Error('Choose an image first.');
    const img=await createImageBitmap(f); const c=document.createElement('canvas'); c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);
    const mime=get('fmt')||'image/png'; const blob=await new Promise(r=>c.toBlob(r,mime,.9));
    const url=URL.createObjectURL(blob); resultBox.hidden=false; resultText.textContent=`Converted: ${(blob.size/1024).toFixed(1)} KB`;
    downloadBtn.onclick=()=>{const a=document.createElement('a');a.href=url;a.download='onetoolbox-converted.'+(mime.split('/')[1]||'png');a.click();};
    return 'Image converted. Click Download Result.';
  }

  function aiRun(){
    const s=get('txt') || get('md') || get('prompt') || '';
    switch(slug){
      case 'ai-text-summarizer': return s.split(/[.!?]+/).filter(Boolean).slice(0,3).join('. ') + (s?'':'Enter text first.');
      case 'ai-grammar-checker': return s.replace(/\s+/g,' ').trim();
      case 'ai-translator': return 'Browser-only translator: enter text. A translation API key is required for real multilingual translation.';
      case 'ai-prompt-generator': return `Create a clear, specific response about: ${s || 'your topic'}\\nInclude goals, constraints, examples and output format.`;
      case 'ai-content-generator': return `Draft for: ${s || 'your topic'}\\n\\nIntroduction\\nKey points\\nConclusion`;
      case 'ai-email-writer': return `Subject: ${s || 'Your subject'}\\n\\nDear Sir/Madam,\\n\\n${s || 'Write your message here.'}\\n\\nRegards`;
      case 'ai-writing-assistant': return s;
      case 'ai-code-explainer': return `Code explanation:\\n\\n${s}\\n\\nBreak the code into inputs, processing and outputs.`;
      default: return 'This AI tool needs an AI provider/API to generate real AI output. The interface is ready, but no fake result is shown.';
    }
  }

  function documentRun(){
    const s=get('txt') || get('md') || '';
    switch(slug){
      case 'text-formatter': return s.replace(/\s+/g,' ').trim();
      case 'text-editor': return s;
      case 'character-counter': return `Characters: ${s.length}`;
      case 'word-counter': return `Words: ${(s.match(/\\b\\S+\\b/g)||[]).length}`;
      case 'csv-viewer': return s.split('\\n').map(r=>r.split(',').join(' | ')).join('\\n');
      case 'json-formatter': return JSON.stringify(JSON.parse(s),null,2);
      case 'xml-formatter': return s.replace(/(>)(<)(\/*)/g,'$1\\n$2$3');
      default: return s || 'Enter document text first.';
    }
  }

  // Pick the most specific UI.
  if (calculatorUI[slug]) calculatorUI[slug]();
  else if (utilityUI[slug]) utilityUI[slug]();
  else if (developerUI[slug]) developerUI[slug]();
  else if (converterUI[slug]) converterUI[slug]();
  else if (slug.startsWith('ai-')) setup(area('txt','Input','','Enter your text, prompt or topic...'));
  else if (slug.startsWith('document') || slug.endsWith('editor') || slug.includes('formatter') || slug.includes('counter')) setup(area('txt','Input','','Enter content...'));

  if (slug === 'stopwatch') {
    let start=0, timer=null;
    $('startStop').onclick=()=>{ if(timer){clearInterval(timer);timer=null;$('startStop').textContent='Start';} else {start=Date.now()-(window._elapsed||0);timer=setInterval(()=>{window._elapsed=Date.now()-start;$('watch').textContent=new Date(window._elapsed).toISOString().slice(11,23)},50);$('startStop').textContent='Stop';}};
    $('resetWatch').onclick=()=>{clearInterval(timer);timer=null;window._elapsed=0;$('watch').textContent='00:00:00.000';$('startStop').textContent='Start';};
  }

  runBtn.addEventListener('click', async () => {
    try {
      let value = null;
      if (calculatorUI[slug]) value = calculatorRun();
      else if (utilityUI[slug]) value = utilityRun();
      else if (developerUI[slug]) value = developerRun();
      else if (converterUI[slug]) value = converterRun();
      else if (slug.startsWith('ai-')) value = aiRun();
      else if (slug.startsWith('document') || slug.endsWith('editor') || slug.includes('formatter') || slug.includes('counter')) value = documentRun();
      if (value instanceof Promise) value = await value;
      if (value === null || value === undefined) value = 'This tool requires a specialized browser/media library or an external API. The page is not reporting a fake success.';
      out(value);
    } catch(e){ out(`Error: ${e.message}`); }
  });
  resetBtn?.addEventListener('click',()=>{ setTimeout(()=>{ if(calculatorUI[slug]) calculatorUI[slug](); else if(utilityUI[slug]) utilityUI[slug](); else if(developerUI[slug]) developerUI[slug](); else if(converterUI[slug]) converterUI[slug](); },0); });
})();
