(() => {
  const button = document.getElementById('site-search-button');
  const data = document.getElementById('site-search-data');
  if (!button || !data) return;

  let entries;
  try {
    entries = JSON.parse(data.textContent);
  } catch {
    return;
  }
  if (!Array.isArray(entries) || !entries.length) return;

  const normalize = (value) => value.normalize('NFKD').toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/[^a-z0-9+#]+/g, ' ').trim();
  const index = entries.map((entry) => ({
    ...entry,
    titleWords: normalize(entry.title),
    words: normalize(`${entry.title} ${entry.text}`),
  }));
  const root = new URL(button.dataset.siteRoot, document.baseURI);
  const dialog = document.createElement('dialog');
  dialog.id = 'site-search-dialog';
  dialog.className = 'site-search-dialog';
  dialog.setAttribute('aria-labelledby', 'site-search-heading');
  dialog.innerHTML = `
    <div class="site-search-heading">
      <h2 id="site-search-heading">Search the website</h2>
      <button class="site-search-close" type="button" aria-label="Close search">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>
      </button>
    </div>
    <form role="search" class="site-search-form">
      <label for="site-search-input">Search courses, publications, and other pages</label>
      <input id="site-search-input" type="search" autocomplete="off" spellcheck="false" placeholder="Enter a title, topic, or course code" aria-controls="site-search-results" aria-describedby="site-search-status">
    </form>
    <p class="site-search-status" id="site-search-status" role="status" aria-live="polite" aria-atomic="true">Type to search across the website.</p>
    <ul class="site-search-results" id="site-search-results" aria-label="Search results"></ul>`;
  document.body.appendChild(dialog);

  const input = dialog.querySelector('input');
  const form = dialog.querySelector('form');
  const results = dialog.querySelector('.site-search-results');
  const status = dialog.querySelector('.site-search-status');

  const excerpt = (text, terms) => {
    const match = terms.map((term) => text.toLowerCase().indexOf(term))
      .filter((position) => position >= 0).sort((a, b) => a - b)[0] || 0;
    let start = Math.max(0, match - 65);
    if (start) {
      const space = text.indexOf(' ', start);
      if (space >= 0 && space < start + 25) start = space + 1;
    }
    const snippet = text.slice(start, start + 220).trim();
    return `${start ? '\u2026' : ''}${snippet}${start + 220 < text.length ? '\u2026' : ''}`;
  };

  const search = () => {
    const query = normalize(input.value);
    results.replaceChildren();
    if (!query) {
      status.textContent = 'Type to search across the website.';
      return;
    }
    const terms = query.split(/\s+/);
    const matches = index.filter((entry) => terms.every((term) => entry.words.includes(term)))
      .map((entry) => ({
        entry,
        score: (entry.titleWords.includes(query) ? 30 : 0)
          + terms.reduce((score, term) => score + (entry.titleWords.includes(term) ? 10 : 0), 0),
      }))
      .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));

    if (!matches.length) {
      status.textContent = 'No results found. Try a different word or course code.';
      return;
    }
    status.textContent = matches.length > 20
      ? `Showing 20 of ${matches.length} results. Add another word to narrow your search.`
      : `${matches.length} ${matches.length === 1 ? 'result' : 'results'} found.`;
    matches.slice(0, 20).forEach(({ entry }) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = new URL(entry.href, root).href;
      const title = document.createElement('span');
      title.className = 'site-search-result-title';
      title.textContent = entry.title;
      const summary = document.createElement('span');
      summary.className = 'site-search-result-excerpt';
      summary.textContent = excerpt(entry.text, terms);
      link.append(title, summary);
      item.appendChild(link);
      results.appendChild(item);
    });
  };

  button.addEventListener('click', () => {
    dialog.showModal();
    document.documentElement.classList.add('site-search-open');
    input.focus();
  });
  dialog.querySelector('.site-search-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('site-search-open');
    button.focus();
  });
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  input.addEventListener('input', search);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' && results.querySelector('a')) {
      event.preventDefault();
      results.querySelector('a').focus();
    }
  });
  results.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const links = Array.from(results.querySelectorAll('a'));
    const position = links.indexOf(document.activeElement);
    if (position < 0) return;
    event.preventDefault();
    const next = event.key === 'ArrowDown' ? position + 1 : position - 1;
    if (next < 0) input.focus();
    else if (links[next]) links[next].focus();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    search();
    results.querySelector('a')?.focus();
  });
  button.hidden = false;
})();
