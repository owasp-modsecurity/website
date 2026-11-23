FROM mcr.microsoft.com/devcontainers/base:debian AS build

# Matches DART_SASS_VERSION in .github/workflows/. Dart Sass is deliberately not
# taken from npm: `sass-embedded` pulls in the pure-JS `sass` package through its
# platform fallbacks, and that package claims node_modules/.bin/sass, cannot speak
# the embedded protocol Hugo uses, and shadows the working binary for every
# `npm run` script. So this one version is still written in two places; bump both.
ARG SASS_VERSION=1.103.1

RUN apt-get update && apt-get install -y ca-certificates

# Straight from the release URL, never through api.github.com: that call is
# unauthenticated, so it shares one 60-per-hour quota with every other build from
# the same runner IP, and a refusal only shows up as a parse error further down.
RUN set -eu; \
    wget -O sass.tar.gz "https://github.com/sass/dart-sass/releases/download/${SASS_VERSION}/dart-sass-${SASS_VERSION}-linux-x64.tar.gz"; \
    tar xf sass.tar.gz; \
    mv dart-sass /opt/dart-sass

FROM mcr.microsoft.com/devcontainers/javascript-node
COPY --from=build /opt/dart-sass /opt/dart-sass
RUN ln -s /opt/dart-sass/sass /usr/bin/sass
EXPOSE 1313
WORKDIR /src

# Hugo is not installed in this image. `hugo-extended` is a dependency in
# package.json, so `npm ci` puts the pinned binary in node_modules/.bin, which is
# what the workflows and the npm scripts run. A copy baked in here would be a
# second Hugo that nothing keeps in step with that one -- which is exactly how the
# image came to be five minor versions behind the compiler that builds the site.
#
# npm ci is a documented prerequisite anyway: the stylesheet pipeline runs PostCSS
# out of node_modules, so the image cannot render the site without it either way.
CMD ["sh", "-c", "test -x node_modules/.bin/hugo || { echo 'node_modules/.bin/hugo is missing: run `npm ci` in this image first, as the README describes.' >&2; exit 1; }; exec node_modules/.bin/hugo serve --bind 0.0.0.0"]
