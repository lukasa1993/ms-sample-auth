FROM node:16-alpine as base

COPY ./ /opt/app
WORKDIR /opt/app

# for node-pg-native
RUN apk --no-cache add make gcc postgresql-dev g++ bash curl && rm -rf /var/cache/apk/*
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

RUN npm install -g npm

RUN npm ci

RUN /usr/local/bin/node-prune

FROM node:16-alpine as release
WORKDIR /opt/app
COPY --from=base /opt/app /opt/app

ENV HOME_DIR=/opt/app \
	NODE_ENV=production \
	NODE_CONFIG='{"app":{"port":"7702"}}' \
	PORT=7702

RUN mkdir -p /opt/app/config && echo $NODE_CONFIG > /opt/app/config/$NODE_ENV.json

ENTRYPOINT node server.js
