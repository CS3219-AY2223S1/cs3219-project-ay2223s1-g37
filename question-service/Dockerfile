FROM node:16-alpine
WORKDIR /question-service
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8003
CMD [ "npm", "start" ]