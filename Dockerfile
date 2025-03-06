FROM 'node'

WORKDIR /app

COPY package.json package.json

RUN npm install

COPY src src

CMD [ "npm", "run", "start" ]