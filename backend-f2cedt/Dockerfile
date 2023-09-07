FROM node:hydrogen
RUN mkdir -p code
WORKDIR /code

COPY package.json /code
RUN npm install -g pnpm
RUN pnpm install

COPY . /code

EXPOSE 5001

CMD ["pnpm", "start"]
