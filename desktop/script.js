(() => {
  const windows = [...document.querySelectorAll('.window')];
  const icons = [...document.querySelectorAll('.icon')];
  let z = 100;

  const win = (name) => document.getElementById(`win-${name}`);
  const isMobile = () => matchMedia('(max-width: 760px)').matches;

  function focus(w) {
    windows.forEach((o) => o.classList.remove('focused'));
    w.classList.add('focused');
    w.style.zIndex = ++z;
  }

  function syncDock() {
    document.querySelectorAll('.dock-item[data-open]').forEach((d) => {
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
      if (top) focus(top);
      syncDock();
    }, { once: true });
  }

  // generic drag helper: moves `el` when `handle` is dragged, calls onClick if it never moved
  function draggable(el, handle, { onClick, skip } = {}) {
    handle.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || (skip && skip(e))) return;
      const desk = el.parentElement.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - rect.left;
      const dy = e.clientY - rect.top;
      const sx = e.clientX;
      const sy = e.clientY;
      let moved = false;
      handle.setPointerCapture(e.pointerId);
      const move = (ev) => {
        if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
        moved = true;
        const x = Math.min(Math.max(ev.clientX - dx - desk.left, -rect.width + 80), desk.width - 80);
        const y = Math.min(Math.max(ev.clientY - dy - desk.top, 0), desk.height - 60);
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.transform = 'none';
      };
      const up = () => {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
        if (!moved && onClick) onClick();
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
    });
  }

  // desktop icons: drag around, click to open
  icons.forEach((icon) => {
    const select = () => {
      icons.forEach((i) => i.classList.remove('selected'));
      icon.classList.add('selected');
      open(icon.dataset.open);
    };
    if (isMobile()) {
      icon.addEventListener('click', select);
    } else {
      draggable(icon, icon, { onClick: select });
      icon.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } });
    }
  });

  document.querySelectorAll('.dock-item[data-open]').forEach((el) => {
    el.addEventListener('click', () => open(el.dataset.open));
  });

  document.getElementById('desktop').addEventListener('pointerdown', (e) => {
    if (e.target.id === 'desktop') icons.forEach((i) => i.classList.remove('selected'));
  });

  windows.forEach((w) => {
    w.addEventListener('pointerdown', () => focus(w));
    w.querySelector('.close').addEventListener('click', (e) => { e.stopPropagation(); close(w); });
    w.querySelector('.min').addEventListener('click', (e) => { e.stopPropagation(); close(w); });
    w.querySelector('.max').addEventListener('click', (e) => { e.stopPropagation(); w.classList.toggle('maxed'); });
    const bar = w.querySelector('.titlebar');
    bar.addEventListener('dblclick', () => w.classList.toggle('maxed'));
    draggable(w, bar, { skip: (e) => e.target.closest('.lights') || isMobile() || w.classList.contains('maxed') });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const f = document.querySelector('.window.focused.open');
    if (f) close(f);
  });

  // live calendar icon in the dock
  const now = new Date();
  document.getElementById('cal-mon').textContent = now.toLocaleString('en', { month: 'short' }).toUpperCase();
  document.getElementById('cal-day').textContent = now.getDate();
  document.getElementById('cal-year').textContent = now.getFullYear();
})();
