# smsrinivasan822.github.io

Edit `index.qmd` to change the website content. This Quarto file uses Markdown;
`_quarto.yml` controls the HTML rendering options.

Preview locally with Quarto installed:

```powershell
quarto preview index.qmd
```

After editing, generate the website:

```powershell
quarto render
```

This updates `index.html` in the repository root. It is generated output, so edit
`index.qmd` rather than editing the HTML directly. Commit and push both the source
and the rendered HTML to publish your changes with GitHub Pages configured to
serve the repository root. Rendering and previewing do not publish changes.

## Teaching pages

The Teaching overview is `teaching/index.qmd`. Each course has a folder beneath
`teaching/` containing its own `index.qmd` and generated `index.html`. Replace
the "Coming soon" text in a course's Quarto file when materials are ready.
Run `quarto render` from the repository root to rebuild all pages.

The 21 courses were extracted from the teaching experience sections of the
Fall 2026 CV, including undergraduate teaching. Repeated offerings are grouped
by course code; CSCI 1400 is separated into C++ and Java. INSC 561 retains its
earlier title, Web Security. The cross-listed INSC 846/DAAN 846 shares a folder;
SWENG 568 and INSC 568 have separate folders matching the CV's course codes.
Courses described only under course development (CSC 842 and CSC 894) are not
listed as taught. Teaching periods show the first and last recorded terms,
rather than implying continuous teaching. The CV itself is not published.

## Site search

The magnifying-glass button beside Contact searches the site's pages and individual
publications. `assets/site-search.js` controls the search dialog. After each render,
Quarto runs `scripts/build-search-index.py` with Python to refresh the embedded
search data in every page. The index uses the rendered page content and works
without a separate search service, including when opening the HTML files locally.

## Homepage styling

The homepage content and section links live in `index.qmd`. Edit `styles.css` to
change colors, typography, spacing, or the mobile layout. The original network
illustration is in `assets/research-network.svg`. Quarto embeds the stylesheet
and illustration into the rendered HTML.

The homepage was prepared using these public Penn State sources:

- [Faculty profile](https://greatvalley.psu.edu/person/satish-mahadevan-srinivasan)
  (linked from the page; direct retrieval was blocked by the university website).
- [Engineering directory](https://greatvalley.psu.edu/directory/engineering)
  for the academic title, office, and phone number.
- [Research profile](https://pure.psu.edu/en/persons/satish-mahade-van-srinivasan/)
  for selected publications and research themes.
- [Faculty governance directory](https://senate.psu.edu/faculty/campus-and-college-governance-chairs/)
  for the university email address.
- Penn State's big data and sports analytics stories linked in the student
  research section for mentoring examples.

Review publication and contact details when updating the page. No publication
metrics, degree history, course list, or portrait have been assumed.
