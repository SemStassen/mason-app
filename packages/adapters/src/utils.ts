import { Effect } from "effect";
import { IntegrationDecodingError } from "./errors";

// Simplest tiptap format storable in DB
interface TiptapDoc {
  type: "doc";
  content: Array<{
    type: "paragraph";
    content: Array<{ type: "hardBreak" } | { type: "text"; text: string }>;
  }>;
}

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

export const buildUrl = (
  path: string,
  params: Record<string, string | number | boolean | undefined | null> = {}
): string => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
};

export function fetchPaginated<A, E>({
  fetchPage,
  getNextPage,
  extractItems,
}: {
  /** Fetch one page, given a page number or cursor */
  fetchPage: (page: number | string) => Effect.Effect<Response, E>;

  /** Given the response body and current page, return next page param or `null` if done */
  getNextPage: (
    res: Response,
    currentPage: number | string
  ) => number | string | null;

  /** How to extract items from the response body */
  extractItems: (body: unknown) => Array<A>;
}): Effect.Effect<Array<A>, E | IntegrationDecodingError> {
  return Effect.gen(function* () {
    let results: Array<A> = [];
    let page: number | string = 1;

    while (true) {
      const response = yield* fetchPage(page);

      const body = yield* Effect.tryPromise({
        try: () => response.json(),
        catch: (e) => new IntegrationDecodingError({ error: e }),
      });

      const items = yield* Effect.try({
        try: () => extractItems(body),
        catch: (e) => new IntegrationDecodingError({ error: e }),
      });

      results = results.concat(items);

      const nextPage = getNextPage(response, page);
      if (!nextPage) {
        break;
      }
      page = nextPage;
    }

    return results;
  });
}
