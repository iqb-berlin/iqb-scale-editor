#!/usr/bin/env node
/**
 * Inlines all dependencies of the built Angular app into one self-contained HTML file.
 *
 *   node scripts/inline-html.mjs [browserDir] [outFile]
 *
 * Defaults: dist/iqb-scale-editor/browser → dist/iqb-scale-editor/iqb-scale-editor.html
 *
 * Inlined:
 * - <script src="…">            → <script>…</script> (local files)
 * - <link rel="stylesheet">      → <style>…</style> (local files and remote CSS, e.g. Google Fonts)
 * - url(…) in all CSS            → data: URIs (local files and remote fonts/images)
 * - <link rel="icon" href="…">   → data: URI
 * Removed: <link rel="preconnect|dns-prefetch|preload|modulepreload">, <noscript> stylesheet fallbacks.
 *
 * The result works offline and from file://. Fails (exit 1) if a dependency cannot be resolved.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';

const browserDir = resolve(process.argv[2] ?? 'dist/iqb-scale-editor/browser');
const outFile = resolve(process.argv[3] ?? join(dirname(browserDir), 'iqb-scale-editor.html'));

// A browser user agent makes Google Fonts serve woff2.
const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

const MIME = {
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
};

const isRemote = (url) => /^https?:\/\//i.test(url) || url.startsWith('//');
const isInlineable = (url) => url && !url.startsWith('data:') && !url.startsWith('#');

const cache = new Map();

/** Loads a dependency (local path relative to `baseDir`, or remote URL) as Buffer + mime type. */
async function load(url, baseDir) {
  const key = isRemote(url) ? url : resolve(baseDir, decodeURIComponent(url.split(/[?#]/)[0]));
  if (cache.has(key)) return cache.get(key);
  let result;
  if (isRemote(url)) {
    const res = await fetch(url.startsWith('//') ? `https:${url}` : url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const type = (res.headers.get('content-type') ?? '').split(';')[0].trim();
    result = {
      data: Buffer.from(await res.arrayBuffer()),
      mime: type || MIME[extname(new URL(res.url).pathname)] || 'application/octet-stream',
    };
  } else {
    result = { data: await readFile(key), mime: MIME[extname(key).toLowerCase()] ?? 'application/octet-stream' };
  }
  cache.set(key, result);
  return result;
}

const dataUri = ({ data, mime }) => `data:${mime};base64,${data.toString('base64')}`;

/** Replaces async matches of `regex` in `text` using `fn(match, ...groups)`. */
async function replaceAsync(text, regex, fn) {
  const parts = [];
  let last = 0;
  for (const m of text.matchAll(regex)) {
    parts.push(text.slice(last, m.index), await fn(...m));
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return parts.join('');
}

/** Gets an attribute value from a tag string. */
function attr(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? (m[2] ?? m[3] ?? m[4]) : undefined;
}

/** Inlines @import and url(…) references of a stylesheet. `base` is a directory or a remote URL. */
async function inlineCss(css, base) {
  const resolveRef = (ref) => (isRemote(base) ? new URL(ref, base).href : ref);
  const baseDir = isRemote(base) ? browserDir : base;

  css = await replaceAsync(css, /@import\s+(?:url\()?\s*["']?([^"')\s;]+)["']?\s*\)?\s*;/g, async (_m, ref) => {
    const url = resolveRef(ref);
    const { data } = await load(url, baseDir);
    return inlineCss(data.toString('utf8'), isRemote(url) ? url : dirname(resolve(baseDir, ref)));
  });

  return replaceAsync(css, /url\(\s*(["']?)([^"')]+)\1\s*\)/g, async (m, _q, ref) => {
    if (!isInlineable(ref.trim())) return m;
    return `url(${dataUri(await load(resolveRef(ref.trim()), baseDir))})`;
  });
}

/** Makes code safe to embed in an inline <script>/<style> element. */
const escapeForTag = (code, tag) => code.replace(new RegExp(`</(${tag})`, 'gi'), '<\\/$1');

async function main() {
  let html = await readFile(join(browserDir, 'index.html'), 'utf8');

  // hints for resources that no longer exist as separate requests
  html = html.replace(/<link\b[^>]*\brel=["']?(preconnect|dns-prefetch|preload|modulepreload)["']?[^>]*>\s*/gi, '');
  // <noscript> fallbacks for stylesheets (the stylesheet itself gets inlined)
  html = html.replace(/<noscript>\s*(<link\b[^>]*>\s*)+<\/noscript>/gi, '');

  // stylesheets
  html = await replaceAsync(html, /<link\b[^>]*\brel=["']?stylesheet["']?[^>]*>/gi, async (tag) => {
    const href = attr(tag, 'href');
    if (!isInlineable(href)) return tag;
    const { data } = await load(href, browserDir);
    const base = isRemote(href) ? href : dirname(resolve(browserDir, href));
    const css = await inlineCss(data.toString('utf8'), base);
    // media="print" + data-beasties-media is Angular's async-loading trick; use the real media
    const media = attr(tag, 'data-beasties-media') ?? attr(tag, 'media');
    const mediaAttr = media && media !== 'all' ? ` media="${media}"` : '';
    return `<style${mediaAttr}>${escapeForTag(css, 'style')}</style>`;
  });

  // url(…) inside existing <style> blocks (e.g. Angular's inlined Google Fonts CSS)
  html = await replaceAsync(html, /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, async (_m, open, css, close) =>
    `${open}${escapeForTag(await inlineCss(css, browserDir), 'style')}${close}`,
  );

  // icons
  html = await replaceAsync(html, /<link\b[^>]*\brel=["']?(?:shortcut )?icon["']?[^>]*>/gi, async (tag) => {
    const href = attr(tag, 'href');
    if (!isInlineable(href)) return tag;
    return tag.replace(href, dataUri(await load(href, browserDir)));
  });

  // scripts
  html = await replaceAsync(html, /<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi, async (m, pre, src, post) => {
    if (!isInlineable(src)) return m;
    const { data } = await load(src, browserDir);
    const attrs = `${pre}${post}`.replace(/\s+(crossorigin|integrity|defer|async)(=["'][^"']*["'])?/gi, '');
    return `<script${attrs.trimEnd()}>${escapeForTag(data.toString('utf8'), 'script')}</script>`;
  });

  // the beasties media-swap script is obsolete once stylesheets are inlined
  html = html.replace(/<script>document\.querySelectorAll\('link\[data-beasties-media\]'\)[\s\S]*?<\/script>/, '');

  const leftovers = [...html.matchAll(/\b(?:src|href)=["'](?!data:|#|https?:\/\/(?:www\.)?w3\.org)([^"']+)["']/gi)]
    .map((m) => m[1])
    .filter((u) => !u.startsWith('/') || u.length > 1);
  if (leftovers.length) console.warn(`Warning: references not inlined: ${leftovers.join(', ')}`);

  await writeFile(outFile, html);
  const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
  console.log(`Wrote ${outFile} (${kb} kB, ${cache.size} dependencies inlined)`);
}

main().catch((e) => {
  console.error(`inline-html failed: ${e.message}`);
  process.exit(1);
});
