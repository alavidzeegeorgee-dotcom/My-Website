/* animated checkboxes with ripple */
document.querySelectorAll('.chk').forEach(function(label){
  var cb = label.querySelector('input');
  label.addEventListener('click', function(e){
    var r = document.createElement('span');
    r.className = 'ripple';
    var rect = label.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size + 'px';
    r.style.left = (e.clientX - rect.left - size/2) + 'px';
    r.style.top = (e.clientY - rect.top - size/2) + 'px';
    label.appendChild(r);
    setTimeout(function(){ r.remove(); }, 500);
  });
  cb.addEventListener('change', function(){
    label.classList.toggle('checked', cb.checked);
  });
});

/* custom calendar */
var dpTrigger = document.getElementById('dpTrigger');
var dpPanel = document.getElementById('dpPanel');
var dpGrid = document.getElementById('dpGrid');
var dpMonthLabel = document.getElementById('dpMonthLabel');
var dpTimes = document.getElementById('dpTimes');
var dpTimeGrid = document.getElementById('dpTimeGrid');
var today = new Date(); today.setHours(0,0,0,0);
var viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
var selectedDate = null, selectedTime = null;
var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var dows = ['S','M','T','W','T','F','S'];
var timeSlots = ['9:00 AM','10:00 AM','11:00 AM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];

function renderCalendar(){
  dpMonthLabel.textContent = months[viewDate.getMonth()] + ' ' + viewDate.getFullYear();
  dpGrid.innerHTML = '';
  dows.forEach(function(d){
    var el = document.createElement('div'); el.className='dp-dow'; el.textContent=d; dpGrid.appendChild(el);
  });
  var firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  var daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 0).getDate();
  for(var i=0;i<firstDay;i++){ var e=document.createElement('div'); dpGrid.appendChild(e); }
  for(var d=1; d<=daysInMonth; d++){
    var cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
    var btn = document.createElement('button');
    btn.type='button'; btn.className='dp-day'; btn.textContent=d;
    if(cellDate < today){ btn.classList.add('disabled'); }
    if(selectedDate && cellDate.getTime()===selectedDate.getTime()){ btn.classList.add('sel'); }
    (function(cellDate, btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        selectedDate = cellDate; selectedTime = null;
        renderCalendar();
        dpTimes.style.display = 'block';
        renderTimes();
      });
    })(cellDate, btn);
    dpGrid.appendChild(btn);
  }
}
function renderTimes(){
  dpTimeGrid.innerHTML = '';
  timeSlots.forEach(function(t){
    var b = document.createElement('button');
    b.type='button'; b.className='dp-time'; b.textContent=t;
    if(selectedTime===t) b.classList.add('sel');
    b.addEventListener('click', function(){
      selectedTime = t;
      renderTimes();
      var label = (viewDate.getMonth()===selectedDate.getMonth()?months[selectedDate.getMonth()]:months[selectedDate.getMonth()]) + ' ' + selectedDate.getDate() + ', ' + selectedDate.getFullYear() + ' at ' + t;
      dpTrigger.textContent = label;
      dpTrigger.classList.add('filled');
      dpPanel.classList.remove('open');
    });
    dpTimeGrid.appendChild(b);
  });
}
dpTrigger.addEventListener('click', function(e){
  e.stopPropagation();
  dpPanel.classList.toggle('open');
});
document.getElementById('dpPrev').addEventListener('click', function(e){ e.stopPropagation(); viewDate.setMonth(viewDate.getMonth()-1); renderCalendar(); });
document.getElementById('dpNext').addEventListener('click', function(e){ e.stopPropagation(); viewDate.setMonth(viewDate.getMonth()+1); renderCalendar(); });
document.addEventListener('click', function(e){
  if(!document.getElementById('datepick').contains(e.target)) dpPanel.classList.remove('open');
});
renderCalendar();

