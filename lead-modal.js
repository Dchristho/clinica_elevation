/*!
 * Clinica Elevation - Lead Capture Modal
 * Two-step exit-intent / timed popup with WhatsApp redirect.
 * Self-contained: injects its own HTML + CSS.
 */
(function () {
  'use strict';

  var DELAY_MS    = 6000;
  var SESSION_KEY = 'elev_modal_shown';
  var WA_NUMBER   = '5511942748070';

  if (sessionStorage.getItem(SESSION_KEY)) return;

  /* === CSS === */
  var style = document.createElement('style');
  style.textContent = [
    '#elev-modal-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;visibility:hidden;transition:opacity .45s cubic-bezier(.16,1,.3,1),visibility .45s cubic-bezier(.16,1,.3,1)}',
    '#elev-modal-overlay.elev-visible{opacity:1;visibility:visible}',
    '#elev-modal-card{position:relative;display:flex;width:100%;max-width:820px;min-height:440px;border-radius:20px;overflow:hidden;background:#0e1015;border:1px solid rgba(212,175,55,.22);box-shadow:0 0 0 1px rgba(212,175,55,.08),0 32px 80px rgba(0,0,0,.7),0 0 60px rgba(212,175,55,.08) inset;transform:scale(.92) translateY(20px);transition:transform .45s cubic-bezier(.16,1,.3,1)}',
    '#elev-modal-overlay.elev-visible #elev-modal-card{transform:scale(1) translateY(0)}',
    '#elev-modal-close{position:absolute;top:14px;right:16px;z-index:10;width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:rgba(255,255,255,.6);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .25s,color .25s,border-color .25s}',
    '#elev-modal-close:hover{background:rgba(212,175,55,.15);color:#d4af37;border-color:rgba(212,175,55,.35)}',
    '#elev-modal-img{flex:0 0 45%;background:linear-gradient(160deg,rgba(212,175,55,.12) 0%,rgba(0,0,0,0) 60%),url("https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80&auto=format&fit=crop") center/cover no-repeat;position:relative}',
    '#elev-modal-img::after{content:"";position:absolute;inset:0;background:linear-gradient(to right,transparent 60%,#0e1015 100%)}',
    '#elev-modal-img::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#d4af37,transparent);z-index:2}',
    '#elev-modal-content{flex:1;display:flex;flex-direction:column;justify-content:center;padding:40px 36px 36px;position:relative}',
    '.elev-step{display:none;flex-direction:column;gap:20px;animation:elevFadeIn .4s cubic-bezier(.16,1,.3,1) both}',
    '.elev-step.elev-active{display:flex}',
    '@keyframes elevFadeIn{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}',
    '.elev-eyebrow{font-family:"Satoshi","Plus Jakarta Sans",sans-serif;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#d4af37}',
    '.elev-heading{font-family:"Cabinet Grotesk","Plus Jakarta Sans",sans-serif;font-size:clamp(1.4rem,3vw,1.85rem);font-weight:800;letter-spacing:-.03em;color:#fff;line-height:1.15}',
    '.elev-heading span{color:#d4af37}',
    '.elev-subtext{font-family:"Satoshi","Plus Jakarta Sans",sans-serif;font-size:.9rem;color:rgba(255,255,255,.55);line-height:1.55;margin-top:-6px}',
    '.elev-btn-group{display:flex;flex-direction:column;gap:10px;margin-top:6px}',
    '.elev-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 20px;border-radius:10px;font-family:"Cabinet Grotesk","Plus Jakarta Sans",sans-serif;font-size:.9rem;font-weight:700;letter-spacing:.05em;cursor:pointer;border:none;transition:transform .2s,box-shadow .2s,background .2s}',
    '.elev-btn:hover{transform:translateY(-2px)}.elev-btn:active{transform:translateY(0)}',
    '.elev-btn-primary{background:linear-gradient(135deg,#d4af37 0%,#f5df93 50%,#d4af37 100%);color:#09090b;box-shadow:0 4px 20px rgba(212,175,55,.35)}',
    '.elev-btn-primary:hover{box-shadow:0 8px 30px rgba(212,175,55,.5)}',
    '.elev-btn-secondary{background:rgba(212,175,55,.1);color:#d4af37;border:1px solid rgba(212,175,55,.3)}',
    '.elev-btn-secondary:hover{background:rgba(212,175,55,.18);border-color:rgba(212,175,55,.5)}',
    '.elev-form{display:flex;flex-direction:column;gap:12px}',
    '.elev-input{width:100%;padding:13px 16px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#fff;font-family:"Satoshi","Plus Jakarta Sans",sans-serif;font-size:.9rem;outline:none;transition:border-color .25s,background .25s,box-shadow .25s}',
    '.elev-input::placeholder{color:rgba(255,255,255,.3)}',
    '.elev-input:focus{border-color:rgba(212,175,55,.5);background:rgba(212,175,55,.06);box-shadow:0 0 0 3px rgba(212,175,55,.1)}',
    '.elev-submit{margin-top:4px;padding:15px;border-radius:10px;background:linear-gradient(135deg,#d4af37 0%,#f5df93 50%,#d4af37 100%);color:#09090b;font-family:"Cabinet Grotesk","Plus Jakarta Sans",sans-serif;font-size:.95rem;font-weight:800;letter-spacing:.04em;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(212,175,55,.35);transition:transform .2s,box-shadow .2s;display:flex;align-items:center;justify-content:center;gap:8px}',
    '.elev-submit:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(212,175,55,.5)}.elev-submit:active{transform:translateY(0)}',
    '.elev-progress{display:flex;align-items:center;gap:6px;margin-bottom:4px}',
    '.elev-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.2);transition:background .3s,width .3s}',
    '.elev-dot.elev-dot-active{background:#d4af37;width:18px;border-radius:3px}',
    '.elev-privacy{font-size:11px;color:rgba(255,255,255,.28);text-align:center;margin-top:2px}',
    '@media(max-width:640px){#elev-modal-card{flex-direction:column;min-height:unset;border-radius:16px}#elev-modal-img{flex:none;height:160px}#elev-modal-img::after{background:linear-gradient(to bottom,transparent 40%,#0e1015 100%)}#elev-modal-content{padding:28px 22px 24px}.elev-heading{font-size:1.35rem}}',
    '@media(max-width:400px){#elev-modal-img{display:none}}'
  ].join('');
  document.head.appendChild(style);

  /* === HTML === */
  var overlay = document.createElement('div');
  overlay.id = 'elev-modal-overlay';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','Oferta especial da Clinica Elevation');
  overlay.innerHTML = '<div id="elev-modal-card"><div id="elev-modal-img" aria-hidden="true"></div><div id="elev-modal-content"><button id="elev-modal-close" aria-label="Fechar">\u00d7</button><div class="elev-step elev-active" id="elev-step-1"><div class="elev-progress"><div class="elev-dot elev-dot-active"></div><div class="elev-dot"></div></div><div class="elev-eyebrow">\u2726 Presente exclusivo</div><h2 class="elev-heading">Ei, n\u00e3o v\u00e1 embora,<br><span>VOC\u00ca GANHOU UM PRESENTE!</span></h2><p class="elev-subtext">Clique e resgate seu presente:</p><div class="elev-btn-group"><button class="elev-btn elev-btn-primary" id="elev-facial-btn">\u2726 QUERO FACIAL</button><button class="elev-btn elev-btn-secondary" id="elev-corporal-btn">\u2726 QUERO CORPORAL</button></div></div><div class="elev-step" id="elev-step-2"><div class="elev-progress"><div class="elev-dot"></div><div class="elev-dot elev-dot-active"></div></div><div class="elev-eyebrow">\u2726 \u00daltimo passo</div><h2 class="elev-heading">S\u00f3 mais um passo para<br><span>resgatar seu presente!</span></h2><p class="elev-subtext">Preencha abaixo para garantir seu atendimento exclusivo:</p><form class="elev-form" id="elev-lead-form" novalidate><input class="elev-input" id="elev-nome" type="text" placeholder="Seu nome completo" required autocomplete="name"><input class="elev-input" id="elev-email" type="email" placeholder="Seu melhor e-mail" required autocomplete="email"><input class="elev-input" id="elev-telefone" type="tel" placeholder="WhatsApp (DDD + n\u00famero)" required autocomplete="tel" inputmode="numeric" maxlength="15"><button type="submit" class="elev-submit">RESGATAR MEU PRESENTE \u2192</button><p class="elev-privacy">\ud83d\udd12 Seus dados est\u00e3o protegidos. N\u00e3o enviamos spam.</p></form></div></div></div>';
  document.body.appendChild(overlay);

  /* === State === */
  var choiceLabel = '';
  var triggered   = false;

  /* === Helpers === */
  function open() {
    sessionStorage.setItem(SESSION_KEY, '1');
    overlay.classList.add('elev-visible');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('elev-visible');
    document.body.style.overflow = '';
  }
  function goToStep2() {
    document.getElementById('elev-step-1').classList.remove('elev-active');
    document.getElementById('elev-step-2').classList.add('elev-active');
  }
  function maskPhone(v) {
    var d = v.replace(/\D/g,'').slice(0,11);
    if (d.length <= 2)  return '(' + d;
    if (d.length <= 7)  return '(' + d.slice(0,2) + ') ' + d.slice(2);
    return '(' + d.slice(0,2) + ') ' + d.slice(2,7) + '-' + d.slice(7);
  }

  /* === Events === */
  document.getElementById('elev-modal-close').addEventListener('click', close);
  overlay.addEventListener('click', function(e){ if (e.target === overlay) close(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });

  document.getElementById('elev-facial-btn').addEventListener('click', function(){
    choiceLabel = 'Facial'; goToStep2();
  });
  document.getElementById('elev-corporal-btn').addEventListener('click', function(){
    choiceLabel = 'Corporal'; goToStep2();
  });

  document.getElementById('elev-telefone').addEventListener('input', function(){
    this.value = maskPhone(this.value);
  });

  document.getElementById('elev-lead-form').addEventListener('submit', function(e){
    e.preventDefault();
    var nome     = document.getElementById('elev-nome').value.trim();
    var email    = document.getElementById('elev-email').value.trim();
    var telefone = document.getElementById('elev-telefone').value.trim();
    var valid    = true;
    [['elev-nome',nome],['elev-email',email],['elev-telefone',telefone]].forEach(function(pair){
      if (!pair[1]) {
        valid = false;
        var el = document.getElementById(pair[0]);
        el.style.borderColor = 'rgba(255,80,80,.6)';
        el.style.boxShadow   = '0 0 0 3px rgba(255,80,80,.12)';
        setTimeout(function(){ el.style.borderColor=''; el.style.boxShadow=''; }, 2000);
      }
    });
    if (!valid) return;
    var waMsg = encodeURIComponent('Ola! Meu nome e ' + nome + '. Reivindiquei meu presente gratis (' + choiceLabel + ') pelo site e gostaria de saber como funciona para marcar meu horario. Meu e-mail: ' + email);
    close();
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + waMsg, '_blank', 'noopener,noreferrer');
  });

  /* === Triggers === */
  function trigger() {
    if (triggered) return;
    triggered = true;
    clearTimeout(timerHandle);
    open();
  }
  document.addEventListener('mouseleave', function(e){ if (e.clientY <= 0) trigger(); });
  var timerHandle = setTimeout(trigger, DELAY_MS);

})();
