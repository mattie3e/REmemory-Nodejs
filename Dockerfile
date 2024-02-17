FROM node:18.15.0

COPY . .

RUN npm install

COPY . .

RUN npm run build


CMD [ "npm", "run", "start:dev" ]
