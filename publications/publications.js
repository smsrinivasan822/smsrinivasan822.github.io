(() => {
  const form = document.getElementById('publication-filters');
  const list = document.getElementById('publication-list');
  if (!form || !list) return;

  const entries = Array.from(list.querySelectorAll('.publication'));
  const search = document.getElementById('publication-search');
  const year = document.getElementById('publication-year');
  const type = document.getElementById('publication-type');
  const count = document.getElementById('publication-count');
  const empty = document.getElementById('publication-empty');
  const normalize = (value) => value.normalize('NFKD').toLowerCase()
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const searchable = new Map(entries.map((entry) => [entry, normalize(entry.textContent)]));

  const years = [...new Set(entries.map((entry) => entry.dataset.year))]
    .sort((a, b) => (Number(b) || 0) - (Number(a) || 0));
  years.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value === 'undated' ? 'Year not listed' : value;
    year.appendChild(option);
  });

  const filter = () => {
    const terms = normalize(search.value).split(' ').filter(Boolean);
    let visible = 0;
    entries.forEach((entry) => {
      const matches = (!year.value || entry.dataset.year === year.value)
        && (!type.value || entry.dataset.type === type.value)
        && terms.every((term) => searchable.get(entry).includes(term));
      entry.hidden = !matches;
      if (matches) visible += 1;
    });
    count.textContent = `Showing ${visible} of ${entries.length} publications`;
    empty.hidden = visible !== 0;
  };

  form.addEventListener('submit', (event) => event.preventDefault());
  search.addEventListener('input', filter);
  year.addEventListener('change', filter);
  type.addEventListener('change', filter);
  form.addEventListener('reset', () => {
    search.value = '';
    year.value = '';
    type.value = '';
    filter();
  });
  form.hidden = false;
  filter();
})();
