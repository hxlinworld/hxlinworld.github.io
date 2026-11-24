(() => {
  'use strict';
  const search = document.querySelector('#search');
  const clear = document.querySelector('.clear-search');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const sections = [...document.querySelectorAll('[data-section]')];
  const resultCount = document.querySelector('.result-count');
  const emptyState = document.querySelector('.empty-state');
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const backTop = document.querySelector('.back-to-top');
  let activeFilter = 'all';
  const normalize = (text) => text.toLocaleLowerCase().normalize('NFKC').trim();

  function applyFilters(updateURL = true) {
    const query = normalize(search.value);
    const words = query.split(/\s+/).filter(Boolean);
    const matches = (text) => words.every(word => normalize(text).includes(word));
    let visibleCount = 0;
    for (const section of sections) {
      const categoryMatch = activeFilter === 'all' || section.dataset.section === activeFilter;
      let sectionCount = 0;
      for (const item of section.querySelectorAll('[data-item]')) {
        const match = categoryMatch && matches(item.dataset.search || item.textContent);
        item.hidden = !match;
        if (!match) continue;
        sectionCount++;
        if (item.classList.contains('researcher-card')) {
          const personMatch = matches(item.dataset.profile);
          const projects = [...item.querySelectorAll('.project-link')];
          const projectMatches = projects.map(project => matches(item.dataset.profile + ' ' + project.textContent + ' ' + project.href));
          const hasProjectMatch = projectMatches.some(Boolean);
          for (const [index, project] of projects.entries()) {
            project.hidden = !!query && !personMatch && hasProjectMatch && !projectMatches[index];
          }
          const label = item.querySelector('.project-label');
          if (!label.dataset.original) label.dataset.original = label.textContent;
          const visibleProjects = projects.filter(project => !project.hidden).length;
          label.textContent = query && visibleProjects < projects.length
            ? `${visibleProjects} matching ${visibleProjects === 1 ? 'project' : 'projects'}`
            : label.dataset.original;
        }
      }
      section.hidden = sectionCount === 0;
      visibleCount += sectionCount;
    }
    resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'entry' : 'entries'}` + (query ? ' found' : '');
    emptyState.hidden = visibleCount !== 0;
    clear.hidden = !search.value;
    for (const button of filters) button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter));
    if (updateURL) {
      const url = new URL(window.location.href);
      if (query) url.searchParams.set('q', search.value.trim()); else url.searchParams.delete('q');
      if (activeFilter !== 'all') url.searchParams.set('section', activeFilter); else url.searchParams.delete('section');
      try { window.history.replaceState(null, '', url); } catch (_) { /* Local file previews can restrict history. */ }
    }
  }

  search.addEventListener('input', () => applyFilters());
  clear.addEventListener('click', () => { search.value = ''; applyFilters(); search.focus(); });
  filters.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    applyFilters();
  }));
  document.querySelector('#reset-search').addEventListener('click', () => {
    search.value = ''; activeFilter = 'all'; applyFilters(); search.focus();
  });
  document.addEventListener('keydown', event => {
    const editing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (event.key === '/' && !editing && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault(); search.focus();
    }
    if (event.key === 'Escape' && document.activeElement === search) {
      search.value = ''; applyFilters(); search.blur();
    }
  });

  function revealAnchor(event) {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = document.getElementById(anchor.hash.slice(1));
    if (!target) return;
    const section = target.closest('[data-section]');
    if (section && (section.hidden || search.value || activeFilter !== 'all')) {
      activeFilter = 'all'; search.value = ''; applyFilters();
    }
  }
  document.addEventListener('click', revealAnchor);

  const params = new URLSearchParams(window.location.search);
  search.value = params.get('q') || '';
  const initialFilter = params.get('section');
  if (filters.some(button => button.dataset.filter === initialFilter)) activeFilter = initialFilter;
  applyFilters(false);

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of navLinks) {
        const active = link.dataset.nav === entry.target.id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      }
    }
  }, { rootMargin: '-10% 0px -65% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
  window.addEventListener('scroll', () => { backTop.hidden = window.scrollY < 650; }, { passive: true });
  backTop.addEventListener('click', () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  });
})();
