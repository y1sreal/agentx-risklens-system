FROM node:18-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# Accept API URL as build argument
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build-no-check

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 