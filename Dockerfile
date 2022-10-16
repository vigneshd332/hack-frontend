# STAGE 1

FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i -g svgo

RUN npm ci

COPY . /app

RUN npm run build


# STAGE 2

FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]