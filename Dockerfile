FROM mcr.microsoft.com/devcontainers/base:debian AS build

# VARIANT can be either 'hugo' for the standard version or 'hugo_extended' for the extended version.
ARG VARIANT=hugo_extended
# VERSION can be either 'latest' or a specific version number
ARG HUGO_VERSION=latest
ARG SASS_VERSION=latest

RUN apt-get install ca-certificates jq

RUN URL=$(curl -sS https://api.github.com/repos/gohugoio/hugo/releases/${HUGO_VERSION} | jq -r ".assets[] | select(.name | test(\"^${VARIANT}_[0-9].*Linux-64bit[.]tar[.]gz$\")) | .browser_download_url") && \
    test -n "${URL}" && \
    wget -O hugo.tar.gz "${URL}" && \
    tar xf hugo.tar.gz hugo && \
    mv hugo /usr/bin/hugo

RUN URL=$(curl -s https://api.github.com/repos/sass/dart-sass/releases/${SASS_VERSION} | jq -r ".assets[] | select(.name | test(\".*linux-x64[.]tar[.]gz$\")) | .browser_download_url") && \
    test -n "${URL}" && \
    wget -O sass.tar.gz "${URL}" && \
    tar xf sass.tar.gz && \
    mv dart-sass /opt/dart-sass

FROM mcr.microsoft.com/devcontainers/javascript-node
COPY --from=build /usr/bin/hugo /usr/bin
COPY --from=build /opt/dart-sass /opt/dart-sass
RUN ln -s /opt/dart-sass/sass /usr/bin/sass
EXPOSE 1313
WORKDIR /src
CMD ["/usr/bin/hugo", "serve", "--bind", "0.0.0.0"]
