FROM node:16-alpine
WORKDIR /user-service
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8000
CMD [ "npm", "start" ]