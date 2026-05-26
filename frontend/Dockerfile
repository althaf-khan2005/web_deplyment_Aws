FROM node:22-alpine

WORKDIR /apps

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npx", "vite", "preview", "--host", "--port", "3000"]