document.getElementById('bookForm').addEventListener('submit', function(e){
  e.preventDefault();
  if(!selectedDate || !selectedTime){
    alert('Please select a preferred date and time.');
    return;
  }
  var form = e.target;
  var when = dpTrigger.textContent;
  var services = Array.from(document.querySelectorAll('.chk input:checked')).map(function(cb){return cb.value;}).join(', ') || 'Not specified';
  document.getElementById('hiddenTime').value = when;
  document.getElementById('hiddenServices').value = services;

  var submitBtn = form.querySelector('.submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' }
  }).then(function(response){
    if(response.ok){
      form.style.display = 'none';
      document.getElementById('confirm').style.display = 'block';
    } else {
      throw new Error('Submission failed');
    }
  }).catch(function(){
    submitBtn.disabled = false;
    submitBtn.textContent = 'Request Call';
    alert('Something went wrong sending your request. Please try again, or email us directly at hello@zetraadvertising.com.');
  });
});

/* scroll reveal for Why Choose Us cards */
(function(){
  var cards = document.querySelectorAll('#why-us .card');
  if(!cards.length) return;
  if(!('IntersectionObserver' in window)){
    cards.forEach(function(c){ c.classList.add('revealed'); });
    return;
  }
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var i = Array.prototype.indexOf.call(cards, entry.target);
        setTimeout(function(){ entry.target.classList.add('revealed'); }, i * 100);
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:0.15});
  cards.forEach(function(c){ observer.observe(c); });
})();

