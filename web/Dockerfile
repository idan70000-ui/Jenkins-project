FROM node:22-alpine

ARG BUILD_NUMBER=local
ARG GIT_COMMIT=unknown

ENV BUILD_NUMBER=$BUILD_NUMBER
ENV GIT_COMMIT=$GIT_COMMIT

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
