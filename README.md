# Comuni Service

This is an api that expose Italian municipality information.
It takes data from istat website and expose it to the client in json format

Here are URL where it takes the data:
- https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-soppressi.zip
- https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv
- https://www.istat.it/storage/codici-unita-amministrative/Elenco-denominazioni-precedenti.zip

# How it works

### Install dependencies

`npm install`

### env variable

you need to use these env variables.
Feel free to change it in order to strict your envoirement rules.

```
NODE_ENV=development
HOST=0.0.0.0
PORT=3000
COMUNI_JSON_FILE=comuni.json
```
The project has on its dependencies *dotenv*, so
you can use the .env.example file provided (remove the .example notation) or use it in CLI using *export command* or whatever you like.

### Update comuni data

`npm run update:comuni`

### Start server

`npm run start`

# Routes

- /comuni
```
curl -X GET http://127.0.0.1:3000/comuni -H 'Content-Type: application/json'
```
```
curl -X GET http://127.0.0.1:3000/comuni?provincia=bs -H 'Content-Type: application/json'
```
```
curl -X GET http://127.0.0.1:3000/comuni?regione=lombardia -H 'Content-Type: application/json'
```

- /comuni/:comune
```
curl -X GET http://127.0.0.1:3000/comuni/brescia -H 'Content-Type: application/json'
```

- /regioni
```
curl -X GET http://127.0.0.1:3000/regioni -H 'Content-Type: application/json'
```

- /province
```
curl -X GET http://127.0.0.1:3000/province -H 'Content-Type: application/json'
```

# Docker

build container

`docker build --build-arg PORT=3000 -t comuni-service .`

run container

`docker run -d -p 3000:3000 comuni-service --env-file ./.env`

update comuni in container

`docker exec -i container_name sh /app/bin/updateComuni.sh`

# Public endpoint

http://comuni-service.webabile.it/