/* interactive case-type scenes: drag -> incident -> lead pop-up sequence */
(function(){
  var cards = document.querySelectorAll('.scene-card');
  if(!cards.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ e.target.classList.toggle('in-view', e.isIntersecting); }); }, {threshold:0.2});
    cards.forEach(function(c){ io.observe(c); });
  } else { cards.forEach(function(c){ c.classList.add('in-view'); }); }

  var meter = document.getElementById('leadMeter');
  var numEl = document.getElementById('lmNum');
  var dots = meter ? meter.querySelectorAll('.lm-dots i') : [];
  var delivered = {}, count = 0;
  function markDelivered(key, idx){
    if(!meter || delivered[key]) return;
    delivered[key] = true; count++;
    numEl.textContent = count;
    if(dots[idx]) dots[idx].classList.add('on');
    var c = meter.querySelector('.lm-count');
    c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    if(count === 4) meter.classList.add('complete');
  }

  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function easeIO(t){ return t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2; }
  function tween(dur, fn, done){
    if(reduce || dur <= 0){ fn(1); if(done) done(); return; }
    var s = null;
    function step(ts){
      if(s === null) s = ts;
      var t = clamp((ts - s)/dur, 0, 1);
      fn(t);
      if(t < 1) requestAnimationFrame(step); else if(done) done();
    }
    requestAnimationFrame(step);
  }
  function svgPt(svg, e){
    var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    var m = svg.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : {x:e.clientX, y:e.clientY};
  }
  function armTf(dy, side){
    var d = 25 + dy, L = Math.sqrt(42.25 + d*d), s = L/18;
    var th = Math.atan2(6.5, d) * 180/Math.PI * (side === 'L' ? 1 : -1);
    return 'rotate(' + th + 'deg) scaleY(' + s + ')';
  }

  var CFG = [
    { key:'s1', axis:'x', range:56, lead:'Car Accident \u00b7 Texas', toastAt:1200, recoverMs:1900,
      els:function(svg){ return { car:svg.querySelector('.c1a'), spk:svg.querySelectorAll('.c1a-spk') }; },
      apply:function(e, p, svg){
        e.car.style.transform = 'translateX(' + (-56 + 56*p) + 'px)';
        var a = p*56*6.03;
        for(var i=0;i<e.spk.length;i++) e.spk[i].style.transform = 'rotate(' + a + 'deg)';
        svg.style.setProperty('--spin', a + 'deg');
      },
      reset:function(e, svg){ e.car.style.transform = 'translateX(-56px)'; for(var i=0;i<e.spk.length;i++) e.spk[i].style.transform = 'rotate(0deg)'; svg.style.setProperty('--spin', '0deg'); }
    },
    { key:'s2', axis:'x', range:94, lead:'Slip & Fall \u00b7 Florida', toastAt:1700, recoverMs:1600,
      els:function(svg){ return { body:svg.querySelector('.s2p'), lL:svg.querySelector('.s2p-legL'), lR:svg.querySelector('.s2p-legR'), aL:svg.querySelector('.s2p-armL'), aR:svg.querySelector('.s2p-armR') }; },
      apply:function(e, p){
        var x = -110 + 94*p, a = 18*Math.sin(2*Math.PI*3*p);
        e.body.style.transform = 'translate(' + x + 'px,0px) rotate(0deg)';
        e.lL.style.transform = 'rotate(' + a + 'deg)'; e.lR.style.transform = 'rotate(' + (-a) + 'deg)';
        e.aL.style.transform = 'rotate(' + (-a*0.7) + 'deg)'; e.aR.style.transform = 'rotate(' + (a*0.7) + 'deg)';
      },
      clearLimbs:function(e){ e.lL.style.transform = e.lR.style.transform = e.aL.style.transform = e.aR.style.transform = ''; },
      reset:function(e){ e.body.style.transform = 'translate(-110px,0px) rotate(0deg)'; this.clearLimbs(e); },
      release:function(e, st, setP){ var a0 = 0; this.clearLimbs(e); },
      finish:function(e, svg, later, done){
        var self = this;
        e.body.style.transition = 'opacity .35s ease'; e.body.style.opacity = 0;
        later(380, function(){
          self.reset(e); svg.classList.remove('is-recover');
          later(30, function(){ e.body.style.opacity = 1;
            later(400, function(){ e.body.style.transition = ''; e.body.style.opacity = ''; done(); }); });
        });
      }
    },
    { key:'s3', axis:'y', range:36, lead:"Workers' Comp \u00b7 Ohio", toastAt:1300, recoverMs:1700,
      els:function(svg){ return { crate:svg.querySelector('.s3-crate'), hands:svg.querySelector('.s3-hands'), aL:svg.querySelector('.s3-armL'), aR:svg.querySelector('.s3-armR') }; },
      apply:function(e, p){
        var dy = -13*p;
        e.crate.style.transform = e.hands.style.transform = 'translateY(' + dy + 'px)';
        e.aL.style.transform = armTf(dy, 'L'); e.aR.style.transform = armTf(dy, 'R');
      },
      reset:function(e){ e.crate.style.transform = e.hands.style.transform = 'translateY(0px)'; e.aL.style.transform = armTf(0, 'L'); e.aR.style.transform = armTf(0, 'R'); },
      release:function(e, st, setP){ var p0 = st.p; tween(260 + 300*p0, function(t){ setP(p0*(1 - easeIO(t))); }); }
    },
    { key:'s4', axis:'x', range:112, lead:'Dog Bite \u00b7 California', toastAt:1500, recoverMs:2900,
      els:function(svg){ return { dog:svg.querySelector('.s4-dog') }; },
      apply:function(e, p){
        var x = -120 + 112*p, y = -Math.abs(Math.sin(2*Math.PI*5*p))*4;
        e.dog.style.transform = 'translate(' + x + 'px,' + y + 'px) scaleX(1)';
      },
      reset:function(e){ e.dog.style.transform = 'translate(-235px,0px) scaleX(1)'; },
      finish:function(e, svg, later, done){
        this.reset(e); svg.classList.remove('is-recover');
        tween(1300, function(t){
          var k = 1 - Math.pow(1 - t, 2);
          var x = -235 + 115*k, y = -Math.abs(Math.sin(Math.PI*4*t))*8*(1 - t);
          e.dog.style.transform = 'translate(' + x + 'px,' + y + 'px) scaleX(1)';
        }, function(){ e.dog.style.transform = 'translate(-120px,0px) scaleX(1)'; done(); });
      }
    }
  ];

  cards.forEach(function(card, idx){
    var cfg = CFG[idx]; if(!cfg) return;
    var svg = card.querySelector('svg.scene');
    var drag = svg.querySelector('.drag');
    var toast = card.querySelector('.lead-toast');
    var T = { title:toast.querySelector('.lt-title'), sub:toast.querySelector('.lt-sub'), chip:toast.querySelector('.lt-chip'), txt:toast.querySelector('.lt-txt'), bar:toast.querySelector('.lt-bar') };
    var els = cfg.els(svg);
    var st = { p:0, state:'idle', dragging:false, touching:false, start:null, p0:0, tweening:false, cd:null };

    function later(ms, fn){ return setTimeout(fn, ms); }
    function setP(p){ st.p = p; cfg.apply(els, p, svg); }
    function setToast(state, title, sub, chip, pct){
      toast.setAttribute('data-state', state);
      T.title.textContent = title; T.sub.textContent = sub; T.chip.textContent = chip;
      [T.txt, T.chip].forEach(function(el){ el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); });
      T.bar.style.width = pct + '%';
    }
    function startCountdown(){
      var t0 = Date.now(); clearInterval(st.cd);
      st.cd = setInterval(function(){
        var k = Math.min((Date.now() - t0)/1900, 1), s = Math.round(15 - 9*k);
        T.chip.textContent = '0:' + (s < 10 ? '0' + s : s);
        if(k >= 1) clearInterval(st.cd);
      }, 100);
    }
    function runLead(){
      later(cfg.toastAt, function(){ setToast('new', 'New lead', cfg.lead, 'Just now', 14); toast.classList.add('show'); });
      later(cfg.toastAt + 1500, function(){ setToast('call', 'Our team is calling\u2026', 'Calling within 15 seconds', '0:15', 46); startCountdown(); });
      later(cfg.toastAt + 3500, function(){ clearInterval(st.cd); setToast('qual', 'Qualified', 'Details verified on the call', '\u2713 Verified', 78); });
      later(cfg.toastAt + 5000, function(){ setToast('done', 'Delivered to your inbox', 'Ready for your intake team', 'Delivered', 100); markDelivered(cfg.key, idx); });
      later(cfg.toastAt + 7000, function(){ toast.classList.remove('show'); later(450, function(){ T.bar.style.width = '0'; toast.setAttribute('data-state', ''); }); recover(); });
    }
    function recover(){
      st.state = 'recover';
      svg.classList.remove('is-play'); svg.classList.add('is-recover');
      later(cfg.recoverMs, function(){
        function done(){ svg.classList.remove('is-recover', 'busy', 'touched'); st.p = 0; st.state = 'idle'; drag.removeAttribute('aria-disabled'); }
        if(cfg.finish){ cfg.finish(els, svg, later, done); }
        else { cfg.reset(els, svg); done(); }
      });
    }
    function trigger(){
      if(st.state !== 'idle') return;
      st.state = 'play'; st.dragging = false; st.tweening = false;
      drag.classList.remove('dragging'); drag.setAttribute('aria-disabled', 'true');
      setP(1);
      svg.classList.add('busy', 'touched', 'is-play');
      runLead();
    }
    function playTo(){
      if(st.tweening || st.state !== 'idle') return;
      st.tweening = true; var from = st.p;
      tween((1 - from)*1400 + 250, function(t){ setP(from + (1 - from)*easeIO(t)); }, function(){ st.tweening = false; trigger(); });
    }

    drag.addEventListener('pointerdown', function(ev){
      if(st.state !== 'idle' || st.tweening || (ev.button && ev.button !== 0)) return;
      ev.preventDefault();
      try{ drag.setPointerCapture(ev.pointerId); }catch(_){}
      st.dragging = true; st.touching = true; st.start = svgPt(svg, ev); st.p0 = st.p;
      drag.classList.add('dragging'); svg.classList.add('touched');
    });
    drag.addEventListener('pointermove', function(ev){
      if(!st.dragging) return;
      var pt = svgPt(svg, ev);
      var d = cfg.axis === 'x' ? pt.x - st.start.x : -(pt.y - st.start.y);
      setP(clamp(st.p0 + d/cfg.range, 0, 1));
      if(st.p >= 1) trigger();
    });
    function endDrag(){
      st.touching = false;
      if(!st.dragging) return;
      st.dragging = false; drag.classList.remove('dragging');
      if(st.state === 'idle' && cfg.release) cfg.release(els, st, setP);
    }
    drag.addEventListener('pointerup', endDrag);
    drag.addEventListener('pointercancel', endDrag);
    drag.addEventListener('lostpointercapture', endDrag);
    drag.addEventListener('touchmove', function(ev){ if((st.dragging || st.touching) && ev.cancelable) ev.preventDefault(); }, {passive:false});
    drag.addEventListener('keydown', function(ev){
      if(st.state !== 'idle' || st.tweening) return;
      var k = ev.key;
      if(k === 'Enter' || k === ' '){ ev.preventDefault(); svg.classList.add('touched'); playTo(); }
      else if(k === 'ArrowRight' || k === 'ArrowUp'){ ev.preventDefault(); svg.classList.add('touched'); setP(clamp(st.p + .2, 0, 1)); if(st.p >= 1) trigger(); }
      else if(k === 'ArrowLeft' || k === 'ArrowDown'){ ev.preventDefault(); setP(clamp(st.p - .2, 0, 1)); }
    });
    card._sim = { setP:setP, trigger:trigger, state:function(){ return st.state; } };
  });
})();

