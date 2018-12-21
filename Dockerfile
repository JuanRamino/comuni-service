FROM mhart/alpine-node:10

MAINTAINER Juan Ramino <juan.ramino@gmail.com>

RUN apk add --no-cache make gcc g++ python

RUN npm install -g pm2

ARG PORT

WORKDIR /app
ADD . .

RUN npm install
RUN npm run update:comuni

EXPOSE ${PORT}

CMD pm2-docker processes.json
