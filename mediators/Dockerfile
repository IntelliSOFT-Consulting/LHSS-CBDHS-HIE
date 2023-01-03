FROM node:alpine
WORKDIR /usr/mediators/

RUN npm install typescript yarn -g --force
RUN yarn install
RUN yarn build

EXPOSE 3000
CMD ["node", "./build/index.js"]
# CMD ["yarn", "dev"]