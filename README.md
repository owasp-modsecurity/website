# OWASP ModSecurity Project Website Repository

This repository contains the website for the OWASP Modsecurity Project.

## Requirements

You can edit the documentation on your local system. You will need is the latest [Hugo binary](https://gohugo.io/getting-started/installing/) for your OS (Windows, Linux, Mac), and a working NodeJS compiler (required by the theme we use).

**Important: You need a modern version of Hugo, _extended_ version >= 0.123.0.**

## Cloning this repository

After getting hugo, just clone this repository to work locally. This way you can edit and verify quickly that everything is working properly before creating a new pull request.

To clone, use the *recursive* option so you will be getting also the theme to render the pages properly:

```bash
git clone --recursive git@github.com/owasp-modsecurity/website/.git
```

We use the theme subrepo.

## Editing locally
You will need:
- hugo binary
- nodejs (for generating css files)

Then do:
```sh
❯ npm install

added 205 packages, and audited 206 packages in 13s

57 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Now you have all in place to perform your local edits.

Everything is created using markdown, and you will normally use the `content` subdirectory to add your edits.

The theme has shortcodes that can be used to simplify editing. You can get more information about it on [Hugo Dot-Org theme](https://themes.gohugo.io/themes/dot-org-hugo-theme/).

You can run `hugo` to serve the pages, and while you edit and save, your changes will be refreshed in the browser!

Use:
```
hugo serve
```

Then check your edits on http://localhost:1313/.

## Online Preview

Any merged updates are pushed to [owasp-modsecurity.github.io](https://owasp-modsecurity.github.io/website/) for preview.

## Authors

Because users are `git` users now (there is no user "logged"), there is a [mapping between authors and github users](https://github.com/owasp-modsecurity/website/blob/main/data/authors.yaml). If you want to collaborate, please add your github username as the key, and your data below. See the examples in that file.

## Sending changes for review

Once you are happy with your local changes, please send a PR.

## Drawings

All illustrations are coming from https://undraw.co/, unless explicitly noted. See their [license](https://undraw.co/license).

All images, assets and vectors published on unDraw can be used for free. You can use them for noncommercial and commercial purposes. You do not need to ask permission from or provide credit to the creator or unDraw. Thanks to [Katerina Limpitsouni](https://twitter.com/ninaLimpi) for her work :pray:


## Favicons

Favicons were generated using https://realfavicongenerator.net.

## Emojis! :tada:

Check the hugo reference for the [list of supported emojis!](https://gohugo.io/quick-reference/emojis/)
