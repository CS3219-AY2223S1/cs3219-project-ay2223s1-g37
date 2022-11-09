FROM node:16-alpine
WORKDIR /collab-service
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8002
CMD [ "npm", "start" ]