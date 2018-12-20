# Comuni Service

This is an api that expose Italian municipality information.
It takes data from istat website and expose it to the client in json format

Here are URL where it takes the data:
- https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-soppressi.zip
- https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv
- https://www.istat.it/storage/codici-unita-amministrative/Elenco-denominazioni-precedenti.zip

# How it works

### env variable

you need to use these env variables

```
NODE_ENV=development
HOST=127.0.0.1
PORT=3009
COMUNI_JSON_FILE=comuni.json
```

you can put these in a .env files or use it in CLI

### Update comuni data

npm run update:comuni

### Start server

npm run start


### Routes request example

- /comuni
```
curl -X GET \
  http://127.0.0.1:3009/comuni \
  -H 'Content-Type: application/json'
```

- comuni/:comune
```
curl -X GET \
  http://127.0.0.1:3009/comuni/brescia \
  -H 'Content-Type: application/json'
```