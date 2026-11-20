// Coastline Cover Studio — a tiny static server for local testing.
//
// Serves app/ on http://localhost:8080 so the cover maker can be tried in
// desktop Chrome. Not part of the entry: the finalist review serves app/
// with its own server. Run: `node serve.ts [--port <n>]`.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = resolve(join(fileURLToPath(new URL('.', import.meta.url)), 'app'));

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

/** The port from --port, or 8080 when the flag is missing or bad. */
function pickPort() {
  const argv = process.argv.slice(2);
  const at = argv.indexOf('--port');
  const wanted = at === -1 ? 8080 : Number(argv[at + 1]);
  return Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;
}

const port = pickPort();

/** Resolves a request path to a file under APP_ROOT, or a refusal status. */
function resolveRequest(urlPath) {
  let pathname;
  try {
    pathname = decodeURIComponent(urlPath);
  } catch {
    return { status: 400, message: 'bad request' };
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(APP_ROOT, normalize(pathname)));
  if (file !== APP_ROOT && !file.startsWith(APP_ROOT + sep)) {
    return { status: 403, message: 'forbidden' };
  }
  return { file };
}

/** Streams a file to the response, or 404s when it is not a plain file. */
function serveFile(response, file) {
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

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const resolved = resolveRequest(url.pathname);
  if (resolved.status) {
    response.writeHead(resolved.status).end(resolved.message);
    return;
  }
  serveFile(response, resolved.file);
}).listen(port, '127.0.0.1', () => {
  console.log(`app/ is on http://localhost:${port}`);
});
