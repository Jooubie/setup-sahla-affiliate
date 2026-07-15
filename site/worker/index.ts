/** Cloudflare Worker entry point for the Setup Sahla publication. */
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const worker = {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/sitemap.xml" || url.pathname === "/robots.txt") {
      url.pathname += "/";
      request = new Request(url, request);
    }
    return handler.fetch(request, env, ctx);
  },
};

export default worker;
