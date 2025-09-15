// Simplest tiptap format storable in DB
type TiptapDoc = {
  type: "doc";
  content: Array<{
    type: "paragraph";
    content: Array<{ type: "hardBreak" } | { type: "text"; text: string }>;
  }>;
};

const LINE_BREAK_REGEX = /\r?\n/;

export function stringToTiptapJSON(input: string): Record<string, unknown> {
  // Split by lines, create single paragraph with hardBreaks between lines
  const lines = input.split(LINE_BREAK_REGEX).filter(Boolean);

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: lines.flatMap((line, index) => [
          { type: "text", text: line },
          ...(index < lines.length - 1 ? [{ type: "hardBreak" } as const] : []),
        ]),
      },
    ],
  } satisfies TiptapDoc;
}
