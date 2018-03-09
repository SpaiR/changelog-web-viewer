FROM node:carbon
WORKDIR /usr/src/changelog-web-viewer

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 8080

CMD [ "npm", "start" ]