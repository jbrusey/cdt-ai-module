# cdt-ai-module

This repository contains source PowerPoint decks, converted Marp Markdown decks, and tooling to build the Marp decks for GitHub Pages.

## Install dependencies

Install Python dependencies for PowerPoint conversion, Node dependencies for Marp builds, and Ruby/Jekyll dependencies for the themed index page:

```bash
python -m pip install -r requirements.txt
npm install
bundle install
```

For CI, use `npm ci` instead of `npm install`; GitHub Actions handles the Ruby bundle automatically.

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

The Marp build writes generated Jekyll source files to `public/`, then Jekyll renders the publishable site to `_site/` using the Minimal Mistakes theme:

```text
public/index.md
public/_config.yml
public/slides/<deck-name>/index.html
public/slides/images/<deck-name>/...
_site/index.html
_site/slides/<deck-name>/index.html
```

`public/` and `_site/` are generated and ignored by git.

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

This removes `public/`, `_site/`, and the temporary `.marp-cache/` build directory.

## Deploy via GitHub Pages

GitHub Pages is built by `.github/workflows/pages.yml` using GitHub Actions. On each push to `main`, the workflow:

1. installs Node dependencies with `npm ci`,
2. installs Ruby/Jekyll dependencies with Bundler,
3. runs `make slides`, which renders Marp decks and builds the Minimal Mistakes Jekyll index,
4. uploads `_site/` with `actions/upload-pages-artifact`, and
5. deploys with `actions/deploy-pages`.

In the repository settings, set GitHub Pages **Source** to **GitHub Actions**. Generated HTML is not committed to a branch.

The index page theme is configured in the generated `public/_config.yml` as `remote_theme: mmistakes/minimal-mistakes@4.27.3`. To change skins or theme options, update `scripts/build_slides.mjs`.

## Add a new slide deck

1. Add or generate `slides/<new-deck>.md` with Marp frontmatter.
2. Put any images under `slides/images/<new-deck>/` and reference them from the Markdown as `images/<new-deck>/<image-file>`.
3. Run `make slides` to verify the generated HTML and index locally.
4. Commit the source Markdown, images, and any relevant PowerPoint source files.
