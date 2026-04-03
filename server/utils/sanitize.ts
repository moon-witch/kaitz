import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
    "p", "em", "strong", "b", "i", "u", "s",
    "a", "br", "hr",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "h2", "h3", "h4", "h5", "h6",
    "span", "div",
    "img",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    "*": ["class"],
};

export function sanitizeContent(html: string | null | undefined): string {
    if (!html) return "";
    return sanitizeHtml(html, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: ALLOWED_ATTRIBUTES,
        allowedSchemes: ["https", "http", "mailto"],
        // Force rel="noopener noreferrer" on external links
        transformTags: {
            a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
        },
    });
}
