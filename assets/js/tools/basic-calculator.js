
/* OneToolBox Basic Calculator — real calculator logic */
(() => {
  const exprEl = document.getElementById('expressionDisplay');
  const ansEl = document.getElementById('answerDisplay');
  const statusEl = document.getElementById('statusText');
  const historyBtn = document.getElementById('historyBtn');

  let expression = '';
  let answer = 0;
  let angleMode = 'DEG';
  let inverse = false;
  let history = [];

  const setDisplay = () => {
    exprEl.textContent = expression || '0';
    ansEl.textContent = format(answer);
  };
  const format = (n) => {
    if (typeof n !== 'number' || !Number.isFinite(n)) return 'Error';
    if (Math.abs(n) < 1e-12) n = 0;
    return Number(n.toPrecision(12)).toString();
  };
  const setStatus = (s) => statusEl.textContent = s;

  function insert(v){
    expression += v;
    exprEl.textContent = expression;
    setStatus('Editing');
  }

  function factorial(n){
    if (!Number.isFinite(n) || n < 0 || n > 170 || Math.floor(n) !== n) throw new Error('Invalid factorial');
    let r=1;
    for(let i=2;i<=n;i++) r*=i;
    return r;
  }

  function evaluate(raw){
    let s = raw.replace(/\s+/g,'')
      .replace(/π/g,'PI')
      .replace(/Ans/g,'ANS')
      .replace(/√/g,'sqrt')
      .replace(/×/g,'*')
      .replace(/÷/g,'/')
      .replace(/\^/g,'**');

    // Percent behaves as division by 100.
    s = s.replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');

    // Factorial: number or closing parenthesis followed by !.
    while(/(\d+(?:\.\d+)?|\([^()]*\))!/.test(s)){
      s=s.replace(/(\d+(?:\.\d+)?|\([^()]*\))!/g,'fact($1)');
    }

    const toRad = x => angleMode === 'DEG' ? x*Math.PI/180 : x;
    const sin = x => Math.sin(toRad(x));
    const cos = x => Math.cos(toRad(x));
    const tan = x => Math.tan(toRad(x));
    const asin = x => angleMode === 'DEG' ? Math.asin(x)*180/Math.PI : Math.asin(x);
    const acos = x => angleMode === 'DEG' ? Math.acos(x)*180/Math.PI : Math.acos(x);
    const atan = x => angleMode === 'DEG' ? Math.atan(x)*180/Math.PI : Math.atan(x);

    // Only calculator characters/functions are accepted.
    if(!/^[0-9+\-*/().,A-Za-z_*]+$/.test(s)) throw new Error('Invalid expression');
    if(/(?:window|document|constructor|prototype|eval|Function|alert)/i.test(s)) throw new Error('Invalid expression');

    const fn = new Function(
      'PI','E','ANS','sin','cos','tan','asin','acos','atan','sqrt','ln','log','exp','fact',
      `"use strict"; return (${s});`
    );
    return Number(fn(Math.PI,Math.E,answer,sin,cos,tan,asin,acos,atan,Math.sqrt,Math.log,Math.log10,Math.exp,factorial));
  }

  function calculate(){
    if(!expression) return;
    try{
      const result=evaluate(expression);
      if(!Number.isFinite(result)) throw new Error('Math error');
      history.unshift({expression,result});
      history=history.slice(0,10);
      answer=result;
      setDisplay();
      setStatus('Calculated');
    }catch(e){
      ansEl.textContent='Error';
      setStatus(e.message);
    }
  }

  function clear(){
    expression='';
    answer=0;
    setDisplay();
    setStatus('Ready');
  }

  function backspace(){
    expression=expression.slice(0,-1);
    exprEl.textContent=expression||'0';
    setStatus('Editing');
  }

  document.querySelectorAll('[data-insert]').forEach(btn=>{
    btn.addEventListener('click',()=>insert(btn.dataset.insert));
  });
  document.querySelectorAll('[data-mode]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      angleMode=btn.dataset.mode;
      document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x===btn));
      setStatus(angleMode+' mode');
    });
  });
  document.querySelector('[data-action="equals"]')?.addEventListener('click',calculate);
  document.querySelector('[data-action="clear"]')?.addEventListener('click',clear);
  document.querySelector('[data-action="backspace"]')?.addEventListener('click',backspace);
  document.querySelector('[data-action="toggle-inv"]')?.addEventListener('click',()=>{
    inverse=!inverse;
    document.querySelector('[data-action="toggle-inv"]').classList.toggle('active',inverse);
    document.querySelector('[data-insert="sin("]').textContent=inverse?'sin⁻¹':'sin';
    document.querySelector('[data-insert="cos("]').textContent=inverse?'cos⁻¹':'cos';
    document.querySelector('[data-insert="tan("]').textContent=inverse?'tan⁻¹':'tan';
    // Swap the inserted function names.
    document.querySelector('[data-insert="sin("]').dataset.insert=inverse?'asin(':'sin(';
    document.querySelector('[data-insert="cos("]').dataset.insert=inverse?'acos(':'cos(';
    document.querySelector('[data-insert="tan("]').dataset.insert=inverse?'atan(':'tan(';
  });
  document.querySelector('[data-action="copy"]')?.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(format(answer));setStatus('Copied');}
    catch{setStatus('Copy unavailable');}
  });

  historyBtn?.addEventListener('click',()=>{
    if(!history.length){setStatus('No history');return;}
    const last=history.slice(0,5).map(x=>`${x.expression} = ${format(x.result)}`).join('  |  ');
    setStatus(last);
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();calculate();}
    else if(e.key==='Escape'){e.preventDefault();clear();}
    else if(e.key==='Backspace'){e.preventDefault();backspace();}
    else if(/^[0-9.+\-*/()]$/.test(e.key)){insert(e.key);}
    else if(e.key==='%'){insert('%');}
  });

  setDisplay();
})();
