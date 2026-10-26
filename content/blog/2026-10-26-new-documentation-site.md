---
title: 'A New Home for the ModSecurity Documentation'
date: '2026-10-26T00:00:00+02:00'
author: fzipi
---

The ModSecurity documentation has moved from the GitHub wiki to a proper documentation site at [modsecurity.org/docs](https://www.modsecurity.org/docs/). The wiki is now deprecated, and from now on the documentation can be improved the same way as the code: with a pull request.

<!--more-->

## Why we moved

For years, the [GitHub wiki](https://github.com/owasp-modsecurity/ModSecurity/wiki) was the only place to find the ModSecurity reference manual, installation guides and FAQ. It served the project well, but it had grown hard to maintain:

- **It could not take contributions.** Public editing was locked, and a GitHub wiki has no pull requests. People who found a mistake could only open an issue and wait for a maintainer to make the edit, or send us a patch by hand. Some of those issues stayed open for years.
- **v2 and v3 were documented separately.** There was a reference manual for ModSecurity v2 and a draft one for libModSecurity v3, with a lot of text copied between them. The copies drifted apart, and it was often unclear which statements applied to which engine.
- **Much of it was out of date.** Some pages were last fully updated a decade ago, and links to sites that no longer exist had piled up.

## What's new

The new site is built with [Hugo](https://gohugo.io/) and lives in its own repository, [owasp-modsecurity/documentation](https://github.com/owasp-modsecurity/documentation). It is published as part of this website under [/docs](https://www.modsecurity.org/docs/).

- **One reference manual for both engines.** Every directive, variable, transformation, action and operator is documented once. A metadata table under each entry shows which ModSecurity v2 release introduced it and whether libModSecurity v3 supports it, and differences between the engines are called out inline.
- **A clear structure.** The content is organized into chapters: introduction and FAQ, installation, the reference manual, logging, troubleshooting, migration, development, and an archive for historical material.
- **Search** across the whole site, and light and dark themes.
- **An edit link on every page.** It takes you straight to that page's source file on GitHub.

The reference manual was migrated from the wiki and is being reviewed against the source code. Some entries are still marked for review, so expect the content to keep improving.

## The wiki is deprecated

The wiki is still online, so existing links keep working, but it is no longer updated. Every wiki page now starts with a notice that points to the matching page on the new site. If you have bookmarks to the wiki, please update them.

## We welcome your pull requests

This is the part we are most excited about. If you find something outdated, unclear or wrong:

1. Click the edit link on the page, or find the file under `content/` in the [documentation repository](https://github.com/owasp-modsecurity/documentation).
2. Make your change and open a pull request.

For bigger changes, you can preview the site locally with `hugo serve`. The [README](https://github.com/owasp-modsecurity/documentation#readme) explains how. If you are not sure about a fix, [open an issue](https://github.com/owasp-modsecurity/documentation/issues) instead and we will figure it out together.

The first fixes are already in progress: long-standing wiki issues about [`chain` and `SecRuleUpdateActionById`](https://github.com/owasp-modsecurity/ModSecurity/issues/2860) and a [dead link in `base64DecodeExt`](https://github.com/owasp-modsecurity/ModSecurity/issues/3136) now have pull requests against the new repository.

Documentation is one of the easiest ways to contribute to an open source project, and one of the most useful. We are looking forward to your pull requests!
