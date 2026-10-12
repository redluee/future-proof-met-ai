const BARE_DOMAIN = "(?:[a-z0-9-]+\\.)+(?:nl|com|org|net|io|dev|app|eu|be|de)\\b(?:\\/[^\\s<>\"']*)?";
const URL_PATTERN = new RegExp(`((?:https?:\\/\\/|www\\.)[^\\s<>"']+|(?<![\\w@./-])${BARE_DOMAIN})`, "gi");
const TRAILING_PUNCTUATION = /[.,;:!?)\]}]+$/;

export function LinkifiedText({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_PATTERN).map((part, i) => {
        // split() with one capture group puts the URLs at the odd indexes
        if (i % 2 === 0) return part;
        const trailing = part.match(TRAILING_PUNCTUATION)?.[0] ?? "";
        const url = trailing ? part.slice(0, -trailing.length) : part;
        const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        return (
          <span key={i}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-brand underline underline-offset-4 hover:text-brand-hover"
            >
              {url}
            </a>
            {trailing}
          </span>
        );
      })}
    </>
  );
}
