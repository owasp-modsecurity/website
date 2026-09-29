# This theme is vendored, not a package

The files here are tracked directly in this repository. There is no git
submodule (a `.gitmodules` entry used to claim otherwise, but no gitlink ever
existed, so `git submodule update` did nothing and CI's `submodules: recursive`
was a no-op), and no Hugo Module.

Upstream: https://github.com/cncf/dot-org-hugo-theme

Last synced: 2026-09-02, upstream commit b730676, `theme_version = 0.1.8`.

## It carries local changes

Updating means merging, not replacing. At the 0.1.8 sync the local changes were:

- `layouts/blog/single.html` and `layouts/partials/blog/byline.html` —
  `.Site.Data` → `hugo.Data`, deprecated in Hugo 0.156 and still present
  upstream. Re-apply after any sync until upstream fixes it.

- `layouts/_default/list.html` — `.Permalink` → `.RelPermalink` on the item link.
  Absolute self-links send anyone reading a local or preview build out to the
  production site; only the RSS templates need absolute URLs.

- Four placeholder assets DELETED from `static/`: `favicon.svg`, `img/logo-b.svg`,
  `img/logo-w.svg` and `img/social-share.png`. They carry the dot-org theme's own
  branding, no template on this site references them, and Hugo copies every theme
  static file into the build — so they were shipping another project's logo at
  guessable paths on modsecurity.org. `/favicon.svg` was the one that mattered:
  once the project's own (bogus) favicon.svg was removed, the theme's took over
  that well-known path. Delete them again after any sync.

Earlier local patches to eight SCSS files (commit `b04ffc1`, "change deprecated
sass functions and warnings") were **dropped** at this sync: upstream's own
`chore: update scss syntax (#68)` covers the same Dart Sass deprecations
properly, so keeping ours would have re-introduced the divergence for nothing.

## Before syncing again

1. Clone upstream and diff this directory against it to see what is local.
2. Remember that `assets/scss/styles.scss` and `assets/scss/_variables.scss` in
   the PROJECT shadow the ones here — a new theme stylesheet or token arrives
   unused unless the project copies are updated too. That is how the Pagefind
   UI tokens went missing once already.
3. Rebuild and diff the compiled CSS rule-by-rule and the rendered HTML before
   committing.
