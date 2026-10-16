(() => {
  const windows = [...document.querySelectorAll('.window')];
  const activeApp = document.getElementById('active-app');
  let z = 100;

  const win = (name) => document.getElementById(`win-${name}`);
  const isMobile = () => matchMedia('(max-width: 760px)').matches;

  function focus(w) {
    windows.forEach((o) => o.classList.remove('focused'));
    w.classList.add('focused');
    w.style.zIndex = ++z;
    activeApp.textContent = w.dataset.title;
  }

  function syncDock() {
    document.querySelectorAll('.dock-item').forEach((d) => {
      d.classList.toggle('running', win(d.dataset.open).classList.contains('open'));
    });
  }

  function open(name) {
    const w = win(name);
    if (!w) return;
    w.classList.remove('closing');
    w.classList.add('open');
    focus(w);
    syncDock();
  }

  function close(w) {
    w.classList.add('closing');
    w.addEventListener('animationend', () => {
      w.classList.remove('open', 'closing', 'maxed', 'focused');
      const top = windows.filter((o) => o.classList.contains('open'))
        .sort((a, b) => b.style.zIndex - a.style.zIndex)[0];
      if (top) focus(top); else activeApp.textContent = 'Finder';
      syncDock();
    }, { once: true });
  }

  document.querySelectorAll('[data-open]').forEach((el) => {
    el.addEventListener('click', () => open(el.dataset.open));
  });

  windows.forEach((w) => {
    w.addEventListener('pointerdown', () => focus(w));
    w.querySelector('.close').addEventListener('click', (e) => { e.stopPropagation(); close(w); });
    w.querySelector('.min').addEventListener('click', (e) => { e.stopPropagation(); close(w); });
    w.querySelector('.max').addEventListener('click', (e) => { e.stopPropagation(); w.classList.toggle('maxed'); });

    // drag by title bar
    const bar = w.querySelector('.titlebar');
    bar.addEventListener('dblclick', () => w.classList.toggle('maxed'));
    bar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.lights') || isMobile() || w.classList.contains('maxed')) return;
      const rect = w.getBoundingClientRect();
      const desk = w.parentElement.getBoundingClientRect();
      const dx = e.clientX - rect.left;
      const dy = e.clientY - rect.top;
      bar.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const x = Math.min(Math.max(ev.clientX - dx - desk.left, -rect.width + 80), desk.width - 80);
        const y = Math.min(Math.max(ev.clientY - dy - desk.top, 0), desk.height - 60);
        w.style.left = `${x}px`;
        w.style.top = `${y}px`;
      };
      const up = () => {
        bar.removeEventListener('pointermove', move);
        bar.removeEventListener('pointerup', up);
      };
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const f = document.querySelector('.window.focused.open');
    if (f) close(f);
  });

  // menu bar clock
  const clock = document.getElementById('clock');
  const tick = () => {
    clock.textContent = new Date().toLocaleString([], {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  };
  tick();
  setInterval(tick, 30_000);

})();
