import assert from "assert";
import fetch from "node-fetch";
import querystring from "querystring";
import config from "../config";

type TenorResponse = {
  results: Gif[];
  next: string;
};

export type Gif = {
  url: string;
};

function shuffled<T>(xs: T[]): T[] {
  const copy = [...xs];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function searchGifs(q: string, limit = 10): Promise<Gif[]> {
  assert(q !== "", `search terms (q) should be a non-empty string.`);
  assert(
    limit > 0 && Number.isInteger(limit),
    `Limit should be a positive integer. (${limit} given)`,
  );

  const key = config.TENOR_KEY;
  const qs = querystring.stringify({ q, limit, key });

  const res: TenorResponse = await fetch(
    `https://g.tenor.com/v1/search?${qs}`,
  ).then((r) => r.json());

  return shuffled(res.results);
}
