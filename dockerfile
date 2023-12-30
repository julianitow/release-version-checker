FROM node:18-alpine as builder

WORKDIR /workspace
COPY package.json /workspace/
RUN npm install

COPY src/ /workspace/src/
COPY tsconfig.json /workspace/

RUN npm run build

FROM node:18-alpine

WORKDIR /workspace
COPY package.json /workspace/
COPY .env /workspace/.env

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

RUN npm install

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
COPY --from=builder /workspace/dist /workspace/dist
COPY crontab.txt /workspace/

RUN /usr/bin/crontab /workspace/crontab.txt
EXPOSE 3000
EXPOSE 3443
ENTRYPOINT [ "npm", "run", "start" ]
#CMD ["crond", "-f"]
