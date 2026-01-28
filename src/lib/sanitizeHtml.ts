export function sanitizeHtml(html: string) {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return html;
  }

  const allowedTags = new Set([
    "P",
    "H1",
    "H2",
    "H3",
    "STRONG",
    "EM",
    "A",
    "IMG",
    "FIGURE",
    "FIGCAPTION",
    "SPAN",
    "UL",
    "OL",
    "LI",
    "BR",
    "BLOCKQUOTE",
  ]);

  const allowedAttrs: Record<string, string[]> = {
    A: ["href", "target", "rel"],
    IMG: ["src", "alt", "width", "height"],
    FIGURE: ["class"],
    SPAN: ["class"],
  };

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const walk = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tag = element.tagName;

        if (!allowedTags.has(tag)) {
          const parent = element.parentNode;
          if (parent) {
            const children = Array.from(element.childNodes);
            for (const child of children) parent.insertBefore(child, element);
            parent.removeChild(element);
          }
          return;
        }

        const allowed = new Set(allowedAttrs[tag] ?? []);
        for (const attr of Array.from(element.attributes)) {
          if (!allowed.has(attr.name)) {
            element.removeAttribute(attr.name);
          }
        }

        if (tag === "A") {
          const href = element.getAttribute("href") ?? "";
          if (!href || href.startsWith("javascript:")) {
            element.removeAttribute("href");
          }
          element.setAttribute("rel", "noreferrer noopener");
          element.setAttribute("target", "_blank");
        }

        if (tag === "IMG") {
          const src = element.getAttribute("src") ?? "";
          if (!src || src.startsWith("javascript:")) {
            element.remove();
            return;
          }
        }
      }

      for (const child of Array.from(node.childNodes)) {
        walk(child);
      }
    };

    const body = doc.body;
    if (!body) return html;
    walk(body);
    return body.innerHTML ?? html;
  } catch {
    return html;
  }
}
