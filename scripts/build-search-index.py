"""Refresh the embedded site-search index after a Quarto render."""

from html.parser import HTMLParser
import json
from pathlib import Path
import re


class Element:
    def __init__(self, tag="", attrs=()):
        self.tag = tag
        self.attrs = dict(attrs)
        self.children = []

    def find(self, predicate):
        if predicate(self):
            return self
        for child in self.children:
            if isinstance(child, Element) and (found := child.find(predicate)):
                return found
        return None

    def all(self, predicate):
        matches = [self] if predicate(self) else []
        for child in self.children:
            if isinstance(child, Element):
                matches.extend(child.all(predicate))
        return matches

    def text(self, exclude_publications=False):
        if self.tag in {"script", "style", "button", "form", "noscript"}:
            return ""
        if exclude_publications and self.tag == "article" and self.has_class("publication"):
            return ""
        parts = [child.text(exclude_publications) if isinstance(child, Element) else child
                 for child in self.children]
        return re.sub(r"\s+", " ", " ".join(parts)).strip()

    def has_class(self, name):
        return name in self.attrs.get("class", "").split()


class Document(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
            "meta", "param", "source", "track", "wbr"}

    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = Element()
        self.stack = [self.root]
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        element = Element(tag, attrs)
        self.stack[-1].children.append(element)
        if tag not in self.VOID:
            self.stack.append(element)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for position in range(len(self.stack) - 1, 0, -1):
            if self.stack[position].tag == tag:
                del self.stack[position:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def build():
    root = Path(__file__).resolve().parent.parent
    pages = sorted(source.with_suffix(".html") for source in root.rglob("*.qmd")
                   if not any(part.startswith(".") for part in source.relative_to(root).parts)
                   and source.with_suffix(".html").is_file())
    documents = {}
    entries = []
    for page in pages:
        source = page.read_text(encoding="utf-8")
        document = Document(source).root
        main = document.find(lambda element: element.attrs.get("id") == "main-content")
        title = document.find(lambda element: element.tag == "title")
        if main is None or title is None:
            continue
        href = page.relative_to(root).as_posix()
        page_title = "Home" if href == "index.html" else title.text().split(" | ")[0]
        entries.append({"title": page_title, "href": href,
                        "text": main.text(exclude_publications=True)})
        for article in main.all(lambda element: element.tag == "article"
                                and element.has_class("publication")):
            heading = article.find(lambda element: element.tag == "h3"
                                   and "id" in element.attrs)
            if heading is not None:
                entries.append({"title": heading.text(),
                                "href": href + "#" + heading.attrs["id"],
                                "text": article.text()})
        documents[page] = source

    # Escaping '<' keeps titles and snippets from terminating the JSON script tag.
    payload = json.dumps(entries, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    pattern = re.compile(r'(<script\b[^>]*\bid="site-search-data"[^>]*>).*?(</script>)', re.S)
    updated = 0
    for page, source in documents.items():
        rendered, matches = pattern.subn(lambda match: match[1] + payload + match[2], source)
        if matches != 1:
            raise RuntimeError(f"Expected one search-data placeholder in {page.relative_to(root)}")
        if rendered != source:
            page.write_text(rendered, encoding="utf-8")
        updated += 1
    print(f"Site search: indexed {len(entries)} entries across {updated} pages.")


if __name__ == "__main__":
    build()
