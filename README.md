# cdt-ai-module

This repository contains source PowerPoint decks, converted Marp Markdown decks, and tooling to build the Marp decks for GitHub Pages.

## Install dependencies

Install Python dependencies for PowerPoint conversion and Node dependencies for Marp builds:

```bash
python -m pip install -r requirements.txt
npm install
```

For CI, use `npm ci` instead of `npm install`.

## Convert PowerPoint decks to Marp Markdown

```bash
python scripts/pptx_to_marp.py
```

The converter reads `.pptx` files, writes Marp Markdown to `slides/<deck-name>.md`, and extracts images to `slides/images/<deck-name>/`.

## Build slides locally

Render all `slides/*.md` decks to static HTML:

```bash
make slides
```

Generated output is written to `public/`:

```text
public/index.html
public/slides/<deck-name>/index.html
public/slides/images/<deck-name>/...
```

`public/` is generated and ignored by git.

## Preview slides locally

Start the Marp local preview server:

```bash
make preview
```

This serves the source decks from `slides/` for interactive local preview.

## Clean generated output

```bash
make clean
```

This removes `public/` and the temporary `.marp-cache/` build directory.

## Deploy via GitHub Pages

GitHub Pages is built by `.github/workflows/pages.yml` using GitHub Actions. On each push to `main`, the workflow:

1. installs Node dependencies with `npm ci`,
2. runs `npm run slides`,
3. uploads `public/` with `actions/upload-pages-artifact`, and
4. deploys with `actions/deploy-pages`.

In the repository settings, set GitHub Pages **Source** to **GitHub Actions**. Generated HTML is not committed to a branch.

## Add a new slide deck

1. Add or generate `slides/<new-deck>.md` with Marp frontmatter.
2. Put any images under `slides/images/<new-deck>/` and reference them from the Markdown as `images/<new-deck>/<image-file>`.
3. Run `make slides` to verify the generated HTML and index locally.
4. Commit the source Markdown, images, and any relevant PowerPoint source files.
