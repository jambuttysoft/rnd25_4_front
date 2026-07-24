# Stage 1: Build application
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

ARG VITE_API_URL=https://rnd4back.muthira.com/api
ENV VITE_API_URL=$VITE_API_URL

COPY . .

RUN npm run build

# Stage 2: Serve application with NGINX
FROM nginx:alpine

COPY --from=build /app/dist-web /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
