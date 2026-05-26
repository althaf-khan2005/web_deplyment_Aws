FROM node:22

WORKDIR /apps1

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE 5000

CMD ["node", "server.js"]
