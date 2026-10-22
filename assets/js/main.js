/* PELS — site interactions */
document.documentElement.classList.add('js');

(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const WHATSAPP = '2348065127335';

  // Preloader
  window.addEventListener('load', () => { const p = $('.preloader'); if (p) p.classList.add('done'); });
  setTimeout(() => { const p = $('.preloader'); if (p) p.classList.add('done'); }, 3500);

  // Image fallback: if a stock photo fails to load, swap in a PELS photo
  $$('img[data-fallback]').forEach(img => {
    const swap = () => { if (img.dataset.swapped) return; img.dataset.swapped = 1; img.src = img.dataset.fallback; };
    img.addEventListener('error', swap);
    if (img.complete && img.naturalWidth === 0 && img.src) swap();
  });

  // Header state, back-to-top
  const header = $('.site-header'), toTop = $('.to-top');
  const onScroll = () => {
    const y = window.scrollY;
    header && header.classList.toggle('scrolled', y > 20);
    toTop && toTop.classList.toggle('show', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop && toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Mobile menu
  const burger = $('.burger');
  burger && burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('.nav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));

  // Reveal on scroll
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;
  $$('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  // Counters
  const counters = $$('[data-count]');
  const runCount = el => {
    const end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length;
    const t0 = performance.now(), dur = 1800;
    const tick = t => {
      const p = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toLocaleString('en-NG', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (io) {
    const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } }), { threshold: .5 });
    counters.forEach(c => cio.observe(c));
  }

  // Hero slideshow
  const slides = $$('.hero-slides img'), dots = $$('.hero-dots button');
  if (slides.length) {
    let i = 0, timer;
    const show = n => {
      slides[i].classList.remove('on'); dots[i] && dots[i].classList.remove('on');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('on'); dots[i] && dots[i].classList.add('on');
    };
    const start = () => { clearInterval(timer); timer = setInterval(() => show(i + 1), 6000); };
    dots.forEach((d, n) => d.addEventListener('click', () => { show(n); start(); }));
    start();
  }

  // Tabs (industries)
  $$('[data-tabs]').forEach(group => {
    const tabs = $$('.tab', group), panels = $$('.panel', group);
    tabs.forEach((t, n) => t.addEventListener('click', () => {
      tabs.forEach(x => { x.classList.remove('on'); x.setAttribute('aria-selected', 'false'); });
      t.classList.add('on'); t.setAttribute('aria-selected', 'true');
      panels.forEach((p, m) => { p.hidden = m !== n; p.classList.toggle('in', m === n); });
    }));
  });

  // Subtle parallax on CTA band images
  const par = $$('[data-parallax]');
  if (par.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      par.forEach(img => {
        const r = img.parentElement.getBoundingClientRect();
        const off = (r.top + r.height / 2 - innerHeight / 2) * -0.08;
        img.style.transform = `translateY(${off}px)`;
      });
    }, { passive: true });
  }

  // Toast
  const toast = msg => {
    let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 3200);
  };

  // Mini tracker on homepage → track page
  $$('form[data-track-redirect]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const v = f.querySelector('input').value.trim();
    location.href = 'track.html' + (v ? '?id=' + encodeURIComponent(v) : '');
  }));

  // Tracking page (demo data until connected to a real system)
  const tForm = $('#trackForm');
  if (tForm) {
    const out = $('#trackResult');
    const demo = {
      'PELS-ASB-24816': { status: 'In transit', cls: 'transit', pct: 65, from: 'Asaba, Delta', to: 'Lagos (Ikeja)', service: 'Nationwide Delivery', eta: 'Tomorrow, before 6pm',
        events: [
          ['Order received at PELS hub', 'GRA Phase 2, Asaba', 'done'],
          ['Parcel picked up & weighed', 'Okpanam Rd, Asaba', 'done'],
          ['Departed Asaba hub', 'Linehaul to Lagos', 'done'],
          ['In transit', 'Benin – Ore expressway', 'now'],
          ['Out for delivery', 'Ikeja, Lagos', ''],
          ['Delivered', '', '']] },
      'PELS-LCL-10392': { status: 'Delivered', cls: '', pct: 100, from: 'Asaba GRA', to: 'Okpanam, Asaba', service: 'Local Delivery', eta: 'Delivered today, 2:14pm',
        events: [
          ['Order received', 'WhatsApp booking', 'done'],
          ['Rider assigned', 'Bike dispatch', 'done'],
          ['Picked up from sender', 'Nnebisi Rd, Asaba', 'done'],
          ['Delivered & signed for', 'Okpanam, Asaba', 'done']] }
    };
    const render = id => {
      const key = id.toUpperCase().replace(/\s+/g, '');
      const d = demo[key];
      if (!d) {
        out.innerHTML = `<div class="t-empty"><h3>We couldn't find “${key.replace(/[<>&"]/g, '')}”</h3><p style="margin-top:.6rem">Check the tracking number on your waybill, or message us on WhatsApp and we'll locate it for you.</p><p style="margin-top:1.2rem"><a class="btn btn-primary" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi PELS, please help me track ' + key)}" target="_blank" rel="noopener">Ask on WhatsApp</a></p></div>`;
        return;
      }
      out.innerHTML = `
        <div class="t-head"><div><small style="color:var(--muted);font-weight:700;letter-spacing:.1em;font-size:.72rem">TRACKING NUMBER</small><br><code>${key}</code></div><span class="pill ${d.cls}">${d.status}</span></div>
        <div class="progress"><i></i></div>
        <div class="t-meta"><div><span>From</span><b>${d.from}</b></div><div><span>To</span><b>${d.to}</b></div><div><span>Service</span><b>${d.service}</b></div></div>
        <p style="margin-bottom:1.4rem"><b>Estimated delivery:</b> ${d.eta}</p>
        <ol class="timeline">${d.events.map((e, n) => `<li class="${e[2]}" style="animation-delay:${n * .12}s"><b>${e[0]}</b><small>${e[1] || 'Pending'}</small></li>`).join('')}</ol>`;
      requestAnimationFrame(() => setTimeout(() => { $('.progress i', out).style.width = d.pct + '%'; }, 60));
    };
    tForm.addEventListener('submit', e => { e.preventDefault(); const v = $('#trackId').value.trim(); if (v) render(v); });
    $$('.hint code').forEach(c => c.addEventListener('click', () => { $('#trackId').value = c.textContent; render(c.textContent); }));
    const q = new URLSearchParams(location.search).get('id');
    if (q) { $('#trackId').value = q; render(q); }
  }

  // Quote wizard
  const wiz = $('#wizard');
  if (wiz) {
    const panes = $$('.w-pane', wiz), marks = $$('.w-steps li');
    let step = 0;
    const svcParam = new URLSearchParams(location.search).get('service');
    if (svcParam) { const r = $(`input[name="service"][value="${svcParam}"]`, wiz); if (r) r.checked = true; }
    const go = n => {
      step = n;
      panes.forEach((p, i) => p.classList.toggle('on', i === n));
      marks.forEach((m, i) => { m.classList.toggle('on', i === n); m.classList.toggle('ok', i < n); });
      $('#prevBtn').style.visibility = n === 0 || n === panes.length - 1 ? 'hidden' : 'visible';
      $('#nextBtn').hidden = n >= panes.length - 2;
      $('#sendBtn').hidden = n !== panes.length - 2;
      $('.w-nav', wiz).hidden = n === panes.length - 1;
      if (n === panes.length - 2) buildSummary();
      const top = wiz.getBoundingClientRect().top + scrollY - 100;
      if (scrollY > top) scrollTo({ top, behavior: 'smooth' });
    };
    const validate = () => {
      const pane = panes[step]; let ok = true;
      $$('[required]', pane).forEach(inp => {
        const f = inp.closest('.field'); const bad = inp.type === 'radio' ? !$(`input[name="${inp.name}"]:checked`, pane) : !inp.value.trim() || (inp.type === 'tel' && inp.value.replace(/\D/g, '').length < 10);
        if (f) f.classList.toggle('bad', bad);
        if (bad) ok = false;
      });
      if (!ok) toast(step === 0 ? 'Choose a service to continue' : 'Please fill in the highlighted fields');
      return ok;
    };
    const val = n => { const el = wiz.elements[n]; if (!el) return ''; if (el.length && el[0] && el[0].type === 'radio') { const c = $(`input[name="${n}"]:checked`, wiz); return c ? c.value : ''; } return (el.value || '').trim(); };
    const labelOf = n => { const c = $(`input[name="${n}"]:checked`, wiz); return c ? $(`label[for="${c.id}"] b`, wiz).textContent : ''; };
    const estimate = () => {
      const base = { local: [2000, 5000], nationwide: [6000, 18000], international: [45000, 160000], moving: [60000, 350000], fulfilment: [25000, 90000], ecommerce: [2500, 9000], bulk: [20000, 120000], errands: [2000, 6000] }[val('service')] || [3000, 10000];
      const mult = { small: 1, medium: 1.6, large: 2.6, xl: 4 }[val('size')] || 1;
      const f = n => '₦' + (Math.round(n / 500) * 500).toLocaleString('en-NG');
      return `${f(base[0] * mult)} – ${f(base[1] * mult)}`;
    };
    const rows = () => [['Service', labelOf('service')], ['Pickup', val('pickup')], ['Drop-off', val('dropoff')], ['Pickup date', val('date') || 'Flexible'], ['Package', labelOf('size')], ['Contents', val('items') || '—'], ['Name', val('name')], ['Phone', val('phone')]];
    const buildSummary = () => {
      $('#summary').innerHTML = rows().map(r => `<div><span>${r[0]}</span><b>${String(r[1]).replace(/[<>&]/g, '')}</b></div>`).join('');
      $('#estimate').textContent = estimate();
    };
    $('#nextBtn').addEventListener('click', () => { if (validate()) go(step + 1); });
    $('#prevBtn').addEventListener('click', () => go(step - 1));
    $('#sendBtn').addEventListener('click', () => {
      const msg = 'Hello PELS, I would like a quote:\n' + rows().map(r => `${r[0]}: ${r[1]}`).join('\n') + `\nEmail: ${val('email') || '—'}\nNotes: ${val('notes') || '—'}\nEstimate shown on site: ${estimate()}`;
      const link = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
      $('#waLink').href = link;
      window.open(link, '_blank', 'noopener');
      go(panes.length - 1);
    });
    $$('input,select,textarea', wiz).forEach(i => i.addEventListener('input', () => { const f = i.closest('.field'); f && f.classList.remove('bad'); }));
    const d = $('#date', wiz); if (d) d.min = new Date().toISOString().split('T')[0];
    go(0);
  }

  // Contact form → WhatsApp / email
  const cForm = $('#contactForm');
  if (cForm) cForm.addEventListener('submit', e => {
    e.preventDefault(); let ok = true;
    $$('[required]', cForm).forEach(i => { const bad = !i.value.trim(); i.closest('.field').classList.toggle('bad', bad); if (bad) ok = false; });
    if (!ok) return toast('Please fill in the highlighted fields');
    const f = n => cForm.elements[n].value.trim();
    const msg = `Hello PELS,\n${f('message')}\n\n— ${f('cname')} (${f('cphone')}${f('cemail') ? ', ' + f('cemail') : ''})\nTopic: ${f('topic')}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    toast('Opening WhatsApp with your message…'); cForm.reset();
  });

  // Open / closed indicator (Mon–Sat 8am–7pm, Lagos time)
  $$('[data-open-now]').forEach(el => {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
    const h = now.getHours() + now.getMinutes() / 60, day = now.getDay();
    const open = day !== 0 && h >= 8 && h < 19;
    el.classList.toggle('closed', !open);
    el.lastChild.textContent = open ? ' Open now · closes 7pm' : ' Closed now · opens 8am';
  });

  // Copy-able footer year
  $$('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
})();
