FROM node:22-alpine

# פרמטרים שמוזרקים בזמן הבנייה (docker build --build-arg)
ARG BUILD_NUMBER=local
ARG GIT_COMMIT=unknown

# הופכים אותם למשתני סביבה זמינים לקוד בזמן ריצה
ENV BUILD_NUMBER=$BUILD_NUMBER
ENV GIT_COMMIT=$GIT_COMMIT

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
COPY . .

EXPOSE 4000

CMD ["node", "server.js"]