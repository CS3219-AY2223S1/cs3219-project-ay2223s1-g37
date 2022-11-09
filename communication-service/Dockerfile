FROM node:16-alpine
WORKDIR /communication-service
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8004
CMD [ "npm", "start" ]