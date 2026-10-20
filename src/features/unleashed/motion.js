import { step } from './physics';
/** Mount one animation island; dispose every listener/frame when React unmounts it. */
export function mountUnleashed(root) {
  const events = new AbortController();
  const frames = new Set();
  const timers = new Set();
  const observers = [];
  let disposed = false;
  const on = (target, type, handler, options = {}) => target.addEventListener(type, handler, { ...options, signal: events.signal });
  const frame = callback => { const id = requestAnimationFrame(time => { frames.delete(id); if (!disposed) callback(time); }); frames.add(id); return id; };
  const cancelFrame = id => { cancelAnimationFrame(id); frames.delete(id); };
  const later = (callback, delay) => { const id = setTimeout(() => { timers.delete(id); if (!disposed) callback(); }, delay); timers.add(id); return id; };
  const cancelLater = id => { clearTimeout(id); timers.delete(id); };
  const $ = (selector, scope = root) => scope.querySelector(selector);
  const $$ = (selector, scope = root) => [...scope.querySelectorAll(selector)];

  const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
  const ease = t => { t = clamp(t); return t * t * (3 - 2 * t); };
  const motionMedia = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const compact = matchMedia('(max-width: 760px)');
  let preference;
  try { preference = localStorage.getItem('petclub-motion'); } catch {}
  let motion = preference === 'on' || (preference !== 'off' && !motionMedia.matches);
  let framePending = false;
  let heroVisible = true;
  let playVisible = false;
  let stickyStory = false;
  const hero = $('.hero');
  const film = $('.hero-film');
  const filmStart = $('.film-start');
  const manifesto = $('.manifesto');
  const storySticky = $('.manifesto-sticky');
  const memories = $$('.memory');
  let filmAttempt = 0;

  async function updateFilm(force = false) {
    const attempt = ++filmAttempt;
    if (disposed) return;
    if (!motion || !heroVisible || document.hidden || root.classList.contains('dialog-open')) {
      film.pause();
      film.classList.remove('is-playing');
      filmStart.hidden = true;
      return;
    }
    if (navigator.connection?.saveData && !force) { filmStart.hidden = false; return; }
    if (!film.getAttribute('src')) film.src = compact.matches ? '/unleashed/hero-loop-mobile.mp4' : film.dataset.src;
    try {
      await film.play();
      if (disposed || attempt !== filmAttempt) return;
      if (!motion || !heroVisible || document.hidden || root.classList.contains('dialog-open')) { film.pause(); return; }
      film.classList.add('is-playing');
      filmStart.hidden = true;
    } catch {
      if (attempt === filmAttempt) { filmStart.hidden = false; film.classList.remove('is-playing'); }
    }
  }
  on(filmStart, 'click', () => updateFilm(true));
  on(film, 'error', () => { filmStart.hidden = true; film.classList.remove('is-playing'); });

  function renderScroll() {
    framePending = false;
    root.style.setProperty('--page-progress', clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)));
    if (!motion) return;
    const heroBounds = hero.getBoundingClientRect();
    hero.style.setProperty('--hero-progress', clamp(-heroBounds.top / heroBounds.height));
    if (stickyStory) {
      const rect = manifesto.getBoundingClientRect();
      const progress = clamp(-rect.top / Math.max(1, manifesto.offsetHeight - storySticky.offsetHeight));
      const spread = ease(progress / .8);
      const width = manifesto.clientWidth;
      const height = storySticky.offsetHeight;
      const small = compact.matches;
      const positions = small ? [
        [-.34 - .20 * spread, -.01 - .02 * spread, -6 - 7 * spread],
        [-.18 + .01 * spread, .015 + .015 * spread, 1 + 3 * spread],
        [-.04 + .22 * spread, -.01 - .01 * spread, 5 + 8 * spread]
      ] : [
        [-.30 - .17 * spread, -.16 - .02 * spread, -13 + 5 * spread],
        [-.06 + .34 * spread, -.13 - .10 * spread, 12 - 4 * spread],
        [-.15 + .01 * spread, .02 + .29 * spread, -7 + 13 * spread]
      ];
      memories.forEach((card, index) => {
        const [x, y, rotate] = positions[index];
        card.style.setProperty('--mx', `${(x * width).toFixed(1)}px`);
        card.style.setProperty('--my', `${(y * height).toFixed(1)}px`);
        card.style.setProperty('--mr', `${rotate.toFixed(2)}deg`);
        card.style.setProperty('--ms', (1 - spread * .07).toFixed(3));
      });
      manifesto.style.setProperty('--story-progress', progress);
    }
    const belong = $('.belong').getBoundingClientRect();
    const travel = clamp((innerHeight - belong.top) / (innerHeight + belong.height));
    $('.belong-photo').style.setProperty('--belong-y', `${(travel * 30 - 15).toFixed(1)}px`);
  }
  function scheduleScroll() {
    if (!framePending) { framePending = true; frame(renderScroll); }
  }

  // One small simulation, suspended when paused, off screen, or at rest.
  const arena = $('.playground');
  const ball = $('.tennis-ball');
  const shadow = $('.ball-shadow');
  let bounds = { x: 300, y: 350 };
  let diameter = 155;
  let state = { x: 140, y: 100, vx: 0, vy: 0, angle: -17, sleeping: true };
  let ballFrame = 0;
  let lastTime = 0;
  let drag = null;
  let playedOnce = false;
  let suppressBallClick = false;
  let lastImpact = 0;
  function renderBall() {
    ball.style.setProperty('--ball-x', `${state.x.toFixed(2)}px`);
    ball.style.setProperty('--ball-y', `${state.y.toFixed(2)}px`);
    ball.style.setProperty('--ball-r', `${state.angle.toFixed(2)}deg`);
    shadow.style.setProperty('--shadow-x', `${(state.x + diameter / 2 - 60).toFixed(1)}px`);
    const proximity = clamp(state.y / Math.max(1, bounds.y));
    shadow.style.setProperty('--shadow-scale', (.45 + proximity * .55).toFixed(2));
    shadow.style.setProperty('--shadow-opacity', (.15 + proximity * .55).toFixed(2));
  }
  function measureBall() {
    const rect = arena.getBoundingClientRect();
    diameter = ball.offsetWidth || (compact.matches ? 130 : 155);
    bounds = { x: Math.max(0, rect.width - diameter), y: Math.max(0, rect.height * .88 - diameter) };
    state.x = playedOnce ? clamp(state.x, 0, bounds.x) : bounds.x * .53;
    state.y = playedOnce ? clamp(state.y, 0, bounds.y) : bounds.y * .25;
    renderBall();
  }
  function stopBall() {
    if (ballFrame) cancelFrame(ballFrame);
    ballFrame = 0; lastTime = 0;
  }
  function impactRing(time) {
    if (time - lastImpact < 170) return;
    lastImpact = time;
    const ring = document.createElement('span');
    ring.className = 'bounce-ring';
    ring.style.setProperty('--ring-x', `${state.x + diameter / 2 - 25}px`);
    ring.style.setProperty('--ring-y', `${bounds.y + diameter - 8}px`);
    arena.append(ring);
    later(() => ring.remove(), 650);
  }
  function animateBall(time) {
    ballFrame = 0;
    if (!motion || !playVisible || document.hidden || root.classList.contains('dialog-open') || drag) { lastTime = 0; return; }
    const elapsed = lastTime ? (time - lastTime) / 1000 : 1 / 60;
    lastTime = time;
    state = step(state, bounds, elapsed);
    renderBall();
    if (state.impact) impactRing(time);
    if (!state.sleeping) ballFrame = frame(animateBall);
    else lastTime = 0;
  }
  function wakeBall() {
    if (!ballFrame && motion && playVisible && !drag && !document.hidden && !root.classList.contains('dialog-open')) ballFrame = frame(animateBall);
  }
  function throwBall() {
    $('.play-status').textContent = motion ? 'Good energy, delivered. The ball is bouncing.' : 'A little happy, delivered. Enable motion to watch the ball bounce.';
    playedOnce = true;
    if (!motion) return;
    state.vx = (Math.random() > .5 ? 1 : -1) * (240 + Math.random() * 190);
    state.vy = -610;
    state.sleeping = false;
    wakeBall();
  }
  on($('.throw-button'), 'click', throwBall);
  on(ball, 'click', event => {
    if (suppressBallClick) { event.preventDefault(); return; }
    throwBall();
  });
  on(ball, 'pointerdown', event => {
    if (event.button !== 0 || !motion) return;
    const rect = arena.getBoundingClientRect();
    drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, time: performance.now(), left: rect.left, top: rect.top, moved: false, vx: 0, vy: 0 };
    stopBall();
    ball.setPointerCapture(event.pointerId);
  });
  on(ball, 'pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const now = performance.now();
    const seconds = Math.max(.008, (now - drag.time) / 1000);
    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 5) drag.moved = true;
    if (drag.moved) {
      event.preventDefault();
      drag.vx = clamp((event.clientX - drag.x) / seconds, -1400, 1400);
      drag.vy = clamp((event.clientY - drag.y) / seconds, -1400, 1400);
      state.x = clamp(event.clientX - drag.left - diameter / 2, 0, bounds.x);
      state.y = clamp(event.clientY - drag.top - diameter / 2, 0, bounds.y);
      state.angle += drag.vx * .002;
      renderBall();
    }
    drag.x = event.clientX; drag.y = event.clientY; drag.time = now;
  });
  function releaseBall(event) {
    if (!drag || drag.id !== event.pointerId) return;
    suppressBallClick = drag.moved;
    if (drag.moved) {
      state.vx = drag.vx;
      state.vy = drag.vy;
      state.sleeping = false;
      playedOnce = true;
      $('.play-status').textContent = 'Nice throw.';
    }
    drag = null;
    if (ball.hasPointerCapture(event.pointerId)) ball.releasePointerCapture(event.pointerId);
    wakeBall();
    later(() => { suppressBallClick = false; }, 0);
  }
  on(ball, 'pointerup', releaseBall);
  on(ball, 'pointercancel', releaseBall);
  on(ball, 'lostpointercapture', releaseBall);

  function setMotion(enabled) {
    motion = enabled;
    root.dataset.motion = enabled ? 'on' : 'off';
    $$('.motion-toggle').forEach(button => {
      button.setAttribute('aria-pressed', String(!enabled));
      button.setAttribute('aria-label', enabled ? 'Pause motion' : 'Enable motion');
      const label = $('.motion-label', button);
      if (label) label.textContent = enabled ? 'Motion on' : 'Motion off';
      else button.textContent = enabled ? 'Pause motion Ⅱ' : 'Enable motion ▶';
    });
    stickyStory = getComputedStyle(storySticky).position === 'sticky';
    if (!enabled) { stopBall(); $$('.boop-particle,.bounce-ring').forEach(el => el.remove()); }
    else if (!state.sleeping) wakeBall();
    updateFilm();
    scheduleScroll();
  }
  $$('.motion-toggle').forEach(button => on(button, 'click', () => {
    preference = motion ? 'off' : 'on';
    try { localStorage.setItem('petclub-motion', preference); } catch {}
    setMotion(preference === 'on');
  }));
  on(motionMedia, 'change', () => {
    if (preference !== 'on' && preference !== 'off') setMotion(!motionMedia.matches);
  });

  const moods = {
    dog: {
      kicker: 'FOR THE WALK-TAKERS & TAIL-WAGGERS', title: ['More walks.', 'More wonder.'],
      description: 'First days, muddy paws and one more lap around the block. A little guidance for the life you’re figuring out together.',
      image: '/unleashed/golden.webp', alt: 'A golden retriever, ready for their next adventure',
      all: ['Explore the dog world', '/dogs'], labels: ['New beginnings', 'Everyday life', 'Out together'],
      reads: {
        new: ['Your first thirty days together', '/guides/bringing-home-a-puppy-first-30-days'],
        everyday: ['The puppy journey, one step at a time', '/puppy'],
        outside: ['Boots for your next Canadian adventure', '/guides/choosing-dog-boots-in-canada']
      }
    },
    cat: {
      kicker: 'FOR THE SUN-SEEKERS & SOFA-SHARERS', title: ['A curious mind.', 'A world of their own.'],
      description: 'Sunny spots, secret hiding places and the occasional 3 a.m. sprint. Make room for a life with a little more curiosity.',
      image: '/unleashed/ginger.webp', alt: 'A ginger cat looking curiously at the camera',
      all: ['Explore the cat world', '/cats'], labels: ['Make a home', 'More play', 'Out together'],
      reads: {
        new: ['A scratching post that fits their world', '/guides/choosing-a-cat-scratching-post-in-canada'],
        everyday: ['Catit Digger or Wave Circuit?', '/compare/catit-digger-vs-wave-circuit'],
        outside: ['A little home for the journey', '/guides/choosing-a-cat-carrier-in-canada']
      }
    }
  };
  let kind = 'dog';
  let mood = 'new';
  let clubTimer;
  const club = $('.clubhouse');
  function updateRecommendation() {
    const [label, path] = moods[kind].reads[mood];
    $('.recommendation strong').textContent = label;
    $('.recommendation').href = path;
    $$('[data-mood]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mood === mood)));
  }
  $$('.world-switch [data-kind]').forEach(button => on(button, 'click', () => {
    if (button.dataset.kind === kind) return;
    kind = button.dataset.kind;
    const data = moods[kind];
    club.dataset.kind = kind;
    $$('.world-switch [data-kind]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    $('.club-kicker').textContent = data.kicker;
    const em = document.createElement('em'); em.textContent = data.title[1];
    $('.club-title').replaceChildren(data.title[0], document.createElement('br'), em);
    $('.club-description').textContent = data.description;
    const photo = $('.club-photo'); photo.src = data.image; photo.alt = data.alt;
    const all = $('.club-all'); all.href = data.all[1]; all.firstChild.textContent = `${data.all[0]} `;
    $$('[data-mood]').forEach((item, index) => { item.textContent = data.labels[index]; });
    updateRecommendation();
    $$('.club-content,.club-photo').forEach(el => el.classList.remove('is-changing'));
    frame(() => $$('.club-content,.club-photo').forEach(el => el.classList.add('is-changing')));
    cancelLater(clubTimer);
    clubTimer = later(() => $$('.club-content,.club-photo').forEach(el => el.classList.remove('is-changing')), 800);
  }));
  $$('[data-mood]').forEach(button => on(button, 'click', () => { mood = button.dataset.mood; updateRecommendation(); }));
  const photoWrap = $('.club-photo-wrap');
  on(photoWrap, 'pointermove', event => {
    if (!motion || !finePointer.matches || event.pointerType === 'touch') return;
    const rect = photoWrap.getBoundingClientRect();
    photoWrap.style.setProperty('--tilt-x', `${((event.clientX - rect.left) / rect.width - .5) * 9}deg`);
    photoWrap.style.setProperty('--tilt-y', `${((event.clientY - rect.top) / rect.height - .5) * -6}deg`);
  });
  on(photoWrap, 'pointerleave', () => { photoWrap.style.setProperty('--tilt-x', '0deg'); photoWrap.style.setProperty('--tilt-y', '0deg'); });

  let boopTimer;
  on($('.boop-button'), 'click', () => {
    $('.boop-status').textContent = 'Boop! A little love, right back at you.';
    $('.boop-button em').textContent = 'Booped!';
    cancelLater(boopTimer);
    if (motion) {
      hero.classList.remove('is-booped');
      frame(() => hero.classList.add('is-booped'));
      $$('.boop-particle').forEach(el => el.remove());
      const origin = $('.boop-button').getBoundingClientRect();
      const rect = hero.getBoundingClientRect();
      const messages = ['♡', '✳', 'GOOD DOG!', '♡', '✳', 'LOVE YOU TOO.', '♡', '✳'];
      messages.forEach((message, index) => {
        const el = document.createElement('span'); el.className = 'boop-particle'; el.setAttribute('aria-hidden', 'true'); el.textContent = message;
        const angle = (index / messages.length) * Math.PI * 2;
        const distance = compact.matches ? 90 : 145;
        Object.entries({ '--x': `${origin.left - rect.left + origin.width / 2}px`, '--y': `${origin.top - rect.top + origin.height / 2}px`, '--dx': `${Math.cos(angle) * distance}px`, '--dy': `${Math.sin(angle) * distance}px`, '--r': `${index * 8 - 25}deg` }).forEach(([key, value]) => el.style.setProperty(key, value));
        hero.append(el); later(() => el.remove(), 1300);
      });
    }
    boopTimer = later(() => { hero.classList.remove('is-booped'); $('.boop-button em').textContent = 'Boop.'; $('.boop-status').textContent = ''; }, 1700);
  });

  const guides = $$('.story');
  $$('[data-filter]').forEach(button => on(button, 'click', () => {
    const filter = button.dataset.filter;
    $$('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    guides.forEach(guide => { guide.hidden = filter !== 'all' && guide.dataset.category !== filter; });
    $('.guide-status').textContent = `Showing ${guides.filter(guide => !guide.hidden).length} ${filter === 'all' ? '' : `${filter} `}guides.`;
    scheduleScroll();
  }));
  const searchData = guides.map(guide => ({
    title: $('h3', guide).textContent, description: $('p', guide).textContent,
    meta: $('small', guide).textContent, keywords: guide.dataset.keywords,
    url: guide.href, image: $('img', guide).src
  }));
  const search = $('.search-dialog');
  const menu = $('.menu-dialog');
  const input = $('#guide-search');
  function renderSearch() {
    $('.full-search').href = '/search?q=' + encodeURIComponent(input.value.trim());
    const tokens = input.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const results = searchData.filter(guide => tokens.every(token => `${guide.title} ${guide.description} ${guide.meta} ${guide.keywords}`.toLocaleLowerCase().includes(token)));
    $('.search-status').textContent = tokens.length ? `${results.length} featured ${results.length === 1 ? 'guide' : 'guides'} found.` : 'Five good places to start. What are you curious about?';
    const elements = results.map(guide => {
      const link = document.createElement('a'); link.className = 'search-result'; link.href = guide.url;
      const image = document.createElement('img'); image.src = guide.image; image.alt = ''; image.width = 62; image.height = 65;
      const text = document.createElement('div');
      const meta = document.createElement('small'); meta.textContent = guide.meta;
      const title = document.createElement('strong'); title.textContent = guide.description;
      const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
      text.append(meta, title); link.append(image, text, arrow); return link;
    });
    if (!elements.length) {
      const empty = document.createElement('div'); empty.className = 'search-empty';
      const p = document.createElement('p'); p.textContent = 'No featured story matches yet. Try “puppy”, “cat” or “boots”.';
      const reset = document.createElement('button'); reset.type = 'button'; reset.textContent = 'Show all featured guides ↗';
      on(reset, 'click', () => { input.value = ''; renderSearch(); input.focus(); });
      empty.append(p, reset); elements.push(empty);
    }
    $('.search-results').replaceChildren(...elements);
  }
  function openDialog(dialog) {
    if (dialog.open) return;
    root.classList.add('dialog-open');
    dialog.showModal();
    if (dialog === menu) $('.menu-open').setAttribute('aria-expanded', 'true');
    film.pause(); stopBall();
  }
  on($('.menu-open'), 'click', () => openDialog(menu));
  $$('.search-open').forEach(button => on(button, 'click', () => { renderSearch(); openDialog(search); input.focus(); }));
  $$('dialog').forEach(dialog => {
    on($('[data-close]', dialog), 'click', () => dialog.close());
    on(dialog, 'close', () => { root.classList.remove('dialog-open'); $('.menu-open').setAttribute('aria-expanded', 'false'); updateFilm(); if (!state.sleeping) wakeBall(); });
    on(dialog, 'click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  $$('a[href^="#"]', menu).forEach(link => on(link, 'click', event => {
    const target = $(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault(); menu.close();
    target.scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'start' });
    target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true });
    history.replaceState(null, '', link.getAttribute('href'));
  }));
  on(input, 'input', renderSearch);
  on($('.search-form'), 'submit', event => { event.preventDefault(); renderSearch(); });
  on(document, 'visibilitychange', () => {
    updateFilm();
    if (document.hidden) stopBall(); else if (!state.sleeping) wakeBall();
  });
  on(window, 'scroll', scheduleScroll, { passive: true });
  on(window, 'resize', () => { stickyStory = getComputedStyle(storySticky).position === 'sticky'; measureBall(); scheduleScroll(); }, { passive: true });
  on(window, 'pageshow', () => { measureBall(); scheduleScroll(); updateFilm(); });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.target === hero) { heroVisible = entry.isIntersecting; updateFilm(); }
      if (entry.target === arena) {
        playVisible = entry.isIntersecting;
        if (playVisible) {
          if (!playedOnce) { state.sleeping = false; playedOnce = true; }
          if (!state.sleeping) wakeBall();
        } else stopBall();
      }
    }), { threshold: .08 });
    observers.push(observer); observer.observe(hero); observer.observe(arena);
  } else playVisible = true;
  root.dataset.enhanced = 'true';
  measureBall();
  setMotion(motion);
  renderScroll();

  return () => {
    disposed = true; filmAttempt++;
    events.abort();
    frames.forEach(cancelAnimationFrame); timers.forEach(clearTimeout);
    observers.forEach(observer => observer.disconnect());
    film.pause(); film.removeAttribute('src'); film.load();
    root.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
    root.classList.remove('dialog-open');
    root.querySelectorAll('.boop-particle,.impact-ring').forEach(node => node.remove());
  };
}
