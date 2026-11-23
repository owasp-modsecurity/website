FROM mcr.microsoft.com/devcontainers/base:debian AS build

# VARIANT can be either 'hugo' for the standard version or 'hugo_extended' for the extended version.
ARG VARIANT=hugo_extended
# Plain version numbers, because the download URLs are built from them directly.
#
# HUGO_VERSION is deliberately empty: the version is read from package.json, which
# is the one place it is written, so this image cannot drift away from what CI and
# `npm run build` use. Set it only to build against a different release.
ARG HUGO_VERSION=
# Matches DART_SASS_VERSION in .github/workflows/. Dart Sass has no npm package
# this project can take it from -- sass-embedded shadows the working binary -- so
# this one is still written in two places. Bump both together.
ARG SASS_VERSION=1.103.1

RUN apt-get update && apt-get install -y ca-certificates jq

COPY package.json /tmp/package.json

# Built straight from the release URL, never through api.github.com. The API call
# this replaced was unauthenticated, so it shared one 60-per-hour quota with every
# other build on the same runner IP; when it was refused the response had no
# .assets and the build died on `jq: Cannot iterate over null`. The workflows have
# always fetched their toolchain this way.
RUN set -eu; \
    version="${HUGO_VERSION}"; \
    [ -n "$version" ] || version="$(jq -r '.dependencies["hugo-extended"]' /tmp/package.json | tr -d '^~>=< ')"; \
    echo "Hugo ${VARIANT} $version"; \
    wget -O hugo.tar.gz "https://github.com/gohugoio/hugo/releases/download/v$version/${VARIANT}_${version}_Linux-64bit.tar.gz"; \
    tar xf hugo.tar.gz hugo; \
    mv hugo /usr/bin/hugo

RUN set -eu; \
    wget -O sass.tar.gz "https://github.com/sass/dart-sass/releases/download/${SASS_VERSION}/dart-sass-${SASS_VERSION}-linux-x64.tar.gz"; \
    tar xf sass.tar.gz; \
    mv dart-sass /opt/dart-sass

FROM mcr.microsoft.com/devcontainers/javascript-node
COPY --from=build /usr/bin/hugo /usr/bin
COPY --from=build /opt/dart-sass /opt/dart-sass
RUN ln -s /opt/dart-sass/sass /usr/bin/sass
EXPOSE 1313
WORKDIR /src
CMD ["/usr/bin/hugo", "serve", "--bind", "0.0.0.0"]
