// ============================================================================
// Coastline Cover Studio — a tiny static server, third draft (class-based).
//
// Serves app/ on http://localhost:8080 so the cover maker can be tried in
// desktop Chrome. Not part of the entry: the finalist review serves app/
// with its own server. Run: `node serve.ts [--port <n>]`.
//
// This is a from-scratch rewrite of the server. The previous draft was free
// functions around a single createServer call; this one puts the whole
// server in a StaticServer class so the app root, the MIME table and the
// port travel together, and each step (pick a port, resolve a request,
// stream a file) is a method. The behaviour is unchanged: same routes,
// same status codes, same headers, same refusal of paths that climb out
// of app/.
// ============================================================================

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Content types by file extension. Unknown extensions fall back to
// application/octet-stream (see StaticServer.serveFile).
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
};

// ============================================================================
// StaticServer
// ============================================================================
//
// Serves one directory (app/) over HTTP on 127.0.0.1. A request path is
// resolved under the app root; a path that climbs out of it is refused
// with 403, a missing or non-file path with 404, and anything else is
// streamed back with its content type and length.
class StaticServer {
  constructor(appRoot, port) {
    this.appRoot = appRoot;
    this.port = port;
  }

  /** The port from --port, or 8080 when the flag is missing or bad. */
  static pickPort() {
    const argv = process.argv.slice(2);
    const at = argv.indexOf('--port');
    const wanted = at === -1 ? 8080 : Number(argv[at + 1]);
    const ok = Number.isInteger(wanted) && wanted > 0 && wanted < 65536;
    return ok ? wanted : 8080;
  }

  /** Resolves a request path to a file under the app root, or a refusal. */
  resolveRequest(urlPath) {
    let pathname;
    try {
      pathname = decodeURIComponent(urlPath);
    } catch {
      return { status: 400, message: 'bad request' };
    }
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = resolve(join(this.appRoot, normalize(pathname)));
    if (file !== this.appRoot && !file.startsWith(this.appRoot + sep)) {
      return { status: 403, message: 'forbidden' };
    }
    return { file };
  }

  /** Streams a file to the response, or 404s when it is not a plain file. */
  serveFile(response, file) {
    let size;
    try {
      const stats = statSync(file);
      if (!stats.isFile()) throw new Error('not a file');
      size = stats.size;
    } catch {
      response.writeHead(404).end('not found');
      return;
    }
    response.writeHead(200, {
      'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
      'content-length': size,
      'cache-control': 'no-store',
    });
    createReadStream(file).pipe(response);
  }

  /** Starts listening and logs where the app is. */
  listen() {
    const server = createServer((request, response) => {
      const url = new URL(request.url ?? '/', 'http://localhost');
      const resolved = this.resolveRequest(url.pathname);
      if (resolved.status) {
        response.writeHead(resolved.status).end(resolved.message);
        return;
      }
      this.serveFile(response, resolved.file);
    });
    server.listen(this.port, '127.0.0.1', () => {
      console.log(`app/ is on http://localhost:${this.port}`);
    });
    return server;
  }
}

const APP_ROOT = resolve(join(fileURLToPath(new URL('.', import.meta.url)), 'app'));
const port = StaticServer.pickPort();

new StaticServer(APP_ROOT, port).listen();
