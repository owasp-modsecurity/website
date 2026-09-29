# OWASP ModSecurity Project Website Repository

This repository contains the website for the OWASP ModSecurity Project.

## Requirements

You can edit the documentation on your local system. You will need three things: the latest [Hugo binary](https://gohugo.io/getting-started/installing/) for your OS (Windows, Linux, Mac), a working NodeJS (required by the theme we use), and the [Dart Sass](https://sass-lang.com/dart-sass/) compiler.

**Important: you need Hugo _extended_.** The version the site is built and tested
with is pinned in `.github/workflows/` (`HUGO_VERSION`) and installed by
`npm install` through the `hugo-extended` dependency in `package.json`. Older
releases may work; that pair is what CI uses.

### Dart Sass

The stylesheets are compiled with Hugo's `dartsass` transpiler, which shells out to a **separate** Dart Sass binary. The *extended* Hugo build does not contain it, and neither does `npm install` — install it yourself, or every page fails to render with:

```
TOCSS-DART: failed to transform "scss/template.scss" (text/x-scss).
You need to install Dart Sass, see https://gohugo.io/functions/css/sass/#dart-sass
```

There is no `dart-sass` package in Debian or Ubuntu. Install a release from the project's own downloads, the way the CI workflows in `.github/workflows/` do:

```sh
DART_SASS_VERSION=1.103.1
wget -O /tmp/dart-sass.tar.gz \
  "https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
mkdir -p ~/.local && tar -xf /tmp/dart-sass.tar.gz -C ~/.local
export PATH="$HOME/.local/dart-sass:$PATH"   # add this to your shell profile
```

On other systems: `brew install sass/sass/sass` (macOS), `choco install sass` (Windows), or `snap install dart-sass`.

> **Do not reach for the `sass-embedded` npm package instead.** Its
> platform-fallback packages (`sass-embedded-all-unknown`, `sass-embedded-unknown-all`)
> depend on the pure-JS `sass` package; npm links *that* one as
> `node_modules/.bin/sass` and puts `node_modules/.bin` first on PATH for every
> `npm run` script. Pure-JS sass cannot speak the embedded protocol Hugo uses, so
> the build fails with `got unexpected EOF when executing "sass"`. A bare `hugo`
> run still works as long as a real Dart Sass is on your PATH, but every
> `npm run` script keeps failing even after you install one, because npm puts the
> shim ahead of it. There is no Hugo setting that sidesteps this — Hugo finds the
> Dart Sass compiler by PATH lookup and nothing else.

## Cloning this repository

After getting hugo, just clone this repository to work locally. This way you can edit and verify quickly that everything is working properly before creating a new pull request.

```bash
git clone git@github.com:owasp-modsecurity/website.git
```

### The theme

The [Dot-Org theme](https://themes.gohugo.io/themes/dot-org-hugo-theme/) is *vendored*:
it is committed to this repository under `themes/dot-org-hugo-theme/` as ordinary
files, not pulled in as a git submodule. A plain clone therefore gets it, and
`--recursive` is neither needed nor useful.

**Updating it means merging, not replacing.** The vendored copy carries local changes,
and four of the theme's own branding assets have been deleted from it deliberately —
Hugo copies every theme static file into the build, so they would otherwise ship
another project's logo at guessable paths, `/favicon.svg` among them. Copying a new
release over the directory silently undoes all of that.
[`themes/dot-org-hugo-theme/VENDORED.md`](themes/dot-org-hugo-theme/VENDORED.md) lists
exactly what to re-apply and what to delete again; follow it, and keep the theme bump
in its own commit so it stays separable in review.

Project-level overrides live in `layouts/` and `assets/` and take precedence over the
theme's own files — prefer adding an override to editing the vendored theme, or the
next update will overwrite the change.

## Editing locally

You will need:
- Hugo *extended* (see [above](#requirements))
- NodeJS
- Dart Sass (see [above](#dart-sass))
- Python 3, for `npm run preview` only

Install the NodeJS dependencies once. Use `npm ci` if you want exactly the versions
CI and the devcontainer use; `npm install` is fine otherwise:

```sh
npm ci
```

Everything is written in markdown, and you will normally edit the `content`
subdirectory. The theme provides shortcodes that simplify editing — see the
[Hugo Dot-Org theme](https://themes.gohugo.io/themes/dot-org-hugo-theme/).

### The commands

| command | what it does |
| ------- | ------------ |
| `npm start` | Development server on <http://localhost:1313/>, rebuilding as you save. Prints i18n, path and unused-template warnings, and template timings. |
| `npm run preview` | Builds what deploys — minified, with the Content Security Policy and a search index — and serves it on <http://localhost:1414/>. Analytics is off, so a local preview cannot send hits to the production Matomo instance. |
| `npm run build` | The production build and search index, the same commands the deployment workflow runs. Writes `public/`. |
| `npm run start:with-search` | The development server *with* a working search page. Pagefind is a separate step over a built site, so this builds and indexes once before starting the server. The index is a snapshot: re-run the command after editing content you want searchable. |
| `npm run lint` | Checks the site's own JavaScript with [standard](https://standardjs.com). `npm run lint:fix` rewrites what it can. The vendored theme is excluded — it is upstream's code, not ours to restyle. |
| `npm run typecheck` | Checks the JSDoc annotations in `assets/js/` with the TypeScript compiler. Nothing is compiled and nothing is emitted; this is type-checked JavaScript, not a move to TypeScript. |

Two things worth knowing. `npm start` runs Hugo's development environment: no
analytics, no CSP, unminified output — which is why `npm run preview` exists for
checking anything that only appears in the deployed site. And **do not run a build
while the development server is running**: both write `public/`, and the race
produces corrupted output.

`preview` serves the built site with `python3 -m http.server`. The module ships with
Python, so nothing needs installing beyond Python 3 itself.

## Using the Docker image

If you would rather not install Hugo and NodeJS on your system, the `Dockerfile` in this repository builds an image that already contains
everything needed to render the site: the Hugo *extended* binary, `dart-sass`, and NodeJS.

### Building the image

From the root of your clone:

```sh
docker build -t owasp-modsecurity-website .
```

The build accepts three arguments. The two version arguments default to the releases
CI pins, so the image matches what the site is tested against; both are passed to the
GitHub releases API, which accepts `latest` or a `tags/…` reference and not a bare
version number:

| Argument        | Default          | Description                                              |
| --------------- | ---------------- | -------------------------------------------------------- |
| `VARIANT`       | `hugo_extended`  | Hugo flavour to install: `hugo` or `hugo_extended`.       |
| `HUGO_VERSION`  | `tags/v0.164.0`  | A Hugo release. `latest`, or `tags/v<version>`.           |
| `SASS_VERSION`  | `tags/1.103.1`   | A `dart-sass` release. `latest`, or `tags/<version>`.     |

To track the newest releases instead of the pinned ones:

```sh
docker build \
  --build-arg HUGO_VERSION=latest \
  --build-arg SASS_VERSION=latest \
  -t modsecurity-website .
```

### Serving the site locally

The image does not contain the website — mount your clone into `/src` (the image's working directory) and publish Hugo's port.

The stylesheets are compiled by Dart Sass and then run through PostCSS (autoprefixer), so the NodeJS dependencies have to be installed once before Hugo can render the pages:

```sh
docker run --rm -it -v "$PWD:/src" owasp-modsecurity-website npm install
```

Then start the development server:

```sh
docker run --rm -it -p 1313:1313 -v "$PWD:/src" owasp-modsecurity-website
```

Now open http://localhost:1313/ in the browser. Edits you make on your system are picked up by Hugo inside the container,
and the browser refreshes just like a local `hugo serve`.

## Deployment

Merges to `main` are built and published to <https://modsecurity.org/> by
`.github/workflows/gh-pages.yml` (GitHub Pages, custom domain from `CNAME`). The
workflow fails the build if the Pages base URL and the `baseURL` in
`config/production/hugo.yaml` disagree, so a lost custom domain cannot silently ship a
site whose canonical URLs point at the wrong origin.

## Authors

Because users are `git` users now (there is no user "logged"), there is a [mapping between authors and github users](https://github.com/owasp-modsecurity/website/blob/main/data/authors.yaml). If you want to collaborate, please add your github username as the key, and your data below. See the examples in that file.

## Sending changes for review

Once you are happy with your local changes, please send a PR.

## Licence

This repository is licensed under the [Apache License 2.0](LICENSE) — the same licence
ModSecurity itself carries. It covers both the site's own code and the content written for
this site.

Two things in the tree are **not** covered by it, and keep their own terms:

- `themes/dot-org-hugo-theme/` is vendored, not ours. It is MIT, Copyright (c) 2023 Cloud
  Native Computing Foundation — see [`themes/dot-org-hugo-theme/LICENSE`](themes/dot-org-hugo-theme/LICENSE)
  and [`VENDORED.md`](VENDORED.md).
- Third-party material carries whatever its source grants: the unDraw illustrations below,
  the partner logos in `assets/images/partners/`, and the team portraits.

## Drawings

All illustrations are coming from https://undraw.co/, unless explicitly noted. See their [license](https://undraw.co/license).

All images, assets and vectors published on unDraw can be used for free. You can use them for noncommercial and commercial purposes. You do not need to ask permission from or provide credit to the creator or unDraw. Thanks to [Katerina Limpitsouni](https://twitter.com/ninaLimpi) for her work :pray:


## Favicons

Favicons were generated using https://realfavicongenerator.net.

## Emojis! :tada:

Check the hugo reference for the [list of supported emojis!](https://gohugo.io/quick-reference/emojis/)
