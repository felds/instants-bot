import fetch from "node-fetch";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.myinstants.com";

export async function listInstants(
  search?: string,
  maxResults: number = 5
): Promise<Instant[]> {
  const url = search ? getSearchUrl(search) : getHomeUrl();

  const res = await fetch(url);
  const text = await res.text();
  const $ = cheerio.load(text);
  const instants = $("div.instant")
    .map((i, el) => {
      const attr = $('div.small-button[onmousedown^="play"]', el).attr(
        "onmousedown"
      );
      if (!attr) return;

      const url = urlFromAttr(attr);

      return {
        title: $("a.instant-link", el).text(),
        url,
      };
    })
    .slice(0, maxResults)
    .get();

  return instants;
}

function getSearchUrl(search: string): string {
  const url = new URL(`${BASE_URL}`);
  url.pathname = "/search/";
  url.searchParams.append("name", search);
  return url.toString();
}

function getHomeUrl(): string {
  return `${BASE_URL}/index/br/`;
}

function urlFromAttr(attr: string): string {
  const path = attr.slice(6).slice(0, -2);
  return BASE_URL + path;
}
