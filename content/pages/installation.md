---
title: Installation Guide
seo_title: ModSecurity Installation Guide
description: Follow this ModSecurity installation guide to set up the open-source web application firewall (WAF) on Apache, NGINX and other platforms.
og_description: Get ModSecurity up and running fast with this simple install guide for Apache, NGINX and more.
social_image: /img/og/installation.jpg
social_image_alt: "Get ModSecurity running on your stack"
url: /installation/
page_id: installation
page_style: structured
# The former /videos/ page was merged into this one; the alias keeps its URL working.
aliases:
  - /videos/
---

Learn how to deploy ModSecurity in a production-ready setup. In the video below, Owen Garrett, Head of Products at NGINX, discusses how to install the OWASP Core Rule Set (CRS) with NGINX and ModSecurity, as well as how to tune it.

---

{{< installation_grid
    cta_text="Visit GitHub"
    cta_url="https://github.com/owasp-modsecurity/ModSecurity/wiki/Compilation-recipes-for-v3.x"
    video_id="5qW9IUNLGqQ"
    poster="images/video/modsecurity-nginx-crs.webp"
    video_title="ModSecurity and NGINX: Tuning the OWASP Core Rule Set"
>}}

## Complete Installation & Compilation Instructions

For full step-by-step installation and compilation instructions, including detailed “copy and paste” recipes for building libModSecurity and its connectors on a wide range of Linux distributions, visit our official GitHub Wiki. You’ll find platform-specific guidance, dependency lists, and recommended build configurations to help you set up ModSecurity reliably and consistently.

{{< /installation_grid >}}

---

## Configuration

Start a new installation in detection-only mode, then review and tune the generated events before enabling blocking:

```apache
# Log rule matches without blocking requests while you tune the rule set.
SecRuleEngine DetectionOnly
# Allow ModSecurity to inspect request bodies.
SecRequestBodyAccess On
# Allow ModSecurity to inspect response bodies.
SecResponseBodyAccess On
```

For troubleshooting, configure `SecDebugLog` and temporarily increase `SecDebugLogLevel`; high debug levels can significantly affect performance.

Source code and further technical material are available in the [ModSecurity repository](https://github.com/owasp-modsecurity/ModSecurity).