/* legal documents: open/close from footer links, deep links (#privacy etc.) */
(function(){
  var panels = document.querySelectorAll('.lg-panel');
  var navLinks = document.querySelectorAll('.lg-links a[data-legal]');
  if(!panels.length) return;
  function setUrl(hash){ try{ history.replaceState(null, '', hash || (location.pathname + location.search)); }catch(e){} }
  function openPanel(id, scroll){
    var found = false;
    panels.forEach(function(p){ var on = p.id === id; if(on){ found = true; p.hidden = false; } else { p.hidden = true; } });
    navLinks.forEach(function(a){ a.setAttribute('aria-expanded', a.getAttribute('data-legal') === id ? 'true' : 'false'); });
    if(found && scroll){ setTimeout(function(){ document.getElementById(id).scrollIntoView({behavior:'smooth', block:'start'}); }, 40); }
    return found;
  }
  function closeAll(){
    panels.forEach(function(p){ p.hidden = true; });
    navLinks.forEach(function(a){ a.setAttribute('aria-expanded', 'false'); });
  }
  document.querySelectorAll('a[data-legal]').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var id = a.getAttribute('data-legal');
      var panel = document.getElementById(id);
      var isOpen = panel && !panel.hidden && a.closest('.lg-links');
      if(isOpen){ closeAll(); setUrl(''); }
      else { openPanel(id, true); setUrl('#' + id); }
    });
  });
  navLinks.forEach(function(a){ a.addEventListener('keydown', function(e){ if(e.key === ' '){ e.preventDefault(); a.click(); } }); });
  document.querySelectorAll('.lg-close').forEach(function(b){
    b.addEventListener('click', function(){
      closeAll(); setUrl('');
      var nav = document.querySelector('.lg-links');
      if(nav) nav.scrollIntoView({behavior:'smooth', block:'center'});
    });
  });
  function fromHash(){
    var id = (location.hash || '').slice(1);
    var el = id ? document.getElementById(id) : null;
    if(el && el.classList.contains('lg-panel')) openPanel(id, true);
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
