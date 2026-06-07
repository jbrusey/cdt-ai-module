# cdt-ai-module

This repository contains source PowerPoint decks, converted Marp Markdown decks, Jekyll site content, and tooling to build the module site for GitHub Pages.

## Install dependencies

Install Python dependencies for PowerPoint conversion, Node dependencies for Marp builds, and Ruby/Jekyll dependencies for the themed site:

```bash
python -m pip install -r requirements.txt
npm install
bundle install
```

For CI, use `npm ci` instead of `npm install`; GitHub Actions handles the Ruby bundle automatically.

## Convert PowerPoint decks to Marp Markdown (old)

```bash
python scripts/pptx_to_marp.py
```

The converter reads `.pptx` files, writes Marp Markdown to `slides/<deck-name>.md`, and extracts images to `slides/images/<deck-name>/`.

## Build the site locally

Render all `slides/*.md` decks to static HTML and build the Jekyll site:

```bash
make slides
```

The build copies hand-authored Jekyll source files from `site/` to `public/`, generates a slide-list page at `public/slides.md`, renders Marp decks under `public/slides/`, then Jekyll renders the publishable site to `_site/` using the Minimal Mistakes theme:

```text
site/index.md
site/_config.yml
public/index.md
public/slides.md
public/slides/<deck-name>/index.html
public/slides/images/<deck-name>/...
_site/index.html
_site/slides.html
_site/slides/<deck-name>/index.html
```

`public/` and `_site/` are generated and ignored by git. Edit pages in `site/`, not `public/`.

## Preview locally

Preview the full Jekyll site, including the generated slide-list page and rendered slide decks:

```bash
make preview
```

This builds the site and starts `jekyll serve` using `public/` as the generated Jekyll source directory.

To preview only the source slide decks with Marp's interactive preview server, run:

```bash
make slides-preview
```

## Clean generated output

```bash
make clean
```

This removes `public/`, `_site/`, and the temporary `.marp-cache/` build directory.

## Deploy via GitHub Pages

GitHub Pages is built by `.github/workflows/pages.yml` using GitHub Actions. On each push to `main`, the workflow:

1. installs Node dependencies with `npm ci`,
2. installs Ruby/Jekyll dependencies with Bundler,
3. runs `make slides`, which renders Marp decks and builds the Minimal Mistakes Jekyll site,
4. uploads `_site/` with `actions/upload-pages-artifact`, and
5. deploys with `actions/deploy-pages`.

In the repository settings, set GitHub Pages **Source** to **GitHub Actions**. Generated HTML is not committed to a branch.

The site theme is configured in `site/_config.yml` as `remote_theme: mmistakes/minimal-mistakes@4.27.3`. To change skins or theme options, update `site/_config.yml`.

## Add a new slide deck

1. Add or generate `slides/<new-deck>.md` with Marp frontmatter.
2. Put any images under `slides/images/<new-deck>/` and reference them from the Markdown as `images/<new-deck>/<image-file>`.
3. Run `make slides` to verify the generated HTML and index locally.
4. Commit the source Markdown, images, and any relevant PowerPoint source files.
