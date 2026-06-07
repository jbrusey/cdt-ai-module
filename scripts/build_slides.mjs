#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const slidesDir = join(root, 'slides');
const siteSourceDir = join(root, 'site');
const publicDir = join(root, 'public');
const publicSlidesDir = join(publicDir, 'slides');
const cacheDir = join(root, '.marp-cache');
const siteDir = join(root, '_site');
const localMarp = process.platform === 'win32'
  ? join(root, 'node_modules', '.bin', 'marp.cmd')
  : join(root, 'node_modules', '.bin', 'marp');

function usage() {
  console.log('Usage: node scripts/build_slides.mjs [--clean]');
}

function clean() {
  rmSync(publicDir, { recursive: true, force: true });
  rmSync(cacheDir, { recursive: true, force: true });
  rmSync(siteDir, { recursive: true, force: true });
  console.log('Removed public/, _site/, and .marp-cache/');
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function ensureMarp() {
  if (!existsSync(localMarp)) {
    fail('Marp CLI is missing. Run `npm install` before building slides.');
  }
}

function slugify(name) {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'deck';
}

function firstHeading(markdown, fallback) {
  const inFrontMatter = markdown.startsWith('---');
  let skippingFrontMatter = inFrontMatter;
  const lines = markdown.split(/\r?\n/);
  for (let i = skippingFrontMatter ? 1 : 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (skippingFrontMatter) {
      if (line.trim() === '---') skippingFrontMatter = false;
      continue;
    }
    const match = line.match(/^#\s+(.+?)\s*$/);
    if (match) return match[1].trim();
  }
  return fallback;
}

function htmlEscape(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function deckFiles() {
  if (!existsSync(slidesDir)) fail('slides/ directory does not exist.');
  return readdirSync(slidesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === '.md')
    .map((entry) => join(slidesDir, entry.name))
    .sort((a, b) => basename(a).localeCompare(basename(b)));
}

function rewriteImagePaths(markdown) {
  // Source decks reference slides/images/... as images/..., because the Markdown
  // lives directly under slides/. Generated HTML is written to
  // public/slides/<deck>/index.html, so image URLs need one parent directory.
  return markdown
    .replace(/(\]\()images\//g, '$1../images/')
    .replace(/(url\(["']?)images\//g, '$1../images/')
    .replace(/(<img\b[^>]*\bsrc=["'])images\//g, '$1../images/');
}

function copySiteSource() {
  if (!existsSync(siteSourceDir)) fail('site/ directory does not exist.');
  cpSync(siteSourceDir, publicDir, { recursive: true });
}

function writeSlideList(decks) {
  const items = decks.map((deck) => {
    return `- <a href="slides/${encodeURIComponent(deck.slug)}/">${htmlEscape(deck.title)}</a>`;
  }).join('\n');

  const markdown = `---
layout: single
title: CDT AI Module slide decks
classes: wide
permalink: /slides.html
---

Generated from Marp Markdown sources in \`slides/\`.

## Available decks

${items}
`;
  writeFileSync(join(publicDir, 'slides.md'), markdown, 'utf8');
}

function build() {
  ensureMarp();
  clean();
  copySiteSource();
  mkdirSync(publicSlidesDir, { recursive: true });
  mkdirSync(cacheDir, { recursive: true });

  const imagesDir = join(slidesDir, 'images');
  if (existsSync(imagesDir)) {
    cpSync(imagesDir, join(publicSlidesDir, 'images'), { recursive: true });
    cpSync(imagesDir, join(cacheDir, 'images'), { recursive: true });
  }

  const files = deckFiles();
  if (files.length === 0) fail('No slides/*.md decks found.');

  const usedSlugs = new Map();
  const decks = [];

  for (const file of files) {
    const originalName = basename(file, extname(file));
    const baseSlug = slugify(originalName);
    const count = usedSlugs.get(baseSlug) || 0;
    usedSlugs.set(baseSlug, count + 1);
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;

    const markdown = readFileSync(file, 'utf8');
    const title = firstHeading(markdown, originalName);
    const cacheDeckDir = join(cacheDir, slug);
    const outDeckDir = join(publicSlidesDir, slug);
    mkdirSync(cacheDeckDir, { recursive: true });
    mkdirSync(outDeckDir, { recursive: true });

    const cacheMarkdown = join(cacheDeckDir, 'index.md');
    writeFileSync(cacheMarkdown, rewriteImagePaths(markdown), 'utf8');

    const outHtml = join(outDeckDir, 'index.html');
    const result = spawnSync(localMarp, ['--html', '--allow-local-files', '--output', outHtml, cacheMarkdown], {
      stdio: 'inherit',
      cwd: root,
    });
    if (result.status !== 0) {
      fail(`Marp failed while rendering ${relative(root, file).split(sep).join('/')}`);
    }

    decks.push({ slug, title });
    console.log(`Rendered ${relative(root, file)} -> ${relative(root, outHtml)}`);
  }

  writeSlideList(decks);
  console.log(`Built ${decks.length} deck(s) into public/`);
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  usage();
  process.exit(0);
}
if (args.length > 1 || (args.length === 1 && args[0] !== '--clean')) {
  usage();
  process.exit(1);
}

if (args[0] === '--clean') clean();
else build();
