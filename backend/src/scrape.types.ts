export type ScrapeItem = {
  text: string;
  html: string;
  link?: string | null;
};

export type ScrapeResult = {
  title: string | null;
  metaDescription: string | null;
  h1s: string[];
  linkCount: number;
  items: ScrapeItem[];
  pagesVisited: string[];
};
