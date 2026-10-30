(() => {
  // fade sections in as they scroll into view
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // highlight the nav pill for the section on screen
  const links = [...document.querySelectorAll('.pill-nav a')];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('section[id]').forEach((s) => spy.observe(s));

  // gentle parallax on the floating glass
  const stage = document.querySelector('.stage');
  if (stage && matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const layers = [...stage.querySelectorAll('.orbit, .float-card')];
    stage.parentElement.addEventListener('pointermove', (e) => {
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      layers.forEach((l, i) => {
        const d = l.classList.contains('front') ? 14 : l.classList.contains('back') ? 6 : 10;
        l.style.translate = `${x * d}px ${y * d}px`;
      });
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
