import { CopyText } from "./copy-text";

/**
 * Challenge text. A line wrapped in backticks, like `NK{abc}`, becomes a tap-to-copy
 * block so phone users never have to select text by hand. Everything else is plain text.
 */
export function Description({ text }: { text: string }) {
  const parts = text.split(/\n/).reduce<{ copy?: string; text?: string }[]>((acc, line) => {
    const m = /^`(.+)`$/.exec(line.trim());
    if (m) acc.push({ copy: m[1] });
    else if (acc.at(-1)?.text !== undefined) acc[acc.length - 1].text += `\n${line}`;
    else acc.push({ text: line });
    return acc;
  }, []);

  return (
    <div className="grid max-w-3xl gap-4 text-lg leading-relaxed text-ink/85">
      {parts.map((p, i) =>
        p.copy ? (
          <CopyText key={i} text={p.copy} />
        ) : (
          p.text?.trim() && (
            <p key={i} className="whitespace-pre-wrap">
              {p.text.trim()}
            </p>
          )
        ),
      )}
    </div>
  );
}
