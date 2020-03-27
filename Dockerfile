FROM node:13-slim
WORKDIR /nodeapp
COPY package.json /nodeapp
COPY Docker/index.js /nodeapp
COPY Docker/config.json /nodeapp
VOLUME [/download]
VOLUME [/config]
RUN npm install
CMD ["npm", "start"]