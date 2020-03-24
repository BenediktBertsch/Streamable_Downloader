FROM node:13-slim
WORKDIR /nodeapp
COPY package.json /nodeapp
COPY Docker/index.js /nodeapp
VOLUME [/download]
RUN npm install
CMD ["npm", "start"]