const URL_PATTERN = /((?:https?:\/\/|www\.)[^\s<>"']+)/gi;
const TRAILING_PUNCTUATION = /[.,;:!?)\]}]+$/;

export function LinkifiedText({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_PATTERN).map((part, i) => {
        // split() with one capture group puts the URLs at the odd indexes
        if (i % 2 === 0) return part;
        const trailing = part.match(TRAILING_PUNCTUATION)?.[0] ?? "";
        const url = trailing ? part.slice(0, -trailing.length) : part;
        const href = url.toLowerCase().startsWith("www.") ? `https://${url}` : url;
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
