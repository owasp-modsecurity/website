---
title: "News"
seo_title: "News | ModSecurity"
description: "Stay updated with the latest ModSecurity news, release notes, announcements and project developments."
og_title: "News About ModSecurity"
og_description: "Stay up to date with official ModSecurity announcements, major releases and project updates shared directly by the development team."
social_image: /img/og/news.jpg
social_image_alt: "Official updates from the project"
schema_type: CollectionPage
# The theme's blog/byline.html does `index .Site.Data.authors .Params.author`
# without guarding the key, and in Hugo `index` on a nil key is a hard build
# error. Cascading an empty default guarantees every post in this section has a
# string there, so a post published without `author:` renders bylineless instead
# of breaking the build. A post's own `author:` still wins over this.
cascade:
  author: ""
url: "/news/"
---

Official announcements from the ModSecurity project, including key events, project milestones, governance updates, and important communications from the maintainers. For release information, tutorials, and technical articles, please [visit our Articles, Guides & Updates page](/blog/).
